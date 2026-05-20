import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useNovaStore, NovaMode } from '../store/novaStore';

export default function ModeSwitch() {
  const { currentMode, setMode } = useNovaStore();

  const modes: { id: NovaMode, icon: string }[] = [
    { id: 'GF', icon: '💕' },
    { id: 'Madam', icon: '👑' },
    { id: 'Dev', icon: '💻' }
  ];

  return (
    <View style={styles.container}>
      {modes.map((mode) => {
        const isActive = currentMode === mode.id;
        return (
          <TouchableOpacity
            key={mode.id}
            style={[styles.button, isActive && styles.activeButton]}
            onPress={() => setMode(mode.id)}
          >
            <Text style={[styles.icon, isActive && styles.activeIcon]}>{mode.icon}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(20, 25, 35, 0.6)',
    borderRadius: 30,
    padding: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)', // Subtle gold border
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  activeButton: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)', // Warm gold highlight
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.5)',
  },
  icon: {
    fontSize: 20,
    opacity: 0.5,
  },
  activeIcon: {
    opacity: 1,
  }
});
