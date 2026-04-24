const CONTACT_TO = 'info@malkacomm.com';

const escapeHtml = value => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const isEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ''));

const clean = value => String(value || '').trim();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM || 'Malka Communications <onboarding@resend.dev>';

  if (!resendApiKey) {
    return res.status(503).json({ error: 'Email service is not configured' });
  }

  const payload = req.body || {};

  if (payload.companyWebsite) {
    return res.status(200).json({ ok: true });
  }

  const requestType = clean(payload.requestType);
  const name = clean(payload.name);
  const email = clean(payload.email);
  const phone = clean(payload.phone);
  const topic = clean(payload.topic);
  const message = clean(payload.message);

  if (!name || !isEmail(email) || !topic || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const requestLabel = requestType === 'interpreter'
    ? 'Interpreter interested in working with Malka'
    : 'Service inquiry';

  const subject = requestType === 'interpreter'
    ? `Interpreter inquiry from ${name}`
    : `Service inquiry from ${name}: ${topic}`;

  const text = [
    requestLabel,
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone || 'Not provided'}`,
    `Topic: ${topic}`,
    '',
    message
  ].join('\n');

  const html = `
    <h2>${escapeHtml(requestLabel)}</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(phone || 'Not provided')}</p>
    <p><strong>Topic:</strong> ${escapeHtml(topic)}</p>
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from,
      to: CONTACT_TO,
      reply_to: email,
      subject,
      text,
      html
    })
  });

  if (!response.ok) {
    return res.status(502).json({ error: 'Email delivery failed' });
  }

  return res.status(200).json({ ok: true });
}
