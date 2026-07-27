const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');
const path = urlParams.get('path');

const player = document.getElementById('video-player');
const titleEl = document.getElementById('anime-title');
const descEl = document.getElementById('anime-desc');
const epListEl = document.getElementById('episodes-list');

async function initPage() {
  if (!id && !path) {
    titleEl.innerText = "Data anime tidak ditemukan";
    return;
  }

  // 1. Ambil data Detail Anime
  try {
    const res = await fetch(`/api/detail?detailPath=${encodeURIComponent(path || '')}&se=0`);
    const result = await res.json();
    const data = result.data || result;

    // Set Judul & Deskripsi
    titleEl.innerText = data.title || data.name || "Nonton Anime";
    descEl.innerText = data.introduction || data.synopsis || data.description || "Tidak ada deskripsi.";

    // 2. Render Daftar Episode
    const episodes = data.chapterList || data.episodes || data.items || [];
    
    if (episodes.length > 0) {
      epListEl.innerHTML = '';
      episodes.forEach((ep, index) => {
        const epNum = ep.episode || ep.ep || (index + 1);
        const btn = document.createElement('button');
        btn.className = 'ep-btn';
        btn.innerText = `Ep ${epNum}`;
        btn.onclick = () => playEpisode(epNum);
        epListEl.appendChild(btn);
      });

      // Putar episode pertama secara otomatis
      playEpisode(episodes[0].episode || 1);
    } else {
      epListEl.innerHTML = '<p>Tidak ada daftar episode.</p>';
      playEpisode(1);
    }

  } catch (err) {
    console.error(err);
    titleEl.innerText = "Gagal memuat detail anime";
  }
}

// Function untuk load video per episode
async function playEpisode(epNumber) {
  try {
    player.src = ""; // Clear player
    const res = await fetch(`/api/play?id=${id}&se=1&ep=${epNumber}&detailPath=${encodeURIComponent(path || '')}`);
    const data = await res.json();

    const videoUrl = data.playUrl || data.url || data.embed || (data.data && data.data.playUrl);

    if (videoUrl) {
      player.src = videoUrl;
    } else {
      alert(`Gagal memuat video untuk Episode ${epNumber}`);
    }
  } catch (err) {
    console.error("Play Error:", err);
  }
}

initPage();
