import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Scoped Chatbot Handler
app.post('/api/chat', async (req, res) => {
  try {
    const { asset, question } = req.body || {};
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const currentAsset = asset || {
      name: 'General Finance & Investing',
      symbol: 'FINANCE',
      category: 'general',
      sector: 'Financial Literacy',
      price: 0,
      riskLevel: 'Low',
      shortDescription: 'General investing concepts, risk, diversification, and market literacy.'
    };

    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    const prompt = `You are Mind Over Money AI Coach, an empathetic, jargon-free investing mentor for first-time investors.
Topic/Asset: ${currentAsset.name} (${currentAsset.symbol}).
Category: ${currentAsset.category || 'general'}
Sector: ${currentAsset.sector || 'Financial Literacy'}

User Question: "${question}"

Instructions:
1. Provide a direct, plain-English answer for a beginner investor.
2. Keep it concise, friendly, and under 150 words. Use bullet points or bold text for key points.`;

    // 1. Try Groq API if GROQ_API_KEY is available (Ultra-fast Llama-3.3-70b)
    if (groqKey) {
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 350,
          temperature: 0.4
        })
      }).catch(() => null);

      if (groqRes && groqRes.ok) {
        const data = await groqRes.json();
        const reply = data.choices?.[0]?.message?.content;
        if (reply) {
          return res.json({ text: reply, isFallback: false, provider: 'groq' });
        }
      }
    }

    // 2. Try Gemini API if GEMINI_API_KEY is available
    if (geminiKey) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.4, maxOutputTokens: 350 }
          })
        }
      ).catch(() => null);

      if (response && response.ok) {
        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply) {
          return res.json({ text: reply, isFallback: false, provider: 'gemini' });
        }
      }
    }

    // Fallback status so client uses smart rule engine
    return res.json({
      text: null,
      isFallback: true
    });
  } catch (error) {
    console.error('API /api/chat error:', error);
    res.status(500).json({ error: 'Failed to process AI chat request', isFallback: true });
  }
});

// Market Data Proxy Handler
app.get('/api/market', async (req, res) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const cgRes = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true',
      { signal: controller.signal }
    ).catch(() => null);

    clearTimeout(timeout);

    if (cgRes && cgRes.ok) {
      const data = await cgRes.json();
      return res.json({
        prices: {
          bitcoin: { price: data.bitcoin?.usd, change24h: parseFloat(data.bitcoin?.usd_24h_change?.toFixed(2) || 0) },
          ethereum: { price: data.ethereum?.usd, change24h: parseFloat(data.ethereum?.usd_24h_change?.toFixed(2) || 0) },
          solana: { price: data.solana?.usd, change24h: parseFloat(data.solana?.usd_24h_change?.toFixed(2) || 0) }
        }
      });
    }
  } catch {}

  res.json({ prices: {} });
});

// Serve static frontend in production
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Mind Over Money backend server running on http://localhost:${PORT}`);
});
