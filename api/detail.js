module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const apiKey = process.env.INDOCAST_API_KEY;
  const baseUrl = process.env.INDOCAST_BASE_URL || "https://indocast.site/api/dramovnime";

  const { detailPath = "", se = "0" } = req.query;

  try {
    const targetUrl = `${baseUrl}/detaildata?se=${se}&detailPath=${encodeURIComponent(detailPath)}`;
    
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey
      }
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Gagal mengambil data detail anime" });
  }
};
