const logger = require('../config/logger');

const EMAIL_API_URL = process.env.EMAIL_API_URL || '';
const EMAIL_API_KEY = process.env.EMAIL_API_KEY || '';
const EMAIL_FROM = process.env.EMAIL_FROM || '';

function validateProviderUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error('EMAIL_API_URL must be a valid HTTPS URL.');
  }
  const localHttp = process.env.NODE_ENV !== 'production'
    && url.protocol === 'http:'
    && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if (url.protocol !== 'https:' && !localHttp) {
    throw new Error('EMAIL_API_URL must use HTTPS, except for local development providers.');
  }
  if (url.username || url.password || url.hash) {
    throw new Error('EMAIL_API_URL must not contain credentials or a fragment.');
  }
  return url.toString();
}

async function sendEmail({ to, subject, text, html }) {
  if (!EMAIL_API_URL || !EMAIL_API_KEY || !EMAIL_FROM) {
    throw new Error('Email delivery is not configured. Set EMAIL_API_URL, EMAIL_API_KEY, and EMAIL_FROM.');
  }
  if (typeof to !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    throw new TypeError('A valid recipient email address is required.');
  }
  if (typeof subject !== 'string' || !subject.trim() || subject.length > 200) {
    throw new TypeError('Email subject must be between 1 and 200 characters.');
  }
  if (typeof text !== 'string' && typeof html !== 'string') {
    throw new TypeError('Email text or HTML content is required.');
  }

  const response = await fetch(validateProviderUrl(EMAIL_API_URL), {
    method: 'POST',
    redirect: 'error',
    headers: {
      Authorization: `Bearer ${EMAIL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: EMAIL_FROM, to, subject, text, html }),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) {
    logger.error('Email provider rejected message.', { status: response.status });
    throw new Error(`Email provider request failed (${response.status}).`);
  }
  return { accepted: true };
}

module.exports = { sendEmail };