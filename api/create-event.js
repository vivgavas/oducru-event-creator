// Vercel Serverless Function - Creates event and returns RSVP link

const { google } = require('googleapis');

// Generate unique event ID
function generateEventId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `evt_${timestamp}_${random}`;
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const eventData = req.body;
    const eventId = generateEventId();

    // Set up Google Sheets authentication
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // Save event to Events sheet
    const rowData = [
      eventId,
      eventData.eventTitle,
      eventData.eventDate,
      eventData.eventTime,
      eventData.location,
      eventData.paceRange,
      eventData.distance || 'Not specified',
      eventData.vibe || 'N/A',
      new Date().toISOString()
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Events!A:I',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [rowData]
      }
    });

    // Call Claude API to generate invitation
    const prompt = `You are a friendly, enthusiastic run club organizer writing an event invitation.

Event Details:
- Title: ${eventData.eventTitle}
- Date: ${eventData.eventDate}
- Time: ${eventData.eventTime}
- Location: ${eventData.location}
- Pace: ${eventData.paceRange}
- Distance: ${eventData.distance}
- Vibe: ${eventData.vibe}

Generate TWO versions:

1. SHORT (under 280 characters, include time/location/pace, energetic tone, NO emojis or maximum 1 simple emoji like ☕)
2. LONG (3-5 sentences, include all details, warm and inclusive tone, NO emojis)

Important guidelines:
- Do NOT mention specific club names
- Use generic terms like "runners" or "everyone" instead of "fam"
- Keep it professional and welcoming
- Avoid excessive or decorative emojis
- All paces should be genuinely welcomed

Output format:
SHORT: [your short version]
LONG: [your long version]`;

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!claudeResponse.ok) {
      throw new Error(`Claude API error: ${claudeResponse.status}`);
    }

    const claudeData = await claudeResponse.json();
    const content = claudeData.content[0].text;

    // Generate RSVP link
    const baseUrl = 'https://oducru-event-creator.vercel.app';
    const rsvpLink = `${baseUrl}/rsvp.html?event=${eventId}`;

    // Return everything
    return res.status(200).json({
      eventId,
      content,
      rsvpLink
    });

  } catch (error) {
    console.error('Error creating event:', error);
    return res.status(500).json({
      error: 'Failed to create event',
      details: error.message
    });
  }
}
