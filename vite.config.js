import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

dotenv.config();

// Custom Vite plugin providing backend serverless API endpoints for local development
function backendApiPlugin() {
  return {
    name: 'backend-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // 1. /api/chat endpoint
        if (req.url === '/api/chat' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const { asset, question } = JSON.parse(body || '{}');
              const groqKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
              const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

              const currentAsset = asset || {
                name: 'General Finance & Investing',
                symbol: 'FINANCE',
                category: 'general',
                sector: 'Financial Literacy',
                price: 0,
                riskLevel: 'Low',
                shortDescription: 'General investing concepts, risk, diversification, and market literacy.'
              };

              const prompt = `You are Mind Over Money AI Coach, an empathetic, jargon-free investing mentor for first-time investors.
Topic/Asset: ${currentAsset.name} (${currentAsset.symbol})
Category: ${currentAsset.category || 'general'}
Sector: ${currentAsset.sector || 'Financial Literacy'}

User Question: "${question}"

Instructions:
1. Provide a direct, plain-English answer for a beginner investor.
2. Keep it concise, friendly, and under 150 words. Use bullet points or bold text for key points.`;

              // 1. Try Groq API if key is available
              if (groqKey && groqKey !== 'your-actual-groq-key-here') {
                const groqModels = ['groq/compound-mini', 'groq/compound', 'qwen/qwen3.6-27b'];
                for (const model of groqModels) {
                  try {
                    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${groqKey}`,
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({
                        model,
                        messages: [{ role: 'user', content: prompt }],
                        max_tokens: 350,
                        temperature: 0.4
                      })
                    });

                    if (groqRes.ok) {
                      const data = await groqRes.json();
                      const reply = data.choices?.[0]?.message?.content;
                      if (reply) {
                        res.setHeader('Content-Type', 'application/json');
                        return res.end(JSON.stringify({ text: reply, isFallback: false, provider: 'groq' }));
                      }
                    }
                  } catch (gErr) {
                    console.error(`Vite proxy Groq error with ${model}:`, gErr);
                  }
                }
              }

              // 2. Try Gemini API if key is available
              if (geminiKey && geminiKey !== 'your-actual-gemini-key-here') {
                try {
                  const geminiRes = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
                    {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.4, maxOutputTokens: 350 }
                      })
                    }
                  );

                  if (geminiRes.ok) {
                    const data = await geminiRes.json();
                    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (reply) {
                      res.setHeader('Content-Type', 'application/json');
                      return res.end(JSON.stringify({ text: reply, isFallback: false, provider: 'gemini' }));
                    }
                  }
                } catch (gemErr) {
                  console.error('Vite proxy Gemini error:', gemErr);
                }
              }

              // Fallback response if no keys match or API calls failed
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({
                text: null,
                isFallback: true
              }));
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: 'Server error processing chat', isFallback: true }));
            }
          });
          return;
        }

        // 2. /api/market endpoint
        if (req.url === '/api/market' && req.method === 'GET') {
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
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({
                prices: {
                  bitcoin: { price: data.bitcoin?.usd, change24h: parseFloat(data.bitcoin?.usd_24h_change?.toFixed(2) || 0) },
                  ethereum: { price: data.ethereum?.usd, change24h: parseFloat(data.ethereum?.usd_24h_change?.toFixed(2) || 0) },
                  solana: { price: data.solana?.usd, change24h: parseFloat(data.solana?.usd_24h_change?.toFixed(2) || 0) }
                }
              }));
            }
          } catch {}

          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ prices: {} }));
        }

        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), backendApiPlugin()],
  server: {
    port: 3000,
    open: false,
  },
});
