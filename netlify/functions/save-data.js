const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const store = getStore('site-data');

    // GET — load data
    if (event.httpMethod === 'GET') {
      try {
        const data = await store.get('lhr-site-data');
        if (data) {
          return {
            statusCode: 200,
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: data
          };
        } else {
          return { statusCode: 404, headers, body: JSON.stringify({ error: 'No data yet' }) };
        }
      } catch (e) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'No data yet' }) };
      }
    }

    // POST — save data
    if (event.httpMethod === 'POST') {
      const body = event.body;
      if (!body) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'No data provided' }) };
      }
      // Validate it's valid JSON
      JSON.parse(body);
      await store.set('lhr-site-data', body);
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true })
      };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  } catch (err) {
    console.error('Function error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
