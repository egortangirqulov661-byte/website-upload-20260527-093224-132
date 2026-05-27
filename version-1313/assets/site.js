document.addEventListener('DOMContentLoaded', function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');
  var searchButton = document.querySelector('[data-search-toggle]');
  var headerSearch = document.querySelector('[data-header-search]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });
  }

  if (searchButton && headerSearch) {
    searchButton.addEventListener('click', function () {
      headerSearch.classList.toggle('open');
      var input = headerSearch.querySelector('input');
      if (input) {
        input.focus();
      }
    });
  }

  var heroSlides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var heroDots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var activeSlide = 0;

  function setHeroSlide(index) {
    if (!heroSlides.length) {
      return;
    }
    activeSlide = (index + heroSlides.length) % heroSlides.length;
    heroSlides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === activeSlide);
    });
    heroDots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === activeSlide);
    });
  }

  heroDots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      setHeroSlide(i);
    });
  });

  if (heroSlides.length > 1) {
    window.setInterval(function () {
      setHeroSlide(activeSlide + 1);
    }, 5600);
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-card-search]'));
  searchInputs.forEach(function (input) {
    var target = input.getAttribute('data-card-search');
    var scope = target ? document.querySelector(target) : document;
    if (!scope) {
      scope = document;
    }
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-search-text]'));
    var empty = document.querySelector('[data-empty-state="' + (target || 'document') + '"]');

    function applySearch() {
      var query = input.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search-text') || '').toLowerCase();
        var show = !query || text.indexOf(query) !== -1;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    input.addEventListener('input', applySearch);
    applySearch();
  });

  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var value = button.getAttribute('data-filter-value') || 'all';
      var target = button.getAttribute('data-filter-target');
      var scope = target ? document.querySelector(target) : document;
      if (!scope) {
        scope = document;
      }
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-kind]'));
      filterButtons
        .filter(function (item) {
          return item.getAttribute('data-filter-target') === target;
        })
        .forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
      cards.forEach(function (card) {
        var show = value === 'all' || card.getAttribute('data-kind') === value;
        card.style.display = show ? '' : 'none';
      });
    });
  });

  Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(function (box) {
    var video = box.querySelector('video');
    var overlay = box.querySelector('.player-overlay');
    var button = box.querySelector('.play-toggle');
    if (!video) {
      return;
    }
    var url = video.getAttribute('data-video') || '';
    var attached = false;

    function startPlayback() {
      if (!url) {
        return;
      }
      if (!attached) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
          hls.loadSource(url);
          hls.attachMedia(video);
          video._hlsInstance = hls;
        } else {
          video.src = url;
        }
        video.setAttribute('controls', 'controls');
        attached = true;
      }
      box.classList.add('is-playing');
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        startPlayback();
      });
    }

    if (overlay) {
      overlay.addEventListener('click', function (event) {
        if (event.target === overlay) {
          startPlayback();
        }
      });
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });
  });
});
