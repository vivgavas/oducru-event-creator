// Vercel Serverless Function - Creates event and returns RSVP link

const { google } = require('googleapis');

// Generate unique event ID
function generateEventId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `evt_${timestamp}_${random}`;
}

// Determine pace category and guidance for AI
function getPaceGuidance(paceRange) {
  const pace = paceRange.toLowerCase();
  
  // Extract first number to determine pace category
  // Fast: 6:00-7:59 min/mile
  // Moderate: 8:00-10:59 min/mile  
  // Easy/Beginner: 11:00+ min/mile
  
  if (pace.includes('6:') || pace.includes('7:')) {
    return {
      category: 'FAST',
      guidance: 'This is a FAST-paced workout for experienced runners. Be clear this is designed for runners training at high intensity. Use language like "challenging", "speed work", "tempo", or "push your limits". Do NOT say "all paces welcome" - this pace range is for advanced runners.'
    };
  } else if (pace.includes('11:') || pace.includes('12:') || pace.includes('beginner') || pace.includes('easy')) {
    return {
      category: 'EASY',
      guidance: 'This is a beginner-friendly, easy-paced run. Emphasize it\'s welcoming to new runners, walkers, and those taking it easy. Use inclusive language like "all paces welcome", "no one left behind", or "perfect for beginners".'
    };
  } else {
    return {
      category: 'MODERATE',
      guidance: 'This is a moderate-paced run suitable for regular runners. Strike a balance - welcoming but not necessarily for complete beginners. Mention it\'s great for consistent runners looking to maintain their fitness.'
    };
  }
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

    // Get pace-aware guidance for AI prompt
    const paceInfo = getPaceGuidance(eventData.paceRange);

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

    // Call Claude API to generate invitation with pace-aware prompt
    const prompt = `You are a friendly, enthusiastic run club organizer writing an event invitation.

IMPORTANT - PACE GUIDANCE:
${paceInfo.guidance}

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
- Match the tone to the pace category (fast workout vs easy social run)

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

    // Generate RSVP link with all event details in URL params
    const baseUrl = 'https://oducru-event-creator.vercel.app';
    const rsvpLink = `${baseUrl}/rsvp.html?event=${eventId}&title=${encodeURIComponent(eventData.eventTitle)}&date=${eventData.eventDate}&time=${eventData.eventTime}&location=${encodeURIComponent(eventData.location)}&pace=${encodeURIComponent(eventData.paceRange)}`;

    // Return everything
    return res.status(200).json({
      eventId,
      content,
      rsvpLink,
      paceCategory: paceInfo.category // Include for debugging if needed
    });

  } catch (error) {
    console.error('Error creating event:', error);
    return res.status(500).json({
      error: 'Failed to create event',
      details: error.message
    });
  }
}
