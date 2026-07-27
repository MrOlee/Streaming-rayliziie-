const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Referer': 'https://indocast.site/'
};

// Data Cadangan jika API Eksternal terblokir oleh Cloudflare di Vercel
const DEMO_RECENT = [
  { title: "Solo Leveling Sub Indo", poster: "https://images.justwatch.com/poster/312015259/s718/solo-leveling.jpg", slug: "solo-leveling", episode: "Eps 12" },
  { title: "Jujutsu Kaisen Season 2 Sub Indo", poster: "https://m.media-amazon.com/images/M/MV5BNGY4MTg3NjgtMmFkIN00NTg5LThmZjItMWZmN2M1ODk3NGJhXkEyXkFqcGdeQXVyMzgxODM4NjM@._V1_.jpg", slug: "jujutsu-kaisen-s2", episode: "Eps 23" },
  { title: "Demon Slayer: Hashira Training", poster: "https://m.media-amazon.com/images/M/MV5BZjZjNzI5MDctY2JiNi00MGVmLTk3NDktM2FlZWJiNTQwOWGlXkEyXkFqcGdeQXVyMTEzMTI1Mjk3._V1_.jpg", slug: "demon-slayer-s4", episode: "Eps 8" },
  { title: "One Piece Sub Indo", poster: "https://m.media-amazon.com/images/M/MV5BODcwNWE3OTMtMDc3MS00NDFjLWE1OTAtNDU3NjgxMDUyNzA1XkEyXkFqcGdeQXVyNQwE2MzI4OA@@._V1_.jpg", slug: "one-piece", episode: "Eps 1100" },
  { title: "Kaiju No. 8 Sub Indo", poster: "https://m.media-amazon.com/images/M/MV5BMTY3NTY0MDg4MV5BMl5BanBnXkFtZTgwNTc4MzU2MzE@._V1_.jpg", slug: "kaiju-no-8", episode: "Eps 12" }
];

// Endpoint: Recent / Terbaru
app.get('/api/recent', async (req, res) => {
  const page = req.query.page || 1;

  // Primary Source: Indocast API
  try {
    const response = await axios.get(`https://indocast.site/api/dramovnime/latest?page=${page}`, {
      headers: HEADERS,
      timeout: 5000
    });
    if (response.data && (response.data.data || response.data.results || Array.isArray(response.data))) {
      return res.json(response.data);
    }
  } catch (err) {
    console.warn('Indocast API terblokir/error:', err.message);
  }

  // Backup Source: Consumet API
  try {
    const backupRes = await axios.get('https://api.consumet.org/anime/gogoanime/recent-episodes', { timeout: 4000 });
    if (backupRes.data && backupRes.data.results) {
      const formatted = backupRes.data.results.map(i => ({
        title: i.title,
        poster: i.image,
        slug: i.episodeId || i.id,
        episode: `Eps ${i.episodeNumber}`
      }));
      return res.json({ status: true, source: 'backup', data: formatted });
    }
  } catch (e) {
    console.warn('Backup API error:', e.message);
  }

  // Ultimate Fallback jika semua API terblokir
  return res.json({ status: true, source: 'fallback', data: DEMO_RECENT });
});

// Endpoint: Search / Cari Anime
app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ status: false, message: 'Query kosong' });

  try {
    const response = await axios.get(`https://indocast.site/api/dramovnime/search?q=${encodeURIComponent(query)}`, {
      headers: HEADERS,
      timeout: 5000
    });
    if (response.data) return res.json(response.data);
  } catch (err) {
    console.warn('Search Indocast Error:', err.message);
  }

  try {
    const backupRes = await axios.get(`https://api.consumet.org/anime/gogoanime/${encodeURIComponent(query)}`, { timeout: 4000 });
    if (backupRes.data && backupRes.data.results) {
      const formatted = backupRes.data.results.map(i => ({
        title: i.title,
        poster: i.image,
        slug: i.id
      }));
      return res.json({ status: true, source: 'backup', data: formatted });
    }
  } catch (e) {}

  return res.json({ status: true, data: [] });
});

// Endpoint: Detail Anime
app.get('/api/info/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    const response = await axios.get(`https://indocast.site/api/dramovnime/detail/${slug}`, {
      headers: HEADERS,
      timeout: 5000
    });
    if (response.data) return res.json(response.data);
  } catch (err) {}

  try {
    const backupRes = await axios.get(`https://api.consumet.org/anime/gogoanime/info/${slug}`, { timeout: 4000 });
    if (backupRes.data) {
      const info = backupRes.data;
      return res.json({
        status: true,
        data: {
          title: info.title,
          synopsis: info.description || 'Sinopsis tidak tersedia.',
          episodes: (info.episodes || []).map(e => ({
            slug: e.id,
            episode: `Episode ${e.number}`
          }))
        }
      });
    }
  } catch (e) {}

  return res.json({
    status: true,
    data: {
      title: slug.replace(/-/g, ' ').toUpperCase(),
      synopsis: "Sinopsis sedang dimuat dari server cadangan.",
      episodes: [{ slug: `${slug}-episode-1`, episode: "Episode 1" }]
    }
  });
});

// Endpoint: Stream Video Episode
app.get('/api/watch/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    const response = await axios.get(`https://indocast.site/api/dramovnime/episode/${slug}`, {
      headers: HEADERS,
      timeout: 5000
    });
    if (response.data) return res.json(response.data);
  } catch (err) {}

  try {
    const backupRes = await axios.get(`https://api.consumet.org/anime/gogoanime/watch/${slug}`, { timeout: 4000 });
    if (backupRes.data) {
      const stream = backupRes.data;
      const streamUrl = stream.headers?.Referer || (stream.sources && stream.sources[0]?.url);
      return res.json({ status: true, data: { title: `Streaming: ${slug}`, stream_url: streamUrl } });
    }
  } catch (e) {}

  return res.json({
    status: true,
    data: { title: `Streaming ${slug}`, stream_url: "https://www.youtube.com/embed/dQw4w9WgXcQ" }
  });
});

module.exports = app;
