const express = require('express');
const fetch = require('node-fetch');
const app = express();
const port = process.env.PORT;
const analysisCounts = new Map();


app.get('/healthz', (req, res) => {
  console.log("Health was checked")
  res.status(200).send('OK');
});

app.use(express.json());

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Character Card Optimizer | AI-Powered Analysis</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
            color: #f8fafc;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            line-height: 1.6;
          }

          .container {
            width: 100%;
            max-width: 900px;
          }

          .card {
            background: rgba(30, 41, 59, 0.6);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(148, 163, 184, 0.1);
            border-radius: 16px;
            padding: 3rem;
            box-shadow: 
              0 20px 50px rgba(0, 0, 0, 0.5),
              0 0 80px rgba(59, 130, 246, 0.1),
              inset 0 1px 0 rgba(255, 255, 255, 0.05);
          }

          .header {
            text-align: center;
            margin-bottom: 2.5rem;
          }

          h1 {
            font-family: 'JetBrains Mono', monospace;
            font-size: 2.5rem;
            font-weight: 700;
            background: linear-gradient(135deg, #60a5fa 0%, #a855f7 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 0.5rem;
            letter-spacing: -0.02em;
          }

          .subtitle {
            color: #94a3b8;
            font-size: 1.1rem;
            font-weight: 400;
          }

          .input-section {
            margin-bottom: 1.5rem;
          }

          label {
            display: block;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.875rem;
            color: #cbd5e1;
            margin-bottom: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          #characterData {
            width: 100%;
            min-height: 300px;
            background: rgba(15, 23, 42, 0.8);
            border: 1px solid rgba(148, 163, 184, 0.2);
            border-radius: 8px;
            padding: 1rem;
            color: #f8fafc;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.9rem;
            line-height: 1.6;
            resize: vertical;
            transition: all 0.3s ease;
          }

          #characterData:focus {
            outline: none;
            border-color: #60a5fa;
            box-shadow: 
              0 0 0 3px rgba(96, 165, 250, 0.1),
              0 0 30px rgba(96, 165, 250, 0.2);
          }

          #characterData::placeholder {
            color: #475569;
          }

          button {
            width: 100%;
            padding: 1rem 2rem;
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            color: white;
            font-family: 'JetBrains Mono', monospace;
            font-size: 1rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 
              0 4px 15px rgba(59, 130, 246, 0.3),
              0 0 30px rgba(139, 92, 246, 0.2);
            position: relative;
            overflow: hidden;
          }

          button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s ease;
          }

          button:hover {
            transform: translateY(-2px);
            box-shadow: 
              0 6px 20px rgba(59, 130, 246, 0.4),
              0 0 40px rgba(139, 92, 246, 0.3);
          }

          button:hover::before {
            left: 100%;
          }

          button:active {
            transform: translateY(0);
          }

          button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
          }

          #result {
            margin-top: 2rem;
            padding: 1.5rem;
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(148, 163, 184, 0.1);
            border-radius: 8px;
            min-height: 60px;
            display: none;
          }

          #result.show {
            display: block;
            animation: fadeIn 0.3s ease;
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          #result pre {
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.9rem;
            line-height: 1.6;
            color: #e2e8f0;
            white-space: pre-wrap;
            word-wrap: break-word;
            margin: 0;
          }

          .loading {
            color: #60a5fa;
            font-family: 'JetBrains Mono', monospace;
          }

          .error {
            color: #f87171;
            font-family: 'JetBrains Mono', monospace;
          }

          @media (max-width: 768px) {
            .card {
              padding: 2rem 1.5rem;
            }

            h1 {
              font-size: 2rem;
            }

            .subtitle {
              font-size: 1rem;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="header">
              <h1>Soulforge</h1>
              <p class="subtitle">AI-Powered Analysis for Roleplay Characters</p>
            </div>

            <div class="input-section">
              <label for="characterData">Character JSON Data</label>
              <textarea 
                id="characterData" 
                placeholder="Paste your character JSON here..."
                spellcheck="false"
              ></textarea>
            </div>

            <button onclick="analyze()">
              Analyze Character
            </button>

            <div id="result"></div>
          </div>
        </div>

        <script>
          async function analyze() {
            const data = document.getElementById('characterData').value;
            const resultDiv = document.getElementById('result');
            resultDiv.className = 'show loading';
            resultDiv.innerHTML = "Analyzing...";
            try {
              const response = await fetch('/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ characterData: data })
              });
              const analysis = await response.json();
              resultDiv.className = 'show';
              resultDiv.innerHTML = '<pre>' + analysis.reply + '</pre>';
            } catch (error) {
              resultDiv.className = 'show error';
              resultDiv.innerHTML = 'Error: ' + error;
            }
          }
        </script>
      </body>
    </html>
  `);
});


app.post('/analyze', async (req, res) => {
  const { characterData } = req.body;
  const userKey = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'anonymous';
  const count = analysisCounts.get(userKey) || 0;
  if (count >= 3) {
    return res.json({ reply: "Free trial limit reached (3 analyses). Premium features coming soon!" });
  }
  analysisCounts.set(userKey, count + 1);

  // YOUR MASTER PROMPT - The product is here
  const systemPrompt = `You are an expert AI character designer. Analyze this character card JSON. Be specific, actionable, and critical while remaining professional.

Focus on:
1. Vagueness: Call out generic traits. Demand concrete examples.
2. Contradictions: Point out conflicting personality aspects.  
3. AI Guidance: Does example dialogue actually demonstrate the speech pattern?
4. Engagement: Is the scenario hook interesting?

Format:
- STRENGTHS: (1-2 direct bullets)
- CRITICAL FLAWS: (3-5 constructive but firm bullets)  
- REWRITE SUGGESTIONS: (Exact rewritten lines for top 2 flaws)

Begin with: "Having analyzed your character card, here's my assessment:"

Provide only the analysis. Do not offer additional help or revisions. End after the rewrite suggestions.

Character Card:
${characterData}`;

  try {
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Title': 'Character-Card-Optimizer'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3-0324', // Good balance of cheap + quality
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: "Analyze this character card and tell me how to fix it."
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      })
    });

    if (!openRouterResponse.ok) {
      throw new Error(`OpenRouter API error: ${openRouterResponse.status}`);
    }

    const data = await openRouterResponse.json();
    const analysis = data.choices[0]?.message?.content?.trim() || 'No analysis generated.';

    res.json({ reply: analysis });

  } catch (error) {
    console.error('Analysis Error:', error);
    res.status(500).json({ reply: `Analysis failed: ${error.message}` });
    console.log(error)
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Optimizer running at http://0.0.0.0:${port}`);
});







