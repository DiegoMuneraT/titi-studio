exports.handler = async () => {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_OWNER = 'DiegoMuneraT';
  const GITHUB_REPO = 'titi-studio';
  const GITHUB_FILE = 'gallery.json';

  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github+json',
        },
      }
    );

    if (res.status === 404) {
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ images: [], artistPhoto: null, sha: null }),
      };
    }

    const data = await res.json();
    const parsed = JSON.parse(
      Buffer.from(data.content.replace(/\n/g, ''), 'base64').toString('utf-8')
    );

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        images: parsed.images || [],
        artistPhoto: parsed.artistPhoto || null,
        sha: data.sha,
      }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: e.message }),
    };
  }
};
