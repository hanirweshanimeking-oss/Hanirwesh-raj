import React from 'react';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import Avatar from '../components/Avatar';
import ChatBubble from '../components/ChatBubble';
import MicButton from '../components/MicButton';
import ModeSwitch from '../components/ModeSwitch';

export default function ChatScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Full Screen Animated Avatar Background */}
        <Avatar />

        {/* Floating Chat Bubble Overlay */}
        <ChatBubble />

        {/* Bottom Control Bar */}
        <View style={styles.bottomBar}>
          <View style={styles.leftControl}>
            <ModeSwitch />
          </View>
          
          <View style={styles.centerControl}>
            <MicButton />
          </View>

          {/* Settings / Extra space on right */}
          <View style={styles.rightControl}>
             {/* We can re-add the settings gear here if needed, for now keeping it clean */}
          </View>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a0d14', // Deep black
  },
  container: {
    flex: 1,
    backgroundColor: '#0a0d14',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftControl: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerControl: {
    flex: 1,
    alignItems: 'center',
  },
  rightControl: {
    flex: 1,
    alignItems: 'flex-end',
  }
});
