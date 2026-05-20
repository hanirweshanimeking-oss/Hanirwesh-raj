import { useChatStore } from '../store/chatStore';

// Mock WS URL for local development/FastAPI
const WS_URL = 'ws://localhost:8000/ws/megha';

class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    console.log('Connecting to Soul Engine...');
    this.ws = new WebSocket(WS_URL);

    this.ws.onopen = () => {
      console.log('Connected to Soul Engine.');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Handle incoming messages from Megha
        if (data.type === 'message') {
          useChatStore.getState().addMessage({
            role: 'assistant',
            content: data.content,
          });
          useChatStore.getState().setIsThinking(false);
        } else if (data.type === 'typing') {
          useChatStore.getState().setIsThinking(true);
        }
      } catch (e) {
        console.error('Failed to parse WS message', e);
      }
    };

    this.ws.onclose = () => {
      console.log('Disconnected from Soul Engine.');
      this.attemptReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };
  }

  async sendMessage(content: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      
      // Passively gather environment variables
      const { gatherTelemetry } = await import('./sensorTelemetry');
      const telemetry = await gatherTelemetry();

      const payload = {
        type: 'user_message',
        content,
        context: telemetry,
      };
      
      this.ws.send(JSON.stringify(payload));
    } else {
      console.warn('Cannot send message, WS not connected.');
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const timeout = Math.pow(2, this.reconnectAttempts) * 1000;
      console.log(`Attempting reconnect in ${timeout}ms...`);
      setTimeout(() => this.connect(), timeout);
    }
  }
}

export const wsManager = new WebSocketManager();
