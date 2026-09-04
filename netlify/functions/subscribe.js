// "Sign up for updates" endpoint for the coming-soon landing page.
// Validates the email, rejects duplicates, stores the subscriber in a Resend
// audience (the mailing list Andrew can email later), and sends a notification
// to the venue on each new signup. Uses only the existing RESEND_API_KEY.

const ALLOWED_HOSTS = new Set([
  'thegeorgebhm.com',
  'www.thegeorgebhm.com',
  'thegeorgebham.com',
  'www.thegeorgebham.com',
]);

// Resend audience that holds the coming-soon subscribers. Env var wins; the
// literal is a fallback so dedup keeps working even if the var is ever unset.
const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID || '168f5d43-aa33-4b98-a425-b576c7d0702c';

const SERIF = "'Cormorant Garamond',Georgia,serif";
const SANS = "'Jost','Helvetica Neue',Arial,sans-serif";

function isAllowedOrigin(origin) {
  try {
    const host = new URL(origin).hostname;
    return ALLOWED_HOSTS.has(host) || host.endsWith('.netlify.app');
  } catch (_) {
    return false;
  }
}

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

function clean(value, maxLength = 320) {
  // Strip ASCII control characters (0x00-0x1F and 0x7F) via hex escapes.
  return String(value || '').replace(/[\x00-\x1f\x7f]/g, ' ').trim().slice(0, maxLength);
}

function escapeHtml(value) {
  return clean(value, 320)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || '');
}

function notifyHtml(email) {
  const safe = escapeHtml(email);
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Jost:wght@400;500&display=swap" rel="stylesheet"></head>
<body style="margin:0;padding:0;background:#F7F3EC;font-family:${SERIF};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F3EC;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border:1px solid #E8E0D0;border-collapse:collapse;">
        <tr><td style="background:#1C1710;padding:32px 48px;text-align:center;">
          <p style="margin:0;font-family:${SERIF};font-size:11px;letter-spacing:0.3em;color:rgba(247,243,236,0.5);text-transform:uppercase;">The</p>
          <p style="margin:4px 0 0;font-family:${SERIF};font-size:26px;letter-spacing:0.2em;color:#F7F3EC;text-transform:uppercase;">GEORGE</p>
          <p style="margin:10px 0 0;font-family:${SANS};font-size:10px;letter-spacing:0.2em;color:rgba(247,243,236,0.4);text-transform:uppercase;">New Updates Signup</p>
        </td></tr>
        <tr><td style="padding:48px;">
          <p style="margin:0 0 8px;font-family:${SANS};font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#9E7A2E;">Coming-soon list</p>
          <h1 style="margin:0 0 8px;font-family:${SERIF};font-weight:400;font-size:26px;color:#1C1710;line-height:1.2;">Someone signed up for updates</h1>
          <p style="margin:0 0 28px;font-family:${SANS};font-size:13px;color:#6B5E4E;">Added to the &ldquo;The George &mdash; Updates&rdquo; list in Resend.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E8E0D0;border-collapse:collapse;">
            <tr><td style="background:#F7F3EC;padding:16px 20px;font-family:${SANS};font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#9E7A2E;border-bottom:1px solid #E8E0D0;">Email</td></tr>
            <tr><td style="padding:16px 20px;font-family:${SERIF};font-size:16px;color:#1C1710;"><a href="mailto:${safe}" style="color:#9E7A2E;text-decoration:none;">${safe}</a></td></tr>
          </table>
        </td></tr>
        <tr><td style="background:#F7F3EC;padding:32px 48px;border-top:1px solid #E8E0D0;text-align:center;">
          <p style="margin:0;font-family:${SANS};font-size:11px;font-weight:500;letter-spacing:0.28em;text-transform:uppercase;color:#9E7A2E;">1827 1ST AVE N&nbsp;&middot;&nbsp;BIRMINGHAM, AL</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

exports.handler = async function (event) {
  const origin = event.headers && (event.headers.origin || event.headers.Origin);

  if (event.httpMethod === 'OPTIONS') return json(204, {}, origin);
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' }, origin);

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (_) {
    return json(400, { error: 'Bad request' }, origin);
  }

  // Honeypot: bots fill hidden fields. Return a clean success without recording.
  if (clean(body.company, 200)) return json(200, { status: 'ok' }, origin);

  const email = clean(body.email, 320).toLowerCase();
  if (!isEmail(email)) {
    return json(422, { status: 'invalid', error: 'Please enter a valid email address.' }, origin);
  }

  const apiKey = process.env.RESEND_API_KEY;
  const authHeaders = { Authorization: `Bearer ${apiKey}` };
  const contactBase = `https://api.resend.com/audiences/${AUDIENCE_ID}/contacts`;

  // Duplicate check: look the contact up in the audience. Resend accepts the
  // email as the contact identifier. 200 = already subscribed.
  if (apiKey) {
    try {
      const look = await fetch(`${contactBase}/${encodeURIComponent(email)}`, { headers: authHeaders });
      if (look.status === 200) {
        const data = await look.json().catch(() => ({}));
        // Guard against an unexpected 200 that isn't actually a contact.
        if (data && (data.id || (data.data && data.data.id) || data.email)) {
          return json(409, { status: 'duplicate', error: 'This email is already on the list.' }, origin);
        }
      }
      // 404 = not found (new subscriber); any other status: don't block the signup.
    } catch (err) {
      console.error('subscribe: contact lookup failed:', err);
    }
  }

  // Notify the venue. Andrew relies on this alert, so a send failure should stop
  // the flow (they can retry) rather than silently add the contact.
  if (apiKey) {
    const fromEmail = process.env.NOTIFY_FROM_EMAIL || process.env.THANK_YOU_FROM_EMAIL || 'noreply@thegeorgebhm.com';
    const toEmail = process.env.INTERNAL_NOTIFY_EMAIL || process.env.THANK_YOU_REPLY_TO || 'andrew@thegeorgebhm.com';
    try {
      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: `The George — Updates <${fromEmail}>`,
          to: [toEmail],
          reply_to: email,
          subject: `New updates signup — ${email}`,
          html: notifyHtml(email),
        }),
      });
      if (!resp.ok) throw new Error('Resend send error: ' + await resp.text());
    } catch (err) {
      console.error('subscribe: notify failed:', err);
      return json(502, { status: 'error', error: 'Could not complete signup. Please try again shortly.' }, origin);
    }
  }

  // Add to the audience (the durable subscriber list + the dedup source).
  if (apiKey) {
    try {
      const add = await fetch(contactBase, {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, unsubscribed: false }),
      });
      if (!add.ok) console.error('subscribe: add contact failed:', add.status, await add.text());
    } catch (err) {
      console.error('subscribe: add contact failed:', err);
    }
  }

  return json(200, { status: 'ok' }, origin);
};
