const ALLOWED_HOSTS = new Set([
  'thegeorgebhm.com',
  'www.thegeorgebhm.com',
  'thegeorgebham.com',
  'www.thegeorgebham.com',
]);

function json(statusCode, body, origin) {
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  if (origin && isAllowedOrigin(origin)) headers['Access-Control-Allow-Origin'] = origin;
  return { statusCode, headers, body: JSON.stringify(body) };
}

function isAllowedOrigin(origin) {
  try {
    const host = new URL(origin).hostname;
    return ALLOWED_HOSTS.has(host) || host.endsWith('.netlify.app');
  } catch (_) {
    return false;
  }
}

function clean(value, maxLength = 200) {
  return String(value || '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, maxLength);
}

function escapeHtml(value) {
  return clean(value, 1000)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || '');
}

function emailIdentity(name, email) {
  const safeName = clean(name || 'The George', 80).replace(/[<>]/g, '');
  const safeEmail = clean(email || '', 320).toLowerCase();
  if (!isEmail(safeEmail)) throw new Error('Invalid sender email');
  return `${safeName} <${safeEmail}>`;
}

exports.handler = async function (event) {
  const origin = event.headers.origin || '';

  if (event.httpMethod === 'OPTIONS') return json(204, {}, origin);
  if (event.httpMethod !== 'POST') return json(405, { ok: false, error: 'method_not_allowed' }, origin);
  if (!isAllowedOrigin(origin)) return json(403, { ok: false, error: 'origin_not_allowed' }, origin);

  try {
    if ((event.body || '').length > 10000) {
      return json(413, { ok: false, error: 'payload_too_large' }, origin);
    }

    const d = JSON.parse(event.body || '{}');
    if (clean(d.botField)) return json(200, { ok: true }, origin);

    const email = clean(d.email, 320).toLowerCase();
    if (!isEmail(email)) return json(400, { ok: false, error: 'invalid_email' }, origin);

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error('RESEND_API_KEY not set');
    const fromEmail = process.env.THANK_YOU_FROM_EMAIL || 'noreply@thegeorgebhm.com';
    const replyToEmail = process.env.THANK_YOU_REPLY_TO || 'andrew@thegeorgebhm.com';

    const firstName = escapeHtml(d.firstName || 'friend');
    const eventType = escapeHtml(d.eventType || '-');
    const venue = escapeHtml(d.venue || '-');
    const guests = escapeHtml(d.guests || '-');
    const courtyard = escapeHtml(d.courtyard || 'No');
    const bar = escapeHtml(d.bar || 'No');
    const florals = escapeHtml(d.florals || 'No');
    const total = escapeHtml(d.total || '-');

    const eventDateFormatted = d.eventDate
      ? new Date(clean(d.eventDate, 20) + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      : 'Not specified';

    const optionalRow = (label, value) => value === 'No' ? '' : `
            <tr><td style="padding:12px 20px;font-family:'Jost','Helvetica Neue',Arial,sans-serif;font-size:12px;color:#6B5E4E;border-bottom:1px solid #F0EBE3;">${label}</td><td style="padding:12px 20px;font-family:'Cormorant Garamond',Georgia,serif;font-size:13px;color:#1C1710;text-align:right;border-bottom:1px solid #F0EBE3;">${value}</td></tr>`;

    const userHtml = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Jost:wght@400;500&display=swap" rel="stylesheet"></head>
<body style="margin:0;padding:0;background:#F7F3EC;font-family:'Cormorant Garamond',Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F3EC;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border:1px solid #E8E0D0;">
        <tr><td style="background:#1C1710;padding:36px 48px;text-align:center;">
          <p style="margin:0;font-family:'Cormorant Garamond',Georgia,serif;font-size:11px;letter-spacing:0.3em;color:rgba(247,243,236,0.5);text-transform:uppercase;">The</p>
          <p style="margin:4px 0 0;font-family:'Cormorant Garamond',Georgia,serif;font-size:28px;letter-spacing:0.2em;color:#F7F3EC;text-transform:uppercase;">GEORGE</p>
          <p style="margin:8px 0 0;font-family:'Jost','Helvetica Neue',Arial,sans-serif;font-size:10px;letter-spacing:0.2em;color:rgba(247,243,236,0.4);text-transform:uppercase;">Birmingham, Alabama</p>
        </td></tr>
        <tr><td style="padding:48px;">
          <p style="margin:0 0 8px;font-family:'Jost','Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#9E7A2E;">Thank You</p>
          <h1 style="margin:0 0 24px;font-family:'Cormorant Garamond',Georgia,serif;font-weight:400;font-size:28px;color:#1C1710;line-height:1.2;">We received your inquiry,<br>${firstName}.</h1>
          <p style="margin:0 0 32px;font-family:'Jost','Helvetica Neue',Arial,sans-serif;font-size:14px;color:#6B5E4E;line-height:1.8;">Our team will be in touch within one business day to confirm availability and arrange a private tour. In the meantime, here's a summary of your estimate.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E8E0D0;margin-bottom:32px;">
            <tr><td colspan="2" style="background:#F7F3EC;padding:16px 20px;font-family:'Jost','Helvetica Neue',Arial,sans-serif;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#9E7A2E;border-bottom:1px solid #E8E0D0;">Your Estimate</td></tr>
            <tr><td style="padding:12px 20px;font-family:'Jost','Helvetica Neue',Arial,sans-serif;font-size:12px;color:#6B5E4E;border-bottom:1px solid #F0EBE3;">Event Date</td><td style="padding:12px 20px;font-family:'Cormorant Garamond',Georgia,serif;font-size:13px;color:#1C1710;text-align:right;border-bottom:1px solid #F0EBE3;">${escapeHtml(eventDateFormatted)}</td></tr>
            <tr><td style="padding:12px 20px;font-family:'Jost','Helvetica Neue',Arial,sans-serif;font-size:12px;color:#6B5E4E;border-bottom:1px solid #F0EBE3;">Event Type</td><td style="padding:12px 20px;font-family:'Cormorant Garamond',Georgia,serif;font-size:13px;color:#1C1710;text-align:right;border-bottom:1px solid #F0EBE3;">${eventType}</td></tr>
            <tr><td style="padding:12px 20px;font-family:'Jost','Helvetica Neue',Arial,sans-serif;font-size:12px;color:#6B5E4E;border-bottom:1px solid #F0EBE3;">Venue Rental</td><td style="padding:12px 20px;font-family:'Cormorant Garamond',Georgia,serif;font-size:13px;color:#1C1710;text-align:right;border-bottom:1px solid #F0EBE3;">${venue}</td></tr>
            <tr><td style="padding:12px 20px;font-family:'Jost','Helvetica Neue',Arial,sans-serif;font-size:12px;color:#6B5E4E;border-bottom:1px solid #F0EBE3;">Guests</td><td style="padding:12px 20px;font-family:'Cormorant Garamond',Georgia,serif;font-size:13px;color:#1C1710;text-align:right;border-bottom:1px solid #F0EBE3;">${guests}</td></tr>
            ${optionalRow('The Courtyard', courtyard)}
            ${optionalRow('Bar Service', bar)}
            ${optionalRow('Florals', florals)}
            <tr style="background:#1C1710;"><td style="padding:16px 20px;font-family:'Jost','Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:rgba(247,243,236,0.6);">Estimated Total</td><td style="padding:16px 20px;font-family:'Cormorant Garamond',Georgia,serif;font-size:20px;color:#9E7A2E;text-align:right;">${total}</td></tr>
          </table>
          <p style="margin:0 0 8px;font-family:'Jost','Helvetica Neue',Arial,sans-serif;font-size:12px;color:#9B8E7E;line-height:1.7;"><em>All estimates are for planning purposes only. Final pricing is confirmed in your event agreement.</em></p>
        </td></tr>
        <tr><td style="background:#F7F3EC;padding:32px 48px;border-top:1px solid #E8E0D0;text-align:center;">
          <p style="margin:0 0 12px;font-family:'Jost','Helvetica Neue',Arial,sans-serif;font-size:11px;font-weight:500;letter-spacing:0.28em;text-transform:uppercase;color:#9E7A2E;">1827 1ST AVE N&nbsp;&middot;&nbsp;BIRMINGHAM, AL</p>
          <p style="margin:0 0 4px;font-family:'Cormorant Garamond',Georgia,serif;font-size:13px;color:#1C1710;">1827 1st Avenue North, Suite 103, Birmingham, AL 35203</p>
          <p style="margin:0;font-family:'Jost','Helvetica Neue',Arial,sans-serif;font-size:11px;color:#9B8E7E;">andrew@thegeorgebhm.com&nbsp;&middot;&nbsp;thegeorgebhm.com</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: emailIdentity('The George', fromEmail),
        to: [email],
        reply_to: isEmail(replyToEmail) ? replyToEmail : undefined,
        subject: `Thank you for your inquiry, ${clean(d.firstName || 'friend', 60)} – The George`,
        html: userHtml,
      }),
    });

    if (!resp.ok) throw new Error('Resend error: ' + await resp.text());

    return json(200, { ok: true }, origin);
  } catch (err) {
    console.error('send-thanks error:', err);
    return json(500, { ok: false }, origin);
  }
};
