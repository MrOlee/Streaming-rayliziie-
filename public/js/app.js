async function fetchLatestAnime() {
  const grid = document.getElementById('animeGrid');
  grid.innerHTML = '<div class="col-span-full text-center py-20 text-gray-400">Memuat data dari server...</div>';

  try {
    const res = await fetch('/api/recent');
    const data = await res.json();

    const items = data.data || data.results || (Array.isArray(data) ? data : []);
    if (!items || items.length === 0) {
      grid.innerHTML = '<div class="col-span-full text-center py-20 text-gray-400">Tidak ada data ditemukan.</div>';
      return;
    }

    renderGrid(items);
  } catch (err) {
    console.error('Fetch error:', err);
    renderFallbackData();
  }
}

function renderFallbackData() {
  const fallbackItems = [
    { title: "Solo Leveling Sub Indo", poster: "https://images.justwatch.com/poster/312015259/s718/solo-leveling.jpg", slug: "solo-leveling", episode: "Eps 12" },
    { title: "Jujutsu Kaisen Season 2 Sub Indo", poster: "https://m.media-amazon.com/images/M/MV5BNGY4MTg3NjgtMmFkIN00NTg5LThmZjItMWZmN2M1ODk3NGJhXkEyXkFqcGdeQXVyMzgxODM4NjM@._V1_.jpg", slug: "jujutsu-kaisen-s2", episode: "Eps 23" },
    { title: "Demon Slayer: Hashira Training", poster: "https://m.media-amazon.com/images/M/MV5BZjZjNzI5MDctY2JiNi00MGVmLTk3NDktM2FlZWJiNTQwOWGlXkEyXkFqcGdeQXVyMTEzMTI1Mjk3._V1_.jpg", slug: "demon-slayer-s4", episode: "Eps 8" },
    { title: "One Piece Sub Indo", poster: "https://m.media-amazon.com/images/M/MV5BODcwNWE3OTMtMDc3MS00NDFjLWE1OTAtNDU3NjgxMDUyNzA1XkEyXkFqcGdeQXVyNQwE2MzI4OA@@._V1_.jpg", slug: "one-piece", episode: "Eps 1100" }
  ];
  renderGrid(fallbackItems);
}

function handleSearch(e) {
  e.preventDefault();
  const query = document.getElementById('searchInput').value.trim();
  if (!query) return;

  const grid = document.getElementById('animeGrid');
  const title = document.getElementById('sectionTitle');
  title.innerText = `Hasil Pencarian: "${query}"`;
  grid.innerHTML = '<div class="col-span-full text-center py-20 text-gray-400">Mencari...</div>';

  fetch(`/api/search?q=${encodeURIComponent(query)}`)
    .then(res => res.json())
    .then(data => {
      const items = data.data || data.results || (Array.isArray(data) ? data : []);
      if (!items || items.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center py-20 text-gray-400">Anime tidak ditemukan.</div>';
        return;
      }
      renderGrid(items);
    })
    .catch(() => {
      grid.innerHTML = '<div class="col-span-full text-center text-red-400 py-20">Gagal melakukan pencarian.</div>';
    });
}

function renderGrid(items) {
  const grid = document.getElementById('animeGrid');
  grid.innerHTML = items.map(item => {
    const title = item.title || item.name || 'Untitled';
    const image = item.poster || item.cover || item.image || item.thumbnail || 'https://via.placeholder.com/300x400?text=No+Image';
    const slug = item.slug || item.endpoint || item.id || 'anime';
    const isEpisode = item.episode || item.last_episode;

    const watchUrl = isEpisode ? `/watch.html?ep=${encodeURIComponent(slug)}` : `/watch.html?slug=${encodeURIComponent(slug)}`;

    return `
      <div class="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-red-500/50 transition group flex flex-col justify-between">
        <a href="${watchUrl}">
          <div class="relative overflow-hidden aspect-[3/4] bg-gray-800">
            <img src="${image}" alt="${title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300" loading="lazy">
            ${isEpisode ? `<span class="absolute top-2 right-2 bg-red-600 text-[10px] font-bold px-2 py-0.5 rounded shadow">${isEpisode}</span>` : ''}
          </div>
          <div class="p-3">
            <h3 class="font-semibold text-xs md:text-sm text-gray-200 line-clamp-2 group-hover:text-red-400 transition">${title}</h3>
          </div>
        </a>
      </div>
    `;
  }).join('');
}

document.addEventListener('DOMContentLoaded', fetchLatestAnime);
