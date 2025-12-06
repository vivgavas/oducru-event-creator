// Vercel Serverless Function - Handles Claude API calls securely

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
    const formData = req.body;

    // Build the prompt for Claude
    const prompt = `You are a friendly, enthusiastic run club organizer writing an event invitation for ODUCRU.

Event Details:
- Title: ${formData.eventTitle}
- Date: ${formData.eventDate}
- Time: ${formData.eventTime}
- Location: ${formData.location}
- Pace: ${formData.paceRange}
- Distance: ${formData.distance}
- Vibe: ${formData.vibe}

Generate TWO versions:

1. SHORT (under 280 characters, include time/location/pace, energetic tone, 1-2 emojis)
2. LONG (3-5 sentences, include all details, warm and inclusive tone)

Output format:
SHORT: [your short version]
LONG: [your long version]`;

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
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

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content[0].text;

    // Return the result
    return res.status(200).json({ content });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
