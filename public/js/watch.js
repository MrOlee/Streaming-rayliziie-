async function initWatchPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id') || '753945081585059560';
  const detailPath = urlParams.get('detailPath') || 'teach-you-a-lesson-2Z8swXJ4HT';
  const se = urlParams.get('se') || '1';
  const ep = urlParams.get('ep') || '1';

  const player = document.getElementById('videoPlayer');
  const titleElem = document.getElementById('animeTitle');

  titleElem.innerText = "Memuat pemutar video...";

  try {
    // Memanggil API /getplay
    const playUrl = `/api/getplay?id=${encodeURIComponent(id)}&se=${se}&ep=${ep}&lang=in_id&detailPath=${encodeURIComponent(detailPath)}`;
    const res = await fetch(playUrl);
    const result = await res.json();

    const playData = result.data || result;
    titleElem.innerText = playData.title || `Memutar Episode ${ep}`;

    // Link video stream m3u8 / mp4 / iframe embed
    const videoSrc = playData.url || playData.playUrl || playData.streamUrl || playData.videoUrl;

    if (videoSrc) {
      player.src = videoSrc;
    } else {
      titleElem.innerText = "Sumber video tidak ditemukan.";
    }

    // Render daftar episode sederhana
    renderEpisodes(id, detailPath, playData.totalEpisode || 12);
  } catch (err) {
    console.error('Watch page error:', err);
    titleElem.innerText = "Gagal memuat video streaming.";
  }
}

function renderEpisodes(id, detailPath, totalEps) {
  const epContainer = document.getElementById('episodeList');
  let html = '';

  for (let i = 1; i <= totalEps; i++) {
    html += `
      <a href="/watch.html?id=${encodeURIComponent(id)}&detailPath=${encodeURIComponent(detailPath)}&se=1&ep=${i}" 
         class="bg-gray-800 hover:bg-red-600 text-center py-2 px-1 rounded text-xs transition font-semibold truncate">
        Eps ${i}
      </a>
    `;
  }
  epContainer.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', initWatchPage);
