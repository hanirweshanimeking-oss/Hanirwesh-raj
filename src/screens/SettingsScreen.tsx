import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useChatStore } from '../store/chatStore';

export default function SettingsScreen({ navigation }: any) {
  const { clearMessages } = useChatStore();

  const handleClearChat = () => {
    Alert.alert(
      "Clear Memory",
      "Are you sure you want to clear the conversation history?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear", 
          style: "destructive",
          onPress: () => {
            clearMessages();
            navigation.goBack();
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.backButton} /> {/* Spacer */}
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Configuration</Text>
          <Text style={styles.description}>
            The Anthropic API Key is managed securely on your local Proxy server. Ensure the server is running at http://localhost:3000.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Memory</Text>
          <TouchableOpacity style={styles.dangerButton} onPress={handleClearChat}>
            <Text style={styles.dangerButtonText}>Clear Conversation History</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>Megha Storm Goddess AI v1.0.0</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0d14',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a2235',
  },
  backButton: {
    width: 60,
  },
  backButtonText: {
    color: '#4d4dff',
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#4d4dff',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  description: {
    color: '#a0aabf',
    fontSize: 14,
    lineHeight: 20,
  },
  dangerButton: {
    backgroundColor: 'rgba(255, 77, 77, 0.1)',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 77, 0.5)',
    alignItems: 'center',
    marginTop: 10,
  },
  dangerButtonText: {
    color: '#ff4d4d',
    fontWeight: 'bold',
  }
});
