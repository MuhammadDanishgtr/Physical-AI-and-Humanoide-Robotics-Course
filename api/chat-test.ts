import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  const hasAnthropicKey = !!ANTHROPIC_API_KEY;

  // If POST, try to actually call the API
  if (req.method === 'POST' && hasAnthropicKey) {
    try {
      const { message } = req.body || {};

      const anthropic = new Anthropic({
        apiKey: ANTHROPIC_API_KEY,
      });

      const response = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 256,
        messages: [
          {
            role: 'user',
            content: message || 'Say hello in one sentence.',
          },
        ],
      });

      const textContent = response.content.find((block) => block.type === 'text');
      const responseText = textContent?.type === 'text' ? textContent.text : 'No response';

      return res.status(200).json({
        status: 'ok',
        message: responseText,
        apiCallSuccessful: true,
      });
    } catch (error: any) {
      return res.status(200).json({
        status: 'error',
        error: error.message,
        errorType: error.name,
        apiCallSuccessful: false,
      });
    }
  }

  return res.status(200).json({
    status: 'ok',
    anthropicKeyConfigured: hasAnthropicKey,
    keyPrefix: ANTHROPIC_API_KEY?.substring(0, 10) + '...',
    method: req.method,
    hint: 'Send POST request to test actual API call',
  });
}
