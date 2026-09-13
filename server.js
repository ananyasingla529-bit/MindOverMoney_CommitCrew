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
    if (!asset || !question) {
      return res.status(400).json({ error: 'Asset and question are required' });
    }

    const apiKey = req.body?.apiKey || process.env.GEMINI_API_KEY;

    if (apiKey) {
      const prompt = `You are Mind Over Money AI Coach, an empathetic, jargon-free investing mentor for first-time investors.
Discussing topic/asset: ${asset.name} (${asset.symbol}).
Category: ${asset.category}
Sector: ${asset.sector}

User Question: "${question}"

Instructions:
1. Provide a direct, plain-English answer for a first-time investor.
2. Keep it concise, friendly, and under 150 words.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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
          return res.json({ text: reply, isFallback: false });
        }
      }
    }

    // Return fallback status so client uses dynamic smart reply
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
