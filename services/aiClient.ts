import Anthropic from '@anthropic-ai/sdk';
import { DeviceContext } from '../utils/deviceContext';

// IMPORTANT: In a real production app, never embed your API keys in the app itself!
// Ideally, the React Native app should send queries to your own backend server,
// which securely communicates with the Anthropic API.
// For this tutorial/demo, we are initializing it directly but passing a dummy key if not set.
// You must set this in your .env or similar approach to use actually.
const ANTHROPIC_API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY || 'dummy_key';

const anthropic = new Anthropic({
  apiKey: ANTHROPIC_API_KEY,
  // We specify danger: true to allow this to run in the browser/React Native environment
  dangerouslyAllowBrowser: true 
});

export const getJarvisResponse = async (
  prompt: string,
  context: DeviceContext,
  chatHistory: { role: 'user' | 'assistant', content: string }[] = []
): Promise<string> => {
  try {
    const systemPrompt = `You are Jarvis, a highly capable, concise, and helpful AI assistant living on a user's mobile device.
You have access to the following context about the user's device and real-world environment:
- Current Time: ${context.time}
- Battery Level: ${context.batteryLevel !== null ? Math.round(context.batteryLevel * 100) + '%' : 'Unknown'}
- Charging Status: ${context.isCharging !== null ? (context.isCharging ? 'Charging' : 'Not Charging') : 'Unknown'}
- Location (Lat, Lon): ${context.location ? `${context.location.coords.latitude}, ${context.location.coords.longitude}` : 'Unknown'}

Keep your answers short and conversational, as they will be read aloud using Text-to-Speech.`;

    const messages: Anthropic.MessageParam[] = [
      ...chatHistory,
      { role: 'user', content: prompt }
    ];

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307', // Using haiku for fast responses
      max_tokens: 250,
      system: systemPrompt,
      messages: messages,
    });

    const responseContent = response.content[0];
    if (responseContent.type === 'text') {
      return responseContent.text;
    }
    return 'I generated a response that I cannot process right now.';
  } catch (error: any) {
    console.error('Error fetching response from Claude:', error);
    return 'Sorry, I am having trouble connecting to my brain right now.';
  }
};
