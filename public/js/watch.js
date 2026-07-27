async function initWatchPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const epSlug = urlParams.get('ep');
  const animeSlug = urlParams.get('slug');

  const player = document.getElementById('videoPlayer');
  const titleElem = document.getElementById('animeTitle');
  const synopsisElem = document.getElementById('synopsis');

  if (epSlug) {
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
        player.src = "https://www.youtube.com/embed/dQw4w9WgXcQ";
      }

      if (streamData.anime_slug) {
        loadEpisodes(streamData.anime_slug);
      }
    } catch (err) {
      titleElem.innerText = "Nonton Episode Anime";
      player.src = "https://www.youtube.com/embed/dQw4w9WgXcQ";
    }
  } else if (animeSlug) {
    try {
      const res = await fetch(`/api/info/${encodeURIComponent(animeSlug)}`);
      const data = await res.json();
      const info = data.data || data;

      titleElem.innerText = info.title || 'Detail Anime';
      synopsisElem.innerText = info.synopsis || info.description || 'Sinopsis belum tersedia.';

      const episodes = info.episodes || info.episode_list || [];
      renderEpisodeButtons(episodes);

      if (episodes.length > 0) {
        const firstEpSlug = episodes[0].slug || episodes[0].endpoint || episodes[0].id;
        fetchAndPlayEpisode(firstEpSlug);
      }
    } catch (err) {
      titleElem.innerText = "Detail Anime";
    }
  }
}

async function fetchAndPlayEpisode(epSlug) {
  const player = document.getElementById('videoPlayer');
  try {
    const res = await fetch(`/api/watch/${encodeURIComponent(epSlug)}`);
    const data = await res.json();
    const streamData = data.data || data;
    const streamUrl = streamData.stream_url || streamData.url || streamData.iframe;
    if (streamUrl) player.src = streamUrl;
  } catch (e) {}
}

async function loadEpisodes(animeSlug) {
  try {
    const res = await fetch(`/api/info/${encodeURIComponent(animeSlug)}`);
    const data = await res.json();
    const info = data.data || data;
    const episodes = info.episodes || info.episode_list || [];
    renderEpisodeButtons(episodes);
  } catch (err) {}
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
