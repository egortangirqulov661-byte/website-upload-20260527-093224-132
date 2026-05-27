const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');

if (menuButton && mobileNav) {
  menuButton.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });
}

const hero = document.querySelector('[data-hero-carousel]');

if (hero) {
  const slides = Array.from(hero.querySelectorAll('.hero-slide'));
  const dots = Array.from(hero.querySelectorAll('.hero-dot'));
  let activeIndex = 0;

  const showSlide = (index) => {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('active', slideIndex === activeIndex);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('active', dotIndex === activeIndex);
    });
  };

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => showSlide(index));
  });

  if (slides.length > 1) {
    window.setInterval(() => showSlide(activeIndex + 1), 5200);
  }
}

const filterInput = document.querySelector('#site-search');
const yearFilter = document.querySelector('#year-filter');
const regionFilter = document.querySelector('#region-filter');
const typeFilter = document.querySelector('#type-filter');
const clearFilter = document.querySelector('#clear-filter');
const cards = Array.from(document.querySelectorAll('.filter-scope .movie-card'));

const normalize = (value) => String(value || '').trim().toLowerCase();

const applyFilters = () => {
  const query = normalize(filterInput?.value);
  const year = normalize(yearFilter?.value);
  const region = normalize(regionFilter?.value);
  const type = normalize(typeFilter?.value);

  cards.forEach((card) => {
    const haystack = normalize(card.dataset.search);
    const cardYear = normalize(card.dataset.year);
    const cardRegion = normalize(card.dataset.region);
    const cardType = normalize(card.dataset.type);
    const matched =
      (!query || haystack.includes(query)) &&
      (!year || cardYear === year) &&
      (!region || cardRegion === region) &&
      (!type || cardType === type);

    card.classList.toggle('is-hidden', !matched);
  });
};

[filterInput, yearFilter, regionFilter, typeFilter].forEach((control) => {
  if (control) {
    control.addEventListener('input', applyFilters);
    control.addEventListener('change', applyFilters);
  }
});

if (clearFilter) {
  clearFilter.addEventListener('click', () => {
    [filterInput, yearFilter, regionFilter, typeFilter].forEach((control) => {
      if (control) {
        control.value = '';
      }
    });
    applyFilters();
  });
}

const loadPlayerModule = async () => {
  try {
    const module = await import('./hls.js');
    return module.H;
  } catch (error) {
    return null;
  }
};

const preparePlayer = async (shell) => {
  const video = shell.querySelector('.video-player');
  const url = shell.dataset.videoUrl;

  if (!video || !url || shell.dataset.ready === 'true') {
    return video;
  }

  shell.dataset.ready = 'true';

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = url;
    return video;
  }

  const Hls = await loadPlayerModule();

  if (Hls && Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });

    hls.loadSource(url);
    hls.attachMedia(video);
    shell._hls = hls;
    return video;
  }

  video.src = url;
  return video;
};

Array.from(document.querySelectorAll('.player-shell')).forEach((shell) => {
  const button = shell.querySelector('.play-button');
  const video = shell.querySelector('.video-player');

  const start = async () => {
    const preparedVideo = await preparePlayer(shell);
    shell.classList.add('playing');

    if (preparedVideo) {
      const playPromise = preparedVideo.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          shell.classList.remove('playing');
        });
      }
    }
  };

  if (button) {
    button.addEventListener('click', start);
  }

  shell.addEventListener('click', (event) => {
    if (event.target === video) {
      return;
    }
    start();
  });

  if (video) {
    video.addEventListener('play', () => shell.classList.add('playing'));
    video.addEventListener('pause', () => shell.classList.remove('playing'));
  }
});
