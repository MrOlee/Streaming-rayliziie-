async function initWatchPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const epSlug = urlParams.get('ep');
  const animeSlug = urlParams.get('slug');

  const player = document.getElementById('videoPlayer');
  const titleElem = document.getElementById('animeTitle');
  const synopsisElem = document.getElementById('synopsis');

  if (epSlug) {
    // Memuat episode streaming
    titleElem.innerText = "Memuat player...";
    try {
      const res = await fetch(`/api/watch/${encodeURIComponent(epSlug)}`);
      const data = await res.json();
      const streamData = data.data || data;

      titleElem.innerText = streamData.title || `Nonton Episode: ${epSlug.replace(/-/g, ' ')}`;
      
      const streamUrl = streamData.stream_url || streamData.url || streamData.iframe || (streamData.sources && streamData.sources[0]?.url);

      if (streamUrl) {
        player.src = streamUrl;
      } else {
        titleElem.innerText = "Video stream tidak tersedia.";
      }

      // Jika ada referensi ke anime detailnya
      if (streamData.anime_slug) {
        loadEpisodes(streamData.anime_slug);
      }
    } catch (err) {
      titleElem.innerText = "Gagal memutar video episode.";
    }
  } else if (animeSlug) {
    // Memuat halaman detail anime
    try {
      const res = await fetch(`/api/info/${encodeURIComponent(animeSlug)}`);
      const data = await res.json();
      const info = data.data || data;

      titleElem.innerText = info.title || 'Detail Anime';
      synopsisElem.innerText = info.synopsis || info.description || 'Tidak ada sinopsis.';

      const episodes = info.episodes || info.episode_list || [];
      renderEpisodeButtons(episodes);

      if (episodes.length > 0) {
        const firstEpSlug = episodes[0].slug || episodes[0].endpoint || episodes[0].id;
        player.src = `/api/watch/${firstEpSlug}`;
      }
    } catch (err) {
      titleElem.innerText = "Gagal memuat detail anime.";
    }
  }
}

async function loadEpisodes(animeSlug) {
  try {
    const res = await fetch(`/api/info/${encodeURIComponent(animeSlug)}`);
    const data = await res.json();
    const info = data.data || data;
    const episodes = info.episodes || info.episode_list || [];
    renderEpisodeButtons(episodes);
  } catch (err) {
    console.error("Gagal memuat episode list:", err);
  }
}

function renderEpisodeButtons(episodes) {
  const epContainer = document.getElementById('episodeList');
  if (!Array.isArray(episodes) || episodes.length === 0) {
    epContainer.innerHTML = '<span class="col-span-full text-xs text-gray-500">Tidak ada episode.</span>';
    return;
  }

  epContainer.innerHTML = episodes.map((ep, idx) => {
    const epSlug = ep.slug || ep.endpoint || ep.id;
    const epNum = ep.episode || ep.title || `Eps ${idx + 1}`;

    return `
      <a href="/watch.html?ep=${encodeURIComponent(epSlug)}" 
         class="bg-gray-800 hover:bg-red-600 text-center py-2 px-1 rounded text-xs transition font-semibold truncate">
        ${epNum}
      </a>
    `;
  }).join('');
}

document.addEventListener('DOMContentLoaded', initWatchPage);
