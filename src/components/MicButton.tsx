import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, Text, Animated } from 'react-native';
import { voiceService } from '../services/voice';
import { sendMessageToNova } from '../services/anthropic';
import { useNovaStore } from '../store/novaStore';

export default function MicButton() {
  const [isRecording, setIsRecording] = useState(false);
  const { currentMode, setMode } = useNovaStore();
  
  // Pulse animation setup
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true })
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
      pulseAnim.stopAnimation();
    }
  }, [isRecording]);

  const handlePressIn = async () => {
    const success = await voiceService.startRecording();
    if (success) setIsRecording(true);
  };

  const handlePressOut = async () => {
    if (!isRecording) return;
    setIsRecording(false);
    
    // Stop recording and get transcription (Whisper mock)
    const transcription = await voiceService.stopRecordingAndTranscribe();
    
    if (transcription) {
      let activeMode = currentMode;
      
      // Auto-detect Dev mode heuristics
      if (transcription.toLowerCase().includes('code') || 
          transcription.toLowerCase().includes('bug') ||
          transcription.toLowerCase().includes('compile')) {
          setMode('Dev');
          activeMode = 'Dev';
      }

      // Send to Claude
      await sendMessageToNova(transcription, activeMode);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.container}
    >
      <Animated.View style={[
        styles.glowRing, 
        isRecording && styles.recordingGlow,
        { transform: [{ scale: pulseAnim }] }
      ]}>
        <Text style={styles.micIcon}>🎙️</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowRing: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFD700', // Gold glow
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  recordingGlow: {
    backgroundColor: 'rgba(255, 77, 77, 0.2)', // Red glow when recording
    borderColor: 'rgba(255, 77, 77, 0.8)',
    shadowColor: '#FF4D4D',
  },
  micIcon: {
    fontSize: 28,
  }
});
