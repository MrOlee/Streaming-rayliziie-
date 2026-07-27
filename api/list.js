module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Fallback ke API Key asli jika Env Var Vercel belum tersetting
  const apiKey = process.env.INDOCAST_API_KEY || "bb47332ceca91e3a2c97128a40c798a69306400072cc4b5a352800697069e45c";
  const baseUrl = process.env.INDOCAST_BASE_URL || "https://indocast.site/api/dramovnime";

  const page = req.query.page || "1";
  const channelId = req.query.channelId || "2";

  try {
    const response = await fetch(`${baseUrl}/list`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "User-Agent": "Mozilla/5.0"
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

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.status(500).json({ error: "Respon server bukan JSON", raw: text.substring(0, 150) });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message || "Gagal menghubungkan ke Indocast API" });
  }
};
