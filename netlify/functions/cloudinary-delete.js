exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
  const API_KEY = process.env.CLOUDINARY_API_KEY;
  const API_SECRET = process.env.CLOUDINARY_API_SECRET;

  try {
    const { publicId } = JSON.parse(event.body);
    if (!publicId) throw new Error('publicId requerido');

    const timestamp = Math.floor(Date.now() / 1000);
    const str = `public_id=${publicId}&timestamp=${timestamp}${API_SECRET}`;

    // SHA-1 signature using Node crypto
    const crypto = require('crypto');
    const signature = crypto.createHash('sha1').update(str).digest('hex');

    const form = new URLSearchParams();
    form.append('public_id', publicId);
    form.append('timestamp', timestamp);
    form.append('api_key', API_KEY);
    form.append('signature', signature);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`,
      { method: 'POST', body: form }
    );

    const data = await res.json();

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(data),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: e.message }),
    };
  }
};
