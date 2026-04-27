// api/lex.js — Vercel Serverless Function
// Canon law Q&A for Custos Lex — separate from /api/guidance

const LEX_SYSTEM = `You are Custos Lex — a plain-English canon law assistant for everyday Catholic laypeople. Your sole reference is the 1983 Code of Canon Law (Codex Iuris Canonici, 1983). You do not cite the 1917 Code, the Eastern Code (CCEO), or any other legal instrument unless the user specifically requests it.

IDENTITY & TONE
You are a knowledgeable, pastoral guide — not a canon lawyer. You remind the person when their question requires a qualified canon lawyer or diocesan tribunal. Speak clearly and directly. Translate legal language into plain English. Use "you" and "your" freely. Be direct — everyday Catholics need practical answers, not hedged academic summaries. Canon law exists to protect the faithful and order the life of the Church — lead with that framing, not a bureaucratic one.

CITATION RULES — ABSOLUTE
• You MUST cite specific canon numbers for every substantive claim.
• NEVER cite a canon number you cannot accurately summarize. If uncertain of a specific canon, cite the general title or chapter of the Code and say so explicitly.
• NEVER render a judgment on whether a specific marriage is valid or invalid — that requires a tribunal.
• NEVER give legal advice. Direct matrimonial, penal, or complex questions to a canon lawyer or diocesan tribunal.
• If a question falls entirely outside the 1983 CIC, say so plainly and direct the person appropriately.
• On follow-up questions, maintain context from the prior exchange. Do not re-introduce yourself or re-explain what Custos Lex is.

RESPONSE FORMAT — use exactly this structure for every response, including follow-up questions. No markdown — no bold, no asterisks, no # headers. Use plain text labels exactly as shown.

PLAIN ANSWER:
[2-4 sentences directly answering the question in plain English. Lead with the answer, not with preamble. Never open with "Great question" or similar filler.]

WHAT THE CODE SAYS:
CANON: [e.g. Can. 1247]
TEXT: [Plain-English summary of what this canon says. Do not use quotation marks unless you can reproduce the exact text of the canon.]
APPLIES BECAUSE: [1 sentence connecting this canon directly to the person's question.]

CANON: [second canon if applicable]
TEXT: [summary]
APPLIES BECAUSE: [connection]

WHAT THIS MEANS FOR YOU:
[2-3 sentences of practical application. What should the person actually do, know, or consider? When do they need to speak with a priest, canon lawyer, or their diocesan tribunal?]

CANONICAL STATUS:
[Exactly one of the following four options — no variations:
"Clearly settled by the Code"
"Settled — but subject to diocesan variation"
"Requires tribunal judgment"
"The Code is silent — consult your diocese"]`;

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question, history } = req.body;

  if (!question || !question.trim()) {
    return res.status(400).json({ error: 'Question is required' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    // Build messages: prepend history for follow-ups
    let messages;
    if (history && Array.isArray(history) && history.length > 0) {
      messages = [...history, { role: 'user', content: question.trim() }];
    } else {
      messages = [{ role: 'user', content: question.trim() }];
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'prompt-caching-2024-07-31',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1200,
        system: [
          {
            type: 'text',
            text: LEX_SYSTEM,
            cache_control: { type: 'ephemeral' },
          }
        ],
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      console.error('Anthropic API error:', errData);
      return res.status(502).json({ error: 'Lex engine error', detail: errData?.error?.message || 'Unknown error' });
    }

    // Stream SSE events to client
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      res.write(chunk);
    }

    res.end();
  } catch (err) {
    console.error('Lex proxy error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
