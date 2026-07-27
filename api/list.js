export default async function handler(req, res) {
  // Hanya izinkan method POST/GET
  const apiKey = process.env.INDOCAST_API_KEY;
  const baseUrl = process.env.INDOCAST_BASE_URL;

  const page = req.query.page || "1";
  const channelId = req.query.channelId || "2";

  try {
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
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Gagal mengambil data dari server" });
  }
}
