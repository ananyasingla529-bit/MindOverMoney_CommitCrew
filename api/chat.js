export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

    const groqKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    const prompt = `You are Mind Over Money AI Coach, an empathetic, jargon-free investing mentor for first-time investors.
Topic/Asset: ${currentAsset.name} (${currentAsset.symbol}).
Category: ${currentAsset.category || 'general'}
Sector: ${currentAsset.sector || 'Financial Literacy'}

User Question: "${question}"

Instructions:
1. Provide a direct, plain-English answer for a beginner investor.
2. Keep it concise, friendly, and under 150 words. Use bullet points or bold text for key points.`;

    // 1. Try Groq API if GROQ_API_KEY is available (Lightning Fast & Free)
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
              return res.status(200).json({ text: reply, isFallback: false, provider: 'groq' });
            }
          }
        } catch (e) {
          console.error(`Groq error with model ${model}:`, e);
        }
      }
    }

    // 2. Try Gemini API if GEMINI_API_KEY is available
    if (geminiKey && geminiKey !== 'your-actual-gemini-key-here') {
      try {
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
        );

        if (response.ok) {
          const data = await response.json();
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) {
            return res.status(200).json({ text: reply, isFallback: false, provider: 'gemini' });
          }
        }
      } catch (e) {
        console.error('Gemini error:', e);
      }
    }

    // Fallback to smart rule engine
    return res.status(200).json({ text: null, isFallback: true });
  } catch (error) {
    console.error('Vercel Serverless /api/chat error:', error);
    return res.status(500).json({ error: 'Failed to process AI chat request', isFallback: true });
  }
}
