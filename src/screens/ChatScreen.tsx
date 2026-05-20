import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform,
  SafeAreaView
} from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { useChatStore } from '../store/chatStore';
import { wsManager } from '../services/websocket';

export default function ChatScreen({ navigation }: any) {
  const { messages, isThinking, addMessage, setIsThinking } = useChatStore();
  const [inputText, setInputText] = useState('');
  const [recording, setRecording] = useState<Audio.Recording | undefined>();
  const [permissionResponse, requestPermission] = Audio.usePermissions();

  useEffect(() => {
    wsManager.connect();
  }, []);

  // Monitor incoming assistant messages to speak them aloud
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        Speech.speak(lastMessage.content, {
          language: 'en-US',
          pitch: 0.9, // Slightly deeper, more ethereal voice
          rate: 0.95,
        });
      }
    }
  }, [messages]);

  const handleSendText = (text: string = inputText) => {
    if (!text.trim()) return;
    
    addMessage({ role: 'user', content: text });
    setIsThinking(true);
    setInputText('');
    
    wsManager.sendMessage(text);
  };

  async function startRecording() {
    try {
      if (permissionResponse && permissionResponse.status !== 'granted') {
        await requestPermission();
      }
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    setRecording(undefined);
    if (!recording) return;

    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    
    const uri = recording.getURI();
    console.log('Recording stored at', uri);
    
    // MOCK STT: In a real app, send the audio URI to a backend Whisper API.
    // Here we simulate the transcription result.
    const mockTranscription = "Megha, what do you see right now?";
    handleSendText(mockTranscription);
  }

  const renderMessage = ({ item }: { item: any }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.meghaBubble]}>
        <Text style={[styles.messageText, isUser ? styles.userText : styles.meghaText]}>
          {item.content}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <View style={{ width: 30 }} />
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.headerTitle}>MEGHA</Text>
            <Text style={styles.headerSubtitle}>Soul Engine Online</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={{ width: 30 }}>
            <Text style={{ fontSize: 20 }}>⚙️</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatList}
          inverted={false}
        />

        {isThinking && (
          <View style={styles.thinkingIndicator}>
            <Text style={styles.thinkingText}>Megha is gathering the storm...</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Speak to the storm..."
            placeholderTextColor="#8a94a6"
            multiline
          />
          
          <TouchableOpacity 
            style={[styles.iconButton, recording && styles.recordingButton]}
            onPress={recording ? stopRecording : startRecording}
          >
            <Text style={styles.iconText}>{recording ? '⏹️' : '🎤'}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.iconButton, styles.sendButton]} 
            onPress={() => handleSendText(inputText)}
          >
            <Text style={styles.iconText}>⚡</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a0d14',
  },
  container: {
    flex: 1,
    backgroundColor: '#0a0d14',
  },
  header: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1a2235',
    alignItems: 'center',
    backgroundColor: '#0d111a',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
    textShadowColor: '#4d4dff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  headerSubtitle: {
    color: '#4d4dff',
    fontSize: 12,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  chatList: {
    padding: 15,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 14,
    borderRadius: 18,
    marginBottom: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#1a2235',
    borderWidth: 1,
    borderColor: '#2a3655',
    borderBottomRightRadius: 4,
  },
  meghaBubble: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(25, 25, 45, 0.7)',
    borderWidth: 1,
    borderColor: '#3a3a7a',
    borderBottomLeftRadius: 4,
    shadowColor: '#4d4dff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#e2e8f0',
  },
  meghaText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  thinkingIndicator: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  thinkingText: {
    color: '#4d4dff',
    fontStyle: 'italic',
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    backgroundColor: '#0d111a',
    borderTopWidth: 1,
    borderTopColor: '#1a2235',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#151b2b',
    color: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    marginRight: 10,
    fontSize: 16,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#2a3655',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a2235',
    marginLeft: 8,
  },
  recordingButton: {
    backgroundColor: 'rgba(255, 77, 77, 0.2)',
    borderColor: '#ff4d4d',
    borderWidth: 1,
  },
  sendButton: {
    backgroundColor: 'rgba(77, 77, 255, 0.2)',
    borderWidth: 1,
    borderColor: '#4d4dff',
  },
  iconText: {
    fontSize: 18,
  }
});
