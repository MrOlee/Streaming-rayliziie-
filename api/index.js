const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const API_BASE = 'https://indocast.site/api/dramovnime';
const API_KEY = 'bb47332ceca91e3a2c97128a40c798a69306400072cc4b5a352800697069e45c';

// Header Lengkap untuk Meloloskan Request dari Filter Cloudflare Indocast
const HEADERS = {
  'Content-Type': 'application/json',
  'x-api-key': API_KEY,
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Referer': 'https://indocast.site/',
  'Origin': 'https://indocast.site',
  'Accept': 'application/json, text/plain, */*'
};

// Data Cadangan jika IP Vercel terdeteksi dan diblokir oleh Indocast Firewall
const FALLBACK_LIST = [
  { id: "753945081585059560", title: "Teach You A Lesson Sub Indo", cover: "https://images.justwatch.com/poster/312015259/s718/solo-leveling.jpg", detailPath: "teach-you-a-lesson-2Z8swXJ4HT", latestEpisode: 12 },
  { id: "753945081585059561", title: "Solo Leveling Sub Indo", cover: "https://m.media-amazon.com/images/M/MV5BNGY4MTg3NjgtMmFkIN00NTg5LThmZjItMWZmN2M1ODk3NGJhXkEyXkFqcGdeQXVyMzgxODM4NjM@._V1_.jpg", detailPath: "solo-leveling", latestEpisode: 12 },
  { id: "753945081585059562", title: "Jujutsu Kaisen Season 2", cover: "https://m.media-amazon.com/images/M/MV5BZjZjNzI5MDctY2JiNi00MGVmLTk3NDktM2FlZWJiNTQwOWGlXkEyXkFqcGdeQXVyMTEzMTI1Mjk3._V1_.jpg", detailPath: "jujutsu-kaisen-s2", latestEpisode: 23 },
  { id: "753945081585059563", title: "One Piece Sub Indo", cover: "https://m.media-amazon.com/images/M/MV5BODcwNWE3OTMtMDc3MS00NDFjLWE1OTAtNDU3NjgxMDUyNzA1XkEyXkFqcGdeQXVyNQwE2MzI4OA@@._V1_.jpg", detailPath: "one-piece", latestEpisode: 1100 }
];

// 1. Endpoint Home / Daftar Anime (POST /list)
app.get('/api/recent', async (req, res) => {
  try {
    const page = req.query.page || "1";
    const response = await axios.post(`${API_BASE}/list`, {
      channelId: "2",
      page: String(page),
      perPage: "15",
      sort: "ForYou",
      genre: "All",
      country: "All"
    }, {
      headers: HEADERS,
      timeout: 8000
    });

    if (response.data) {
      return res.json(response.data);
    }
  } catch (err) {
    console.error('[API /list Blocked/Error]:', err.message);
  }

  // Jika API Indocast memblokir Vercel, kembalikan data aman agar situs tidak eror
  return res.json({ status: true, isFallback: true, data: { list: FALLBACK_LIST } });
});

// 2. Endpoint Pencarian (GET /tabsearch)
app.get('/api/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    const page = req.query.page || 1;
    const response = await axios.get(`${API_BASE}/tabsearch`, {
      params: { page, tabId: 0, query },
      headers: HEADERS,
      timeout: 8000
    });
    return res.json(response.data);
  } catch (err) {
    console.error('[API /tabsearch Error]:', err.message);
    return res.json({ status: true, data: { list: [] } });
  }
});

// 3. Endpoint Detail (GET /detaildata)
app.get('/api/detail', async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE}/detaildata`, {
      params: req.query,
      headers: HEADERS,
      timeout: 8000
    });
    return res.json(response.data);
  } catch (err) {
    console.error('[API /detaildata Error]:', err.message);
    return res.json({ status: false, message: "Gagal mengambil detail" });
  }
});

// 4. Endpoint Streaming Video (GET /getplay)
app.get('/api/getplay', async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE}/getplay`, {
      params: req.query,
      headers: HEADERS,
      timeout: 8000
    });
    return res.json(response.data);
  } catch (err) {
    console.error('[API /getplay Error]:', err.message);
    return res.json({ status: false, message: "Gagal mengambil stream video" });
  }
});

module.exports = app;
