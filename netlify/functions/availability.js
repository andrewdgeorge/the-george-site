exports.handler = async function (event) {
  const BOOKING_START = new Date('2026-10-01T00:00:00.000Z');
  const CORS = { 'Access-Control-Allow-Origin': '*' };
  const successHeaders = {
    ...CORS,
    'Cache-Control': 'public, max-age=3600',
    'Content-Type': 'application/json',
  };
  const errorHeaders = {
    ...CORS,
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }

  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    const rawCalId = process.env.GOOGLE_CALENDAR_ID;
    if (!apiKey || !rawCalId) throw new Error('Missing Google Calendar env');
    const calId  = encodeURIComponent(rawCalId);
    const today = new Date();
    const now = today > BOOKING_START ? today : BOOKING_START;
    const future = new Date(now);
    future.setMonth(future.getMonth() + 18);

    const url =
      `https://www.googleapis.com/calendar/v3/calendars/${calId}/events` +
      `?key=${apiKey}` +
      `&timeMin=${encodeURIComponent(now.toISOString())}` +
      `&timeMax=${encodeURIComponent(future.toISOString())}` +
      `&singleEvents=true&orderBy=startTime` +
      `&fields=items(start,end)&maxResults=500`;

    const resp = await fetch(url);
    if (!resp.ok) throw new Error('GCal ' + resp.status);

    const items = (await resp.json()).items || [];
    const blocked = [];

    for (const item of items) {
      if (item.start.date) {
        // All-day event — end.date is exclusive (day after last day)
        const s = new Date(item.start.date + 'T00:00:00');
        const e = new Date((item.end?.date || item.start.date) + 'T00:00:00');
        const cur = new Date(s);
        while (cur < e) {
          blocked.push(cur.toISOString().slice(0, 10));
          cur.setDate(cur.getDate() + 1);
        }
      } else if (item.start.dateTime) {
        blocked.push(item.start.dateTime.slice(0, 10));
      }
    }

    return {
      statusCode: 200,
      headers: successHeaders,
      body: JSON.stringify([...new Set(blocked)].sort()),
    };
  } catch (err) {
    console.error('availability function error:', err);
    return {
      statusCode: 503,
      headers: errorHeaders,
      body: JSON.stringify({ error: 'availability_unavailable' }),
    };
  }
};
