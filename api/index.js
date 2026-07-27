const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Konfigurasi Host & Key Baru
const HOST = 'https://nontonanimesubindo.icu/';
const API_KEY = 'e89493c0d83547439568eea2b8e5645463';

// Client Axios Terkonfigurasi
const client = axios.create({
  baseURL: HOST,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
    'key': API_KEY,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Referer': HOST,
    'Origin': HOST
  },
  timeout: 10000
});

// Data Fallback (Pencegah Error saat server provider down/maintenance)
const FALLBACK_LIST = [
  { id: "1", title: "Solo Leveling Sub Indo", cover: "https://images.justwatch.com/poster/312015259/s718/solo-leveling.jpg", detailPath: "solo-leveling", latestEpisode: 12 },
  { id: "2", title: "Jujutsu Kaisen Season 2", cover: "https://m.media-amazon.com/images/M/MV5BNGY4MTg3NjgtMmFkIN00NTg5LThmZjItMWZmN2M1ODk3NGJhXkEyXkFqcGdeQXVyMzgxODM4NjM@._V1_.jpg", detailPath: "jujutsu-kaisen-s2", latestEpisode: 23 },
  { id: "3", title: "Demon Slayer: Hashira Training", cover: "https://m.media-amazon.com/images/M/MV5BZjZjNzI5MDctY2JiNi00MGVmLTk3NDktM2FlZWJiNTQwOWGlXkEyXkFqcGdeQXVyMTEzMTI1Mjk3._V1_.jpg", detailPath: "demon-slayer-s4", latestEpisode: 8 },
  { id: "4", title: "One Piece Sub Indo", cover: "https://m.media-amazon.com/images/M/MV5BODcwNWE3OTMtMDc3MS00NDFjLWE1OTAtNDU3NjgxMDUyNzA1XkEyXkFqcGdeQXVyNQwE2MzI4OA@@._V1_.jpg", detailPath: "one-piece", latestEpisode: 1100 }
];

// 1. Endpoint Anime Terbaru / Home
app.get('/api/recent', async (req, res) => {
  try {
    const page = req.query.page || "1";
    
    // Coba request POST list ke provider
    const response = await client.post('api/dramovnime/list', {
      channelId: "2",
      page: String(page),
      perPage: "15",
      sort: "ForYou",
      genre: "All",
      country: "All"
    });

    if (response.data) {
      return res.json(response.data);
    }
  } catch (err) {
    console.error('[Provider API Error]:', err.message);
  }

  // Jika provider gagal merespon, kembalikan data fallback agar halaman tidak error
  return res.json({ status: true, isFallback: true, data: { list: FALLBACK_LIST } });
});

// 2. Endpoint Pencarian
app.get('/api/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    const page = req.query.page || 1;
    const response = await client.get('api/dramovnime/tabsearch', {
      params: { page, tabId: 0, query }
    });
    return res.json(response.data);
  } catch (err) {
    console.error('[Search Error]:', err.message);
    return res.json({ status: true, data: { list: [] } });
  }
});

// 3. Endpoint Detail Anime
app.get('/api/detail', async (req, res) => {
  try {
    const response = await client.get('api/dramovnime/detaildata', {
      params: req.query
    });
    return res.json(response.data);
  } catch (err) {
    console.error('[Detail Error]:', err.message);
    return res.json({ status: false, message: "Gagal mengambil detail" });
  }
});

// 4. Endpoint Play / Stream Video
app.get('/api/getplay', async (req, res) => {
  try {
    const response = await client.get('api/dramovnime/getplay', {
      params: req.query
    });
    return res.json(response.data);
  } catch (err) {
    console.error('[GetPlay Error]:', err.message);
    return res.json({ status: false, message: "Gagal mengambil link stream" });
  }
});

module.exports = app;
