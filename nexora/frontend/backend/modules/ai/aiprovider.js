const config = require('../../config/aiProvider');
const ApiError = require('../../utils/ApiErroir');

async function completeChat(messages) {
  if (!config.isConfigured) {
    throw new ApiError(503, 'AI provider is not configured.', 'AI_UNAVAILABLE');
  }
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    redirect: 'error',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      max_tokens: 1200,
      temperature: 0.4,
    }),
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) {
    throw new ApiError(502, 'AI provider request failed.', 'AI_PROVIDER_ERROR');
  }
  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new ApiError(502, 'AI provider returned an invalid response.', 'AI_PROVIDER_ERROR');
  }
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) {
    throw new ApiError(502, 'AI provider returned an invalid response.', 'AI_PROVIDER_ERROR');
  }
  return content.trim();
}

module.exports = { completeChat };