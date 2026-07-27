export default async function handler(req, res) {
  const apiKey = process.env.INDOCAST_API_KEY;
  const baseUrl = process.env.INDOCAST_BASE_URL;

  const { id, se = "1", ep = "1", detailPath = "" } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Parameter ID diperlukan" });
  }

  try {
    const targetUrl = `${baseUrl}/getplay?id=${id}&se=${se}&ep=${ep}&lang=in_id&detailPath=${encodeURIComponent(detailPath)}`;
    
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey
      }
    });

    const data = await response.json();
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Gagal mengambil link stream" });
  }
}
