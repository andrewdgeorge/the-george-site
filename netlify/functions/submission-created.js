// Netlify fires this automatically on every verified form submission.
// It emails a branded, scannable lead notification to the venue via Resend.

const SERIF = "'Cormorant Garamond',Georgia,serif";
const SANS = "'Jost','Helvetica Neue',Arial,sans-serif";

// Control characters: all of 0x00-0x1f plus 0x7f. Built via RegExp string to
// avoid embedding literal control bytes in source.
const CONTROL = new RegExp('[\\u0000-\\u001f\\u007f]', 'g');
// Same, but preserves newline (0x0a) so multi-line messages keep their breaks.
const CONTROL_KEEP_NL = new RegExp('[\\u0000-\\u0009\\u000b-\\u001f\\u007f]', 'g');

function clean(value, maxLength = 200) {
  return String(value || '').replace(CONTROL, ' ').trim().slice(0, maxLength);
}

function escapeHtml(value) {
  return clean(value, 1000)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Escape for HTML but preserve newlines (the message carries the calculator summary).
function escapeMultiline(value, maxLength = 4000) {
  return String(value || '')
    .replace(/\r\n/g, '\n')
    .replace(CONTROL_KEEP_NL, ' ')
    .slice(0, maxLength)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\n/g, '<br>');
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
  try {
    const body = JSON.parse(event.body || '{}');
    const payload = body.payload || {};
    const d = payload.data || {};

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error('RESEND_API_KEY not set');

    const fromEmail = process.env.NOTIFY_FROM_EMAIL || process.env.THANK_YOU_FROM_EMAIL || 'noreply@thegeorgebhm.com';
    const toEmail = process.env.INTERNAL_NOTIFY_EMAIL || process.env.THANK_YOU_REPLY_TO || 'andrew@thegeorgebhm.com';

    // Plain values (subject line, link hrefs)
    const firstNamePlain = clean(d['first-name'], 60);
    const lastNamePlain = clean(d['last-name'], 60);
    const fullNamePlain = [firstNamePlain, lastNamePlain].filter(Boolean).join(' ') || 'New lead';
    const eventTypePlain = clean(d['event-type'], 60) || 'event';
    const emailPlain = clean(d.email || payload.email, 320).toLowerCase();
    const phoneHref = clean(d.phone, 40).replace(/[^0-9+]/g, '');

    // Escaped values (HTML body)
    const eventType = escapeHtml(d['event-type'] || '—');
    const phone = escapeHtml(d.phone || '—');
    const guests = escapeHtml(d['guest-count'] || d['calc-guests'] || '—');
    const venue = escapeHtml(d['calc-venue'] || '—');
    const courtyard = escapeHtml(d['calc-courtyard'] || 'No');
    const bar = escapeHtml(d['calc-bar'] || 'No');
    const florals = escapeHtml(d['calc-florals'] || 'No');
    const total = escapeHtml(d['calc-total'] || '—');
    const message = escapeMultiline(d.message);
    const formName = escapeHtml(payload.form_name || d['form-name'] || 'inquiry');

    const rawDate = clean(d['event-date'], 20);
    const dateObj = rawDate ? new Date(rawDate + 'T12:00:00') : null;
    const dateValid = dateObj && !isNaN(dateObj.getTime());
    const eventDateLong = dateValid
      ? dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      : 'Not specified';
    const eventDateShort = dateValid
      ? dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      : '';

    const contactRow = (label, valueHtml) => `
            <tr><td style="padding:12px 20px;font-family:${SANS};font-size:12px;color:#6B5E4E;border-bottom:1px solid #F0EBE3;">${label}</td><td style="padding:12px 20px;font-family:${SERIF};font-size:14px;color:#1C1710;text-align:right;border-bottom:1px solid #F0EBE3;">${valueHtml}</td></tr>`;

    const optionalRow = (label, value) => value === 'No' || value === '—' ? '' : `
            <tr><td style="padding:12px 20px;font-family:${SANS};font-size:12px;color:#6B5E4E;border-bottom:1px solid #F0EBE3;">${label}</td><td style="padding:12px 20px;font-family:${SERIF};font-size:13px;color:#1C1710;text-align:right;border-bottom:1px solid #F0EBE3;">${value}</td></tr>`;

    const emailCell = isEmail(emailPlain)
      ? `<a href="mailto:${emailPlain}" style="color:#9E7A2E;text-decoration:none;">${escapeHtml(emailPlain)}</a>`
      : '—';
    const phoneCell = phoneHref
      ? `<a href="tel:${phoneHref}" style="color:#9E7A2E;text-decoration:none;">${phone}</a>`
      : '—';

    const messageBlock = message ? `
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E8E0D0;margin-bottom:32px;border-collapse:collapse;">
            <tr><td style="background:#F7F3EC;padding:16px 20px;font-family:${SANS};font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#9E7A2E;border-bottom:1px solid #E8E0D0;">Message</td></tr>
            <tr><td style="padding:16px 20px;font-family:${SANS};font-size:13px;color:#3D3529;line-height:1.7;">${message}</td></tr>
          </table>` : '';

    const adminHtml = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Jost:wght@400;500&display=swap" rel="stylesheet"></head>
<body style="margin:0;padding:0;background:#F7F3EC;font-family:${SERIF};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F3EC;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border:1px solid #E8E0D0;border-collapse:collapse;">
        <tr><td style="background:#1C1710;padding:32px 48px;text-align:center;">
          <p style="margin:0;font-family:${SERIF};font-size:11px;letter-spacing:0.3em;color:rgba(247,243,236,0.5);text-transform:uppercase;">The</p>
          <p style="margin:4px 0 0;font-family:${SERIF};font-size:26px;letter-spacing:0.2em;color:#F7F3EC;text-transform:uppercase;">GEORGE</p>
          <p style="margin:10px 0 0;font-family:${SANS};font-size:10px;letter-spacing:0.2em;color:rgba(247,243,236,0.4);text-transform:uppercase;">New Inquiry &middot; ${formName}</p>
        </td></tr>
        <tr><td style="padding:48px;">
          <p style="margin:0 0 8px;font-family:${SANS};font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#9E7A2E;">Lead</p>
          <h1 style="margin:0 0 8px;font-family:${SERIF};font-weight:400;font-size:30px;color:#1C1710;line-height:1.15;">${escapeHtml(fullNamePlain)}</h1>
          <p style="margin:0 0 32px;font-family:${SANS};font-size:13px;color:#6B5E4E;">Submitted via the ${eventType} inquiry form.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E8E0D0;margin-bottom:32px;border-collapse:collapse;">
            <tr><td colspan="2" style="background:#F7F3EC;padding:16px 20px;font-family:${SANS};font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#9E7A2E;border-bottom:1px solid #E8E0D0;">Contact</td></tr>
            ${contactRow('Email', emailCell)}
            ${contactRow('Phone', phoneCell)}
            ${contactRow('Event Type', eventType)}
            ${contactRow('Event Date', escapeHtml(eventDateLong))}
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E8E0D0;margin-bottom:32px;border-collapse:collapse;">
            <tr><td colspan="2" style="background:#F7F3EC;padding:16px 20px;font-family:${SANS};font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#9E7A2E;border-bottom:1px solid #E8E0D0;">Estimate</td></tr>
            <tr><td style="padding:12px 20px;font-family:${SANS};font-size:12px;color:#6B5E4E;border-bottom:1px solid #F0EBE3;">Venue Rental</td><td style="padding:12px 20px;font-family:${SERIF};font-size:13px;color:#1C1710;text-align:right;border-bottom:1px solid #F0EBE3;">${venue}</td></tr>
            <tr><td style="padding:12px 20px;font-family:${SANS};font-size:12px;color:#6B5E4E;border-bottom:1px solid #F0EBE3;">Guests</td><td style="padding:12px 20px;font-family:${SERIF};font-size:13px;color:#1C1710;text-align:right;border-bottom:1px solid #F0EBE3;">${guests}</td></tr>
            ${optionalRow('The Courtyard', courtyard)}
            ${optionalRow('Bar Service', bar)}
            ${optionalRow('Florals', florals)}
            <tr style="background:#1C1710;"><td style="padding:16px 20px;font-family:${SANS};font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:rgba(247,243,236,0.6);">Estimated Total</td><td style="padding:16px 20px;font-family:${SERIF};font-size:20px;color:#9E7A2E;text-align:right;">${total}</td></tr>
          </table>
          ${messageBlock}
          <p style="margin:0;font-family:${SANS};font-size:12px;color:#9B8E7E;line-height:1.7;">Reply directly to this email to reach ${escapeHtml(firstNamePlain || 'the inquirer')}.</p>
        </td></tr>
        <tr><td style="background:#F7F3EC;padding:32px 48px;border-top:1px solid #E8E0D0;text-align:center;">
          <p style="margin:0;font-family:${SANS};font-size:11px;font-weight:500;letter-spacing:0.28em;text-transform:uppercase;color:#9E7A2E;">1827 1ST AVE N&nbsp;&middot;&nbsp;BIRMINGHAM, AL</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const subjectDate = eventDateShort ? ` · ${eventDateShort}` : '';
    const subject = `New ${clean(eventTypePlain, 60)} inquiry — ${clean(fullNamePlain, 80)}${subjectDate}`;

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: emailIdentity('The George — Inquiries', fromEmail),
        to: [toEmail],
        reply_to: isEmail(emailPlain) ? emailPlain : undefined,
        subject,
        html: adminHtml,
      }),
    });

    if (!resp.ok) throw new Error('Resend error: ' + await resp.text());

    return { statusCode: 200, body: 'ok' };
  } catch (err) {
    console.error('submission-created error:', err);
    // Return 200 so Netlify does not retry; the submission itself is already stored.
    return { statusCode: 200, body: 'logged' };
  }
};
