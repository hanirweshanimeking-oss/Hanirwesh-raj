import { NOVA_SYSTEM_PROMPT } from '../constants/novaPrompt';
import { memoryService } from './memory';
import { toolService } from './tools';
import { useNovaStore, NovaMode, NovaEmotion } from '../store/novaStore';
import { processVoiceResponse } from './voice';
import * as SecureStore from 'expo-secure-store';

// Tool schemas for Claude
const tools = [
  {
    name: 'set_reminder',
    description: 'Set a push notification reminder for a certain amount of time in the future.',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'What to remind the user about' },
        secondsFromNow: { type: 'number', description: 'How many seconds from now to trigger the reminder' }
      },
      required: ['title', 'secondsFromNow']
    }
  },
  {
    name: 'get_location',
    description: 'Get the current GPS location of the device.',
    input_schema: { type: 'object', properties: {} }
  },
  {
    name: 'get_battery',
    description: 'Get the current battery level and charging status.',
    input_schema: { type: 'object', properties: {} }
  },
  {
    name: 'get_weather',
    description: 'Get the weather for a specific location.',
    input_schema: {
      type: 'object',
      properties: { location: { type: 'string' } },
      required: ['location']
    }
  },
  {
     name: 'search_web',
     description: 'Search the internet for up to date information.',
     input_schema: {
       type: 'object',
       properties: { query: { type: 'string' } },
       required: ['query']
     }
  }
];

export async function sendMessageToNova(content: string, mode: NovaMode) {
  const store = useNovaStore.getState();
  store.setIsThinking(true);

  try {
    // 1. Fetch memory context
    const recentMessages = await memoryService.getRecentMessages(20);
    
    // Map internal history to Anthropic format
    const systemContext = `\n\nCURRENT MODE: ${mode}\nIf the user provides code, automatically reply acknowledging Dev Mode.`;
    
    const messages = recentMessages.map(m => ({
      role: m.role,
      content: m.content
    }));
    
    // Append the new message
    messages.push({ role: 'user', content });

    // 2. Call Anthropic
    const apiKey = await SecureStore.getItemAsync('ANTHROPIC_API_KEY');
    
    if (!apiKey) {
      throw new Error('API Key missing. Please set it in Settings/Onboarding.');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: NOVA_SYSTEM_PROMPT + systemContext,
        messages: messages,
        tools: tools
      }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(`API Error: ${data.error?.message || 'Unknown error'}`);
    }

    let finalReply = '';
    let emotionDetected: NovaEmotion = 'neutral';
    
    // 3. Handle tools or direct text
    const responseBlocks = data.content;
    for (const block of responseBlocks) {
      if (block.type === 'text') {
        finalReply += block.text;
        
        // Very basic emotion detection heuristic based on text content
        const lower = block.text.toLowerCase();
        if (lower.includes('love') || lower.includes('miss')) emotionDetected = 'blush';
        else if (lower.includes('haha') || lower.includes('!')) emotionDetected = 'smile';
        else if (lower.includes('sorry') || lower.includes('worry')) emotionDetected = 'worry';
        else if (lower.includes('congrat') || lower.includes('win')) emotionDetected = 'celebrate';
        else if (lower.includes('dance')) emotionDetected = 'dance';

      } else if (block.type === 'tool_use') {
        // Execute tool
        console.log(`Nova wants to use tool: ${block.name}`);
        let toolResult = '';
        if (block.name === 'set_reminder') toolResult = await toolService.setReminder(block.input.title, block.input.secondsFromNow);
        else if (block.name === 'get_location') toolResult = await toolService.getLocation();
        else if (block.name === 'get_battery') toolResult = await toolService.getBattery();
        else if (block.name === 'get_weather') toolResult = await toolService.getWeather(block.input.location);
        else if (block.name === 'search_web') toolResult = await toolService.searchWeb(block.input.query);

        finalReply += `\n*[Tool executed: ${block.name} -> ${toolResult}]*`;
      }
    }

    // Fallback if empty (e.g. mock key failed)
    if (!finalReply) {
       finalReply = "I am having trouble connecting to my cognitive engine right now.";
       emotionDetected = 'worry';
    }

    // 4. Update UI state
    store.setEmotion(emotionDetected);
    store.addMessage({ role: 'assistant', content: finalReply, mode, emotion: emotionDetected });
    
    // Save to memory
    await memoryService.saveMessage({
       id: Math.random().toString(),
       role: 'assistant',
       content: finalReply,
       mode,
       emotion: emotionDetected,
       timestamp: new Date().toISOString()
    });

    // 5. Trigger Voice
    await processVoiceResponse(finalReply, mode);

  } catch (error: any) {
    console.error('Nova AI Error:', error.response?.data || error.message);
    const fallbackMsg = "I can't reach my servers right now. I'm sorry.";
    store.setEmotion('worry');
    store.addMessage({ role: 'assistant', content: fallbackMsg, mode, emotion: 'worry' });
    await processVoiceResponse(fallbackMsg, mode);
  } finally {
    store.setIsThinking(false);
  }
}
