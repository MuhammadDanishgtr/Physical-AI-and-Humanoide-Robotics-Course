import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY;
  const keyPrefix = process.env.ANTHROPIC_API_KEY?.substring(0, 10) || 'not set';

  return res.status(200).json({
    status: 'ok',
    anthropicKeyConfigured: hasAnthropicKey,
    keyPrefix: keyPrefix + '...',
    method: req.method,
    body: req.body,
  });
}
