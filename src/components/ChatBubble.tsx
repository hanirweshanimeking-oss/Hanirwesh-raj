import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated } from 'react-native';
import { useNovaStore } from '../store/novaStore';

export default function ChatBubble() {
  const { messages, isThinking } = useNovaStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Only show the very latest message from Nova
  const lastAssistantMessage = messages
    .filter(m => m.role === 'assistant')
    .pop();

  useEffect(() => {
    if (lastAssistantMessage || isThinking) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [lastAssistantMessage, isThinking]);

  if (!lastAssistantMessage && !isThinking) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.bubble}>
        {isThinking ? (
          <Text style={styles.thinkingText}>Nova is thinking...</Text>
        ) : (
          <Text style={styles.text}>{lastAssistantMessage?.content}</Text>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100, // Float above avatar
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  bubble: {
    backgroundColor: 'rgba(250, 245, 235, 0.9)', // Warm cream color
    padding: 20,
    borderRadius: 20,
    borderBottomLeftRadius: 5, // Speech bubble tail effect
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  text: {
    color: '#1a1a1a',
    fontSize: 18,
    fontFamily: 'serif', // Elegant slightly serif font
    lineHeight: 26,
    textAlign: 'center',
  },
  thinkingText: {
    color: '#666',
    fontSize: 16,
    fontStyle: 'italic',
  }
});
