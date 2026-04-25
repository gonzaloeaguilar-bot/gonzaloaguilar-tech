// api/subscribe.js — Vercel serverless function for newsletter signups
// Uses Supabase anon key + RLS INSERT policy

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email } = req.body || {};

  if (!email || !email.includes('@') || email.length > 320) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing Supabase env vars');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/subscribers`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
        source: 'gonzalo.tech'
      })
    });

    // Duplicate email (unique constraint violation)
    if (response.status === 409) {
      return res.status(200).json({ message: 'Already subscribed' });
    }

    if (!response.ok) {
      const err = await response.text();
      // Also catch unique constraint from PostgREST (code 23505)
      if (err.includes('23505') || err.includes('duplicate')) {
        return res.status(200).json({ message: 'Already subscribed' });
      }
      console.error('Supabase error:', err);
      return res.status(500).json({ error: 'Failed to subscribe' });
    }

    return res.status(200).json({ message: 'Subscribed' });
  } catch (err) {
    console.error('Subscribe error:', err);
    return res.status(500).json({ error: 'Failed to subscribe' });
  }
}
