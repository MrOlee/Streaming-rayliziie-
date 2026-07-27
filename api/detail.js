module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.INDOCAST_API_KEY || "bb47332ceca91e3a2c97128a40c798a69306400072cc4b5a352800697069e45c";
  const { detailPath = "", se = "0" } = req.query;

  try {
    const url = `https://indocast.site/api/dramovnime/detaildata?se=${se}&detailPath=${encodeURIComponent(detailPath)}`;
    const response = await fetch(url, {
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "User-Agent": "Mozilla/5.0" }
    });
    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
