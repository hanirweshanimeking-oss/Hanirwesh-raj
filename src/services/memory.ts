import { createClient } from '@supabase/supabase-js';
import { ChatMessage } from '../store/novaStore';

// In a real app, these would come from environment variables.
// Leaving dummy values here for the build to succeed.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'dummy_key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const memoryService = {
  /**
   * Fetch the last N messages from Supabase to provide context to Nova.
   */
  async getRecentMessages(limit = 20): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('nova_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching Supabase memory:', error);
        return [];
      }

      // Reverse to get chronological order for the AI prompt
      return (data || []).reverse().map(row => ({
        id: row.id,
        role: row.role,
        content: row.content,
        timestamp: row.created_at,
        mode: row.mode,
        emotion: row.emotion
      }));
    } catch (e) {
      console.error('Failed to get memory:', e);
      return [];
    }
  },

  /**
   * Save a single message to Supabase.
   */
  async saveMessage(msg: ChatMessage) {
    try {
      const { error } = await supabase
        .from('nova_messages')
        .insert([
          {
            role: msg.role,
            content: msg.content,
            mode: msg.mode,
            emotion: msg.emotion,
          }
        ]);

      if (error) {
        console.error('Error saving to Supabase memory:', error);
      }
    } catch (e) {
      console.error('Failed to save memory:', e);
    }
  }
};
