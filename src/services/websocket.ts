import { useChatStore } from '../store/chatStore';

// Fallback local API URL
const PROXY_URL = 'http://localhost:3000/api/megha/chat';

class WebSocketManager {
  connect() {
    // Note: Replaced actual WebSocket with REST API call to local Proxy server 
    // to meet the API Key security requirements. Real app might mix REST & WS.
    console.log('Ready to connect to Soul Engine Proxy...');
  }

  async sendMessage(content: string) {
    
    // Passively gather environment variables
    const { gatherTelemetry } = await import('./sensorTelemetry');
    const telemetry = await gatherTelemetry();

    // Reconstruct the message history array for the Anthropic endpoint
    // We only send the last few messages to save tokens for this demo
    const chatHistory = useChatStore.getState().messages.slice(-5).map(m => ({
      role: m.role,
      content: m.content
    }));
    
    chatHistory.push({ role: 'user', content });

    try {
      useChatStore.getState().setIsThinking(true);
      const response = await fetch(PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatHistory,
          context: telemetry
        })
      });

      const data = await response.json();

      if (data.reply) {
         useChatStore.getState().addMessage({
            role: 'assistant',
            content: data.reply,
         });
      } else {
         console.error('Server returned error', data);
      }
    } catch (e) {
      console.error('REST request to proxy failed', e);
    } finally {
      useChatStore.getState().setIsThinking(false);
    }
  }
}

export const wsManager = new WebSocketManager();
