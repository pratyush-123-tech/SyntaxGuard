const Groq = require('groq-sdk');
const { buildAnalysisPrompt } = require('../utils/promptBuilder');

// Lazily initialized so dotenv has loaded by the time this runs
const getGroq = () => new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODEL = 'llama-3.3-70b-versatile';

/**
 * Analyze code using Groq (LLaMA 3.3 70B).
 * Returns structured JSON with issues, score, and refactored code.
 */
const analyzeCode = async (code, language) => {
  const groq = getGroq();
  const prompt = buildAnalysisPrompt(code, language);

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });

  const responseText = completion.choices[0]?.message?.content || '{}';
  const parsed = JSON.parse(responseText);
  return parsed;
};

/**
 * Stream code analysis using Groq streaming.
 * Sends chunks to the client via Server-Sent Events as they arrive.
 */
const streamAnalyzeCode = async (code, language, res) => {
  const groq = getGroq();
  const prompt = buildAnalysisPrompt(code, language);

  const stream = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    stream: true,
  });

  let fullText = '';
  for await (const chunk of stream) {
    const chunkText = chunk.choices[0]?.delta?.content || '';
    if (chunkText) {
      fullText += chunkText;
      res.write(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`);
    }
  }

  // Parse final result
  const cleanedJson = fullText
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();

  const parsed = JSON.parse(cleanedJson);
  res.write(`data: ${JSON.stringify({ done: true, result: parsed })}\n\n`);
  return parsed;
};

module.exports = { analyzeCode, streamAnalyzeCode };
