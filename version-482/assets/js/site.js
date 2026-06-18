const navToggle = document.querySelector('[data-nav-toggle]');
const navMenu = document.querySelector('[data-nav-menu]');
const navSearch = document.querySelector('.nav-search');

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('is-open');
    if (navSearch) {
      navSearch.classList.toggle('is-open');
    }
  });
}

const heroSlides = Array.from(document.querySelectorAll('[data-hero-slide]'));
const heroDots = Array.from(document.querySelectorAll('[data-hero-dot]'));
let heroIndex = 0;
let heroTimer = null;

function setHero(index) {
  if (!heroSlides.length) {
    return;
  }
  heroIndex = (index + heroSlides.length) % heroSlides.length;
  heroSlides.forEach((slide, currentIndex) => {
    slide.classList.toggle('is-active', currentIndex === heroIndex);
  });
  heroDots.forEach((dot, currentIndex) => {
    dot.classList.toggle('is-active', currentIndex === heroIndex);
  });
}

function startHero() {
  if (heroSlides.length < 2) {
    return;
  }
  heroTimer = window.setInterval(() => {
    setHero(heroIndex + 1);
  }, 5200);
}

heroDots.forEach((dot, index) => {
  dot.addEventListener('click', () => {
    if (heroTimer) {
      window.clearInterval(heroTimer);
    }
    setHero(index);
    startHero();
  });
});

setHero(0);
startHero();

const filterForm = document.querySelector('[data-filter-form]');
const searchItems = Array.from(document.querySelectorAll('[data-search-item]'));
const searchStatus = document.querySelector('[data-search-status]');

function getParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name) || '';
}

function applyFilters() {
  if (!filterForm || !searchItems.length) {
    return;
  }
  const keyword = (filterForm.querySelector('[name="q"]')?.value || '').trim().toLowerCase();
  const region = (filterForm.querySelector('[name="region"]')?.value || '').trim().toLowerCase();
  const year = (filterForm.querySelector('[name="year"]')?.value || '').trim().toLowerCase();
  let count = 0;

  searchItems.forEach((item) => {
    const text = [
      item.dataset.title,
      item.dataset.region,
      item.dataset.year,
      item.dataset.genre,
      item.dataset.category,
      item.dataset.tags
    ].join(' ').toLowerCase();
    const okKeyword = !keyword || text.includes(keyword);
    const okRegion = !region || (item.dataset.region || '').toLowerCase().includes(region);
    const okYear = !year || (item.dataset.year || '').toLowerCase() === year;
    const visible = okKeyword && okRegion && okYear;
    item.style.display = visible ? '' : 'none';
    if (visible) {
      count += 1;
    }
  });

  if (searchStatus) {
    searchStatus.textContent = `当前显示 ${count} 部影片`;
  }
}

if (filterForm) {
  const q = getParam('q');
  const qInput = filterForm.querySelector('[name="q"]');
  if (q && qInput) {
    qInput.value = q;
  }
  filterForm.addEventListener('submit', (event) => {
    event.preventDefault();
    applyFilters();
  });
  filterForm.addEventListener('input', applyFilters);
  filterForm.addEventListener('change', applyFilters);
  applyFilters();
}

async function playHlsVideo(playerBox) {
  const video = playerBox.querySelector('video');
  const button = playerBox.querySelector('[data-play-button]');
  const source = playerBox.dataset.videoSrc;

  if (!video || !source) {
    return;
  }

  if (button) {
    button.disabled = true;
    button.textContent = '正在加载';
  }

  try {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else {
      const module = await import('./hls-vendor-dru42stk.js');
      const Hls = module.H;
      if (Hls && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        playerBox.hlsInstance = hls;
      } else {
        video.src = source;
      }
    }
    playerBox.classList.add('is-playing');
    await video.play();
  } catch (error) {
    console.error('播放器初始化失败：', error);
    if (button) {
      button.disabled = false;
      button.textContent = '重新播放';
    }
  }
}

Array.from(document.querySelectorAll('[data-player]')).forEach((playerBox) => {
  const button = playerBox.querySelector('[data-play-button]');
  if (button) {
    button.addEventListener('click', () => playHlsVideo(playerBox));
  }
});
