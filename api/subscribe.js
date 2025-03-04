// api/subscribe.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Set CORS headers to allow your site to call this endpoint from a different domain
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight (OPTIONS) request for CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Parse the request body
  const { email } = req.body || {};
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Build the payload to send to MailerLite
    const payload = { email };

    // Make the POST request to MailerLite API
    const mlResponse = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // Retrieve the API key from environment variables
        'Authorization': `Bearer ${process.env.MAILERLITE_API_KEY}`,
        'X-Version': '2038-01-19'
      },
      body: JSON.stringify(payload)
    });

    // Parse MailerLite's response
    const mlData = await mlResponse.json();

    // If MailerLite returns an error, propagate that error status and message
    if (!mlResponse.ok) {
      return res.status(mlResponse.status).json(mlData);
    }

    // On success, return the response from MailerLite
    return res.status(200).json(mlData);
  } catch (error) {
    console.error('Error calling MailerLite:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
