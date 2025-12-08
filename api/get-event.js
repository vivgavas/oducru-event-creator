// Vercel Serverless Function - Fetches event details by ID

const { google } = require('googleapis');

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const eventId = req.query.id;

    if (!eventId) {
      return res.status(400).json({ error: 'Event ID required' });
    }

    // Set up Google Sheets authentication
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // Get all events
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Events!A:I',
    });

    const rows = response.data.values;
    
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'No events found' });
    }

    // Find event by ID (skip header row)
    const eventRow = rows.slice(1).find(row => row[0] === eventId);

    if (!eventRow) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Return event details
    return res.status(200).json({
      eventId: eventRow[0],
      eventTitle: eventRow[1],
      eventDate: eventRow[2],
      eventTime: eventRow[3],
      location: eventRow[4],
      paceRange: eventRow[5],
      distance: eventRow[6],
      vibe: eventRow[7],
      createdAt: eventRow[8]
    });

  } catch (error) {
    console.error('Error fetching event:', error);
    return res.status(500).json({
      error: 'Failed to fetch event',
      details: error.message
    });
  }
}
