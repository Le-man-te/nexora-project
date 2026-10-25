require('./env');

const provider = process.env.AI_PROVIDER || 'openai-compatible';
const baseUrl = process.env.AI_BASE_URL || 'https://api.openai.com/v1';
const model = process.env.AI_MODEL || '';
const apiKey = process.env.AI_API_KEY || '';
const parsedBaseUrl = new URL(baseUrl);
const insecureLocalHttp = process.env.NODE_ENV !== 'production'
  && parsedBaseUrl.protocol === 'http:'
  && ['localhost', '127.0.0.1', '[::1]'].includes(parsedBaseUrl.hostname);

if (parsedBaseUrl.protocol !== 'https:' && !insecureLocalHttp) {
  throw new Error('AI_BASE_URL must use HTTPS, except for local development providers.');
}

module.exports = Object.freeze({
  provider,
  baseUrl: baseUrl.replace(/\/+$/, ''),
  model,
  apiKey,
  isConfigured: Boolean(model && apiKey),
});