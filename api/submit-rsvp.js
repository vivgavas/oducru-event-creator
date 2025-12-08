// Vercel Serverless Function - Saves RSVP data to Google Sheets

const { google } = require('googleapis');

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
    // Parse RSVP data
    const rsvpData = req.body;

    // Set up Google Sheets authentication
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // Prepare row data
    const rowData = [
      rsvpData.eventId || 'N/A',
      rsvpData.eventTitle || 'N/A',
      rsvpData.name,
      rsvpData.email,
      rsvpData.pace,
      rsvpData.experience,
      rsvpData.timestamp
    ];

    // Append data to sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:G', // Writes to columns A through G
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [rowData]
      }
    });

    return res.status(200).json({ 
      success: true,
      message: 'RSVP submitted successfully' 
    });

  } catch (error) {
    console.error('Error submitting RSVP:', error);
    return res.status(500).json({ 
      error: 'Failed to submit RSVP',
      details: error.message 
    });
  }
}
