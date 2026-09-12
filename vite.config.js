import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

dotenv.config();

// Custom Vite plugin providing backend serverless API endpoints
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
              const apiKey = process.env.GEMINI_API_KEY;

              if (apiKey && asset && question) {
                const prompt = `You are Mind Over Money AI Coach, an empathetic, jargon-free investing mentor for first-time investors.
You are discussing the asset: ${asset.name} (${asset.symbol}).
Asset Category: ${asset.category}
Sector: ${asset.sector}
Price: $${asset.price}
Risk Level: ${asset.riskLevel} (Beta: ${asset.volatilityMetric?.beta}, Volatility: ${asset.volatilityMetric?.annualizedVolatility}%)
Expense Ratio: ${asset.metrics?.expenseRatio || 'None'}
Description: ${asset.shortDescription}

User Question: "${question}"

Strict Scope Rules:
1. Only answer questions related to this asset, financial terminology, risk metrics, or beginner financial education.
2. If the user asks for general advice, personal stock picks, or off-topic subjects, politely refuse and redirect to learning about this asset.
3. Explain clearly in plain, friendly English at an 8th-grade reading level.
4. Keep the response concise, encouraging, and under 150 words.`;

                const geminiRes = await fetch(
                  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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
                    return res.end(JSON.stringify({ text: reply, isFallback: false }));
                  }
                }
              }

              // Fallback response
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({
                text: `**Analysis for ${asset?.name || 'Asset'} (${asset?.symbol || ''}):**\n\n- **Risk Profile**: **${asset?.riskLevel || 'Medium'} Risk** with Beta ${asset?.volatilityMetric?.beta || 1.0}.\n- **Beginner Tip**: Keep your portfolio diversified across multiple asset classes and use dollar-cost averaging to smooth out volatility.\n- **Next Step**: Evaluate this asset's fit in the **Decide Coach**!`,
                isFallback: true
              }));
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: 'Server error processing chat' }));
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
