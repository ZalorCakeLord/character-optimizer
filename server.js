const express = require('express');
const app = express();
const port = process.env.PORT;
const analysisCounts = new Map();


app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(express.json());

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Soulforge — Character Analysis</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=Work+Sans:wght@400;500;600&display=swap" rel="stylesheet">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Work Sans', -apple-system, BlinkMacSystemFont, sans-serif;
            background: #f5f3f0;
            color: #1a1a1a;
            min-height: 100vh;
            padding: 3rem 1.5rem;
            line-height: 1.65;
            position: relative;
          }

          body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: 
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(0,0,0,.01) 2px,
                rgba(0,0,0,.01) 4px
              );
            pointer-events: none;
            z-index: 1;
          }

          .container {
            max-width: 720px;
            margin: 0 auto;
            position: relative;
            z-index: 2;
          }

          .masthead {
            border-bottom: 3px solid #1a1a1a;
            border-top: 1px solid #1a1a1a;
            padding: 2rem 0 1.5rem;
            margin-bottom: 3rem;
          }

          .publication {
            font-family: 'Crimson Pro', Georgia, serif;
            font-size: 3.5rem;
            font-weight: 700;
            letter-spacing: -0.02em;
            line-height: 1;
            margin-bottom: 0.5rem;
            color: #1a1a1a;
          }

          .tagline {
            font-size: 0.813rem;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            font-weight: 500;
            color: #666;
            border-left: 3px solid #c33;
            padding-left: 0.75rem;
            margin-top: 1rem;
          }

          .article {
            background: #fff;
            border: 1px solid #d4d4d4;
            padding: 2.5rem;
            margin-bottom: 2rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          }

          .article-header {
            margin-bottom: 2rem;
            padding-bottom: 1.5rem;
            border-bottom: 1px solid #e5e5e5;
          }

          .kicker {
            font-size: 0.813rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #c33;
            font-weight: 600;
            margin-bottom: 0.5rem;
          }

          .headline {
            font-family: 'Crimson Pro', Georgia, serif;
            font-size: 1.75rem;
            font-weight: 600;
            line-height: 1.3;
            color: #1a1a1a;
            margin-bottom: 0.75rem;
          }

          .dek {
            font-size: 1rem;
            color: #666;
            line-height: 1.5;
            font-style: italic;
          }

          .form-section {
            margin-bottom: 1.5rem;
          }

          label {
            display: block;
            font-size: 0.813rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            font-weight: 600;
            margin-bottom: 0.75rem;
            color: #1a1a1a;
          }

          #characterData {
            width: 100%;
            min-height: 280px;
            background: #fafafa;
            border: 1px solid #d4d4d4;
            padding: 1rem;
            color: #1a1a1a;
            font-family: 'Courier New', monospace;
            font-size: 0.875rem;
            line-height: 1.6;
            resize: vertical;
            transition: all 0.2s ease;
          }

          #characterData:focus {
            outline: none;
            background: #fff;
            border-color: #1a1a1a;
          }

          #characterData::placeholder {
            color: #999;
          }

          button {
            width: 100%;
            padding: 1rem 2rem;
            background: #1a1a1a;
            color: #fff;
            font-size: 0.813rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            border: none;
            cursor: pointer;
            transition: all 0.2s ease;
            position: relative;
          }

          button:hover {
            background: #c33;
          }

          button:active {
            transform: translateY(1px);
          }

          button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          #result {
            margin-top: 2rem;
            padding: 2rem;
            background: #fafafa;
            border-left: 3px solid #c33;
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
            font-family: 'Courier New', monospace;
            font-size: 0.875rem;
            line-height: 1.7;
            color: #1a1a1a;
            white-space: pre-wrap;
            word-wrap: break-word;
            margin: 0;
          }

          .loading {
            font-style: italic;
            color: #666;
          }

          .error {
            color: #c33;
            font-weight: 500;
          }

          .colophon {
            margin-top: 4rem;
            padding-top: 2rem;
            border-top: 1px solid #d4d4d4;
            text-align: center;
            font-size: 0.75rem;
            color: #999;
            letter-spacing: 0.05em;
          }

          @media (max-width: 768px) {
            body {
              padding: 2rem 1rem;
            }

            .publication {
              font-size: 2.5rem;
            }

            .article {
              padding: 1.5rem;
            }

            .headline {
              font-size: 1.5rem;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <header class="masthead">
            <h1 class="publication">Soulforge</h1>
            <p class="tagline">A Journal of Character Analysis</p>
          </header>

          <article class="article">
            <div class="article-header">
              <div class="kicker">Analysis Tool</div>
              <h2 class="headline">Submit Your Character for Critical Review</h2>
              <p class="dek">
                Our editorial process examines character construction with the rigor 
                of literary criticism—identifying vague traits, contradictions, and 
                opportunities for depth.
              </p>
            </div>

            <div class="form-section">
              <label for="characterData">Character Data</label>
              <textarea 
                id="characterData" 
                placeholder="Paste your character card JSON here..."
                spellcheck="false"
              ></textarea>
            </div>

            <button onclick="analyze()">
              Submit for Analysis
            </button>

            <div id="result"></div>
          </article>

          <footer class="colophon">
            Vol. I — Analysis Engine — Est. 2025
          </footer>
        </div>

        <script>
          async function analyze() {
            const data = document.getElementById('characterData').value;
            const resultDiv = document.getElementById('result');
            resultDiv.className = 'show loading';
            resultDiv.innerHTML = "Analysis in progress...";
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

app.listen(port, () => {
  console.log(`Optimizer running on port ${port}`); 
});













