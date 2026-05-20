import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type NovaMode = 'GF' | 'Madam' | 'Dev';
export type NovaEmotion = 'neutral' | 'smile' | 'blush' | 'worry' | 'celebrate' | 'dance';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  mode: NovaMode;
  emotion?: NovaEmotion;
};

interface NovaState {
  messages: ChatMessage[];
  currentMode: NovaMode;
  currentEmotion: NovaEmotion;
  isThinking: boolean;
  isSpeaking: boolean;
  
  setMode: (mode: NovaMode) => void;
  setEmotion: (emotion: NovaEmotion) => void;
  setIsThinking: (isThinking: boolean) => void;
  setIsSpeaking: (isSpeaking: boolean) => void;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
}

export const useNovaStore = create<NovaState>()(
  persist(
    (set) => ({
      messages: [],
      currentMode: 'GF',
      currentEmotion: 'neutral',
      isThinking: false,
      isSpeaking: false,

      setMode: (mode) => set({ currentMode: mode }),
      setEmotion: (emotion) => set({ currentEmotion: emotion }),
      setIsThinking: (isThinking) => set({ isThinking }),
      setIsSpeaking: (isSpeaking) => set({ isSpeaking }),

      addMessage: (msg) => set((state) => ({
        messages: [
          ...state.messages, 
          { 
            ...msg, 
            id: Math.random().toString(36).substring(7),
            timestamp: new Date().toISOString()
          }
        ]
      })),
      
      clearMessages: () => set({ messages: [] })
    }),
    {
      name: 'nova-storage', // unique name
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist messages and currentMode. We don't want to persist transient states like isThinking.
      partialize: (state) => ({ messages: state.messages, currentMode: state.currentMode }), 
    }
  )
);
