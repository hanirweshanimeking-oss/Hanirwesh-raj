import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Rive, { RiveRef } from 'rive-react-native';
import { useNovaStore } from '../store/novaStore';

export default function Avatar() {
  const { currentEmotion, isSpeaking } = useNovaStore();
  const riveRef = useRef<RiveRef>(null);

  // In a real implementation, you would load a .riv file mapping to these state machines
  // Here we'll simulate the component structure required for Rive.
  
  useEffect(() => {
    // Fire state machine inputs based on emotion and speaking state
    if (riveRef.current) {
      try {
        // Rive numeric state mappings (e.g. 0=neutral, 1=smile, etc)
        const emotionMap: Record<string, number> = {
          'neutral': 0, 'smile': 1, 'blush': 2, 'worry': 3, 'celebrate': 4, 'dance': 5
        };
        riveRef.current.setInputState('State Machine 1', 'emotion', emotionMap[currentEmotion] || 0);
        riveRef.current.setInputState('State Machine 1', 'isSpeaking', isSpeaking);
      } catch (e) {
        // Mock fallback if states don't exist in the dummy riv
      }
    }
  }, [currentEmotion, isSpeaking]);

  return (
    <View style={StyleSheet.absoluteFillObject}>
      {/* 
        NOTE: Since we don't have a real .riv file asset provided, 
        this uses a generic remote URL. You would replace `url` with `resourceName="nova_avatar"`
      */}
      <Rive
        ref={riveRef}
        url="https://cdn.rive.app/animations/vehicles.riv"
        style={styles.avatar}
        stateMachineName="State Machine 1"
      />
      {/* Overlay to darken background slightly, focusing on avatar */}
      <View style={styles.overlay} />
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 13, 20, 0.4)', // Deep black overlay
  }
});
