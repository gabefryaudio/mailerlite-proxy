// api/subscribe.js

export default async function handler(req, res) {
  // Optionally set CORS headers here, but vercel.json should handle them too.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Parse the request body
  const { email } = req.body || {};
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Build the payload for MailerLite
    const payload = { email };

    // Use the built-in fetch (no node-fetch import needed)
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
      return res.status(mlResponse.status).json(mlData);
    }

    // Return MailerLite's successful response
    return res.status(200).json(mlData);

  } catch (error) {
    console.error('Error calling MailerLite:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
