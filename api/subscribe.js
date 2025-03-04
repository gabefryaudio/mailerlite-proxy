// api/subscribe.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Set CORS headers for every response
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request by ending the response
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  // Parse the request body
  const { email } = req.body || {};
  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }

  try {
    // Build the payload for MailerLite
    const payload = { email };

    // Make the request to MailerLite using the API key from environment variables
    const mlResponse = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${process.env.MAILERLITE_API_KEY}`,
        'X-Version': '2038-01-19'
      },
      body: JSON.stringify(payload)
    });

    const mlData = await mlResponse.json();

    if (!mlResponse.ok) {
      res.status(mlResponse.status).json(mlData);
      return;
    }

    // Return MailerLite's successful response
    res.status(200).json(mlData);
  } catch (error) {
    console.error('Error calling MailerLite:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
