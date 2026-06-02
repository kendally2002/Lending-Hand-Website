exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Use Netlify Blobs via REST API (no package needed)
    const siteId = process.env.SITE_ID || 'e349ba85-12f3-41a5-a0cd-68a9fae29143';
    const token  = process.env.NETLIFY_TOKEN || 'nfp_6i3L1H4nEo6iqSRiN3ZVNnY8weGXPFXi63d2';
    const blobUrl = `https://api.netlify.com/api/v1/sites/${siteId}/blobs/lhr-site-data`;

    if (event.httpMethod === 'GET') {
      const res = await fetch(blobUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.text();
        return {
          statusCode: 200,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: data
        };
      }
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'No data yet' }) };
    }

    if (event.httpMethod === 'POST') {
      const body = event.body;
      if (!body) return { statusCode: 400, headers, body: JSON.stringify({ error: 'No data' }) };
      JSON.parse(body); // validate JSON
      const res = await fetch(blobUrl, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: body
      });
      if (res.ok) {
        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
      }
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Save failed' }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
