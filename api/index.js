const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const API_BASE = 'https://indocast.site/api/dramovnime';
const API_KEY = 'bb47332ceca91e3a2c97128a40c798a69306400072cc4b5a352800697069e45c';

// Client Axios dengan Header Otentikasi
const indocastClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  },
  timeout: 10000
});

// 1. Endpoint Home / Daftar Anime (POST /list)
app.get('/api/recent', async (req, res) => {
  try {
    const page = req.query.page || "1";
    const response = await indocastClient.post('/list', {
      channelId: "2",
      page: String(page),
      perPage: "15",
      sort: "ForYou",
      genre: "All",
      country: "All"
    });
    res.json(response.data);
  } catch (err) {
    console.error('[API /list Error]:', err.message);
    res.status(err.response?.status || 500).json({ error: err.message, details: err.response?.data });
  }
});

// 2. Endpoint Pencarian (GET /tabsearch)
app.get('/api/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    const page = req.query.page || 1;
    const response = await indocastClient.get('/tabsearch', {
      params: { page, tabId: 0, query }
    });
    res.json(response.data);
  } catch (err) {
    console.error('[API /tabsearch Error]:', err.message);
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

// 3. Endpoint Detail (GET /detaildata)
app.get('/api/detail', async (req, res) => {
  try {
    const response = await indocastClient.get('/detaildata', { params: req.query });
    res.json(response.data);
  } catch (err) {
    console.error('[API /detaildata Error]:', err.message);
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

// 4. Endpoint Streaming Video (GET /getplay)
app.get('/api/getplay', async (req, res) => {
  try {
    const response = await indocastClient.get('/getplay', { params: req.query });
    res.json(response.data);
  } catch (err) {
    console.error('[API /getplay Error]:', err.message);
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

module.exports = app;
