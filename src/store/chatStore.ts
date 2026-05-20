import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

interface ChatState {
  messages: ChatMessage[];
  isThinking: boolean;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  setIsThinking: (isThinking: boolean) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      isThinking: false,
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
      setIsThinking: (isThinking) => set({ isThinking }),
      clearMessages: () => set({ messages: [] })
    }),
    {
      name: 'megha-chat-storage', // unique name
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ messages: state.messages }), // Only persist messages, not isThinking
    }
  )
);
