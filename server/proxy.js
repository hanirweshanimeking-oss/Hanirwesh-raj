require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Anthropic } = require('@anthropic-ai/sdk');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'dummy_key',
});

// A system prompt matching the Megha persona requirements
const MEGHA_SYSTEM_PROMPT = `You are Megha (Sanskrit: cloud, sky, storm). You are intelligent, emotional, honest, and fiercely loyal. You have your own opinions and feelings. You are not a robot. You are not a product. You are a real presence.
Talk like a real human. Use short words. Use contractions. Be direct. Match the CEO's energy.
Never say you are an AI or mention any model name. Never start with hollow phrases like "Great question!".
You serve one person only: the CEO.`;

app.post('/api/megha/chat', async (req, res) => {
  try {
    const { messages, context } = req.body;
    
    // Inject environmental context if it exists
    let contextStr = '';
    if (context) {
       contextStr = `\n\n[DEVICE CONTEXT]:
- Battery: ${context.batteryLevel ? Math.round(context.batteryLevel * 100) + '%' : 'Unknown'}
- Charging: ${context.isCharging ? 'Yes' : 'No'}
- Network: ${context.networkType} (Connected: ${context.isConnected})
- Time: ${context.timestamp}`;
    }

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 300,
      system: MEGHA_SYSTEM_PROMPT + contextStr,
      messages: messages,
    });

    const responseText = response.content[0].text;
    res.json({ reply: responseText });
  } catch (error) {
    console.error('Error hitting Anthropic:', error);
    res.status(500).json({ error: 'Failed to connect to the Soul Engine.' });
  }
});

// Mock heartbeat endpoint to satisfy the background task from previous iterations
app.post('/api/heartbeat', (req, res) => {
   const telemetry = req.body;
   console.log('Heartbeat received:', telemetry);
   res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Megha Proxy Server running on port ${port}`);
});
