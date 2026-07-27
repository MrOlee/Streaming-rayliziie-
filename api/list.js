module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.INDOCAST_API_KEY || "bb47332ceca91e3a2c97128a40c798a69306400072cc4b5a352800697069e45c";
  
  const page = req.query.page || req.body?.page || "1";
  const channelId = req.query.channelId || req.body?.channelId || "2";

  try {
    const response = await fetch("https://indocast.site/api/dramovnime/list", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "User-Agent": "Mozilla/5.0" },
      body: JSON.stringify({
        channelId: String(channelId),
        page: String(page),
        perPage: "12",
        sort: "ForYou",
        genre: "All",
        country: "All"
      })
    });
    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
