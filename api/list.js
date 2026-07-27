module.exports = async (req, res) => {
  // Set CORS Header
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const apiKey = process.env.INDOCAST_API_KEY;
  const baseUrl = process.env.INDOCAST_BASE_URL || "https://indocast.site/api/dramovnime";

  if (!apiKey) {
    return res.status(500).json({ error: "INDOCAST_API_KEY belum terdeteksi di Vercel Environment Variables" });
  }

  try {
    const page = req.query.page || "1";
    const channelId = req.query.channelId || "2";

    const response = await fetch(`${baseUrl}/list`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey
      },
      body: JSON.stringify({
        channelId: channelId,
        page: page,
        perPage: "12",
        sort: "ForYou",
        genre: "All",
        country: "All"
      })
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message || "Gagal terhubung ke API Indocast" });
  }
};
