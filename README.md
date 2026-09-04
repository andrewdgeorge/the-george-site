# The George Website

Static marketing site for The George in Birmingham, Alabama.

## Structure

- `index.html` - Homepage with inline styles and scripts.
- `landing.css` - Shared styles for event landing pages.
- `calc.js` - Shared landing-page pricing calculator.
- `avail.js` - Shared landing-page availability calendar.
- `form-toast.js` - Shared AJAX Netlify Forms handler for landing pages.
- `netlify/functions/availability.js` - Google Calendar availability proxy.
- `netlify/functions/send-thanks.js` - Resend thank-you email sender.
- `*.html` - Event-specific landing pages.

## Local Preview

```bash
python3 -m http.server 4173
```

Open `http://127.0.0.1:4173/`.

Netlify Functions are only fully available in Netlify or via the Netlify CLI.

## Required Environment Variables

- `GOOGLE_API_KEY`
- `GOOGLE_CALENDAR_ID`
- `RESEND_API_KEY`
- `THANK_YOU_FROM_EMAIL` - optional, defaults to `noreply@thegeorgebhm.com`; the domain must be verified in Resend.
- `THANK_YOU_REPLY_TO` - optional, defaults to `andrew@thegeorgebhm.com`.

## Deploy

The site is configured for Netlify:

- Publish directory: `.`
- Functions directory: `netlify/functions`
- Node version: `20`

See `netlify.toml` for the source of truth.

## QA Checklist

- Submit each inquiry form and verify the Netlify submission includes calculator fields.
- Confirm the thank-you email sends only after the form submission succeeds.
- Verify the availability calendar shows booked dates when Google Calendar is reachable.
- Verify the availability calendar shows the unavailable message when the function returns an error.
