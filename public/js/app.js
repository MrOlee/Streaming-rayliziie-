async function fetchLatestAnime() {
  const grid = document.getElementById('animeGrid');
  try {
    const res = await fetch('/api/recent');
    const data = await res.json();

    const items = data.data || data.results || data;
    if (!Array.isArray(items) || items.length === 0) {
      grid.innerHTML = '<div class="col-span-full text-center py-20 text-gray-400">Tidak ada data ditemukan.</div>';
      return;
    }

    renderGrid(items);
  } catch (err) {
    grid.innerHTML = '<div class="col-span-full text-center text-red-400 py-20">Gagal mengambil data dari server.</div>';
  }
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
      const items = data.data || data.results || data;
      if (!Array.isArray(items) || items.length === 0) {
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
    const image = item.poster || item.cover || item.image || item.thumbnail || 'https://via.placeholder.com/300x400';
    const slug = item.slug || item.endpoint || item.id;
    const isEpisode = item.episode || item.last_episode;

    const watchUrl = isEpisode ? `/watch.html?ep=${encodeURIComponent(slug)}` : `/watch.html?slug=${encodeURIComponent(slug)}`;

    return `
      <div class="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-red-500/50 transition group flex flex-col justify-between">
        <a href="${watchUrl}">
          <div class="relative overflow-hidden aspect-[3/4]">
            <img src="${image}" alt="${title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300" loading="lazy">
            ${isEpisode ? `<span class="absolute top-2 right-2 bg-red-600 text-[10px] font-bold px-2 py-0.5 rounded">${isEpisode}</span>` : ''}
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
