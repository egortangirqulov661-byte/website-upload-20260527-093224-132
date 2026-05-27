(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-menu]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
      button.textContent = panel.classList.contains('is-open') ? '×' : '☰';
    });
  }

  function initHero() {
    var root = qs('[data-hero]');
    if (!root) {
      return;
    }
    var slides = qsa('.hero-slide', root);
    var dots = qsa('[data-hero-dot]', root);
    var prev = qs('[data-hero-prev]', root);
    var next = qs('[data-hero-next]', root);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle('is-active', current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle('is-active', current === index);
      });
    }

    function move(step) {
      show(index + step);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        move(1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        move(-1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        move(1);
        restart();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
        restart();
      });
    });
    show(0);
    restart();
  }

  function matchText(value, expected) {
    return expected === 'all' || value === expected;
  }

  function initFilters() {
    qsa('[data-filter-list]').forEach(function (bar) {
      var parent = bar.parentElement;
      var cardsRoot = qs('[data-cards]', parent);
      var input = qs('[data-filter-search]', bar);
      var year = qs('[data-filter-year]', bar);
      var type = qs('[data-filter-type]', bar);
      var region = qs('[data-filter-region]', bar);
      if (!cardsRoot) {
        return;
      }
      var cards = qsa('.movie-card', cardsRoot);

      function apply() {
        var term = input ? input.value.trim().toLowerCase() : '';
        var selectedYear = year ? year.value : 'all';
        var selectedType = type ? type.value : 'all';
        var selectedRegion = region ? region.value : 'all';
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags')
          ].join(' ').toLowerCase();
          var visible = (!term || haystack.indexOf(term) !== -1) &&
            matchText(card.getAttribute('data-year') || '', selectedYear) &&
            matchText(card.getAttribute('data-type') || '', selectedType) &&
            matchText(card.getAttribute('data-region') || '', selectedRegion);
          card.classList.toggle('is-hidden', !visible);
        });
      }

      [input, year, type, region].forEach(function (item) {
        if (item) {
          item.addEventListener('input', apply);
          item.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  function initPlayers() {
    qsa('[data-stream]').forEach(function (shell) {
      var video = qs('video', shell);
      var overlay = qs('.player-overlay', shell);
      var stream = shell.getAttribute('data-stream');
      var started = false;
      if (!video || !stream) {
        return;
      }

      function start() {
        if (!started) {
          started = true;
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
          } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(stream);
            hls.attachMedia(video);
            shell._hls = hls;
          } else {
            video.src = stream;
          }
          video.controls = true;
        }
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
        var attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () {});
        }
      }

      if (overlay) {
        overlay.addEventListener('click', start);
      }
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });
    });
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function movieResultCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '<article class="movie-card">' +
      '<a href="./' + movie.file + '" class="poster-link">' +
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '<span class="quality-badge">HD</span><span class="hover-play">▶</span></a>' +
      '<div class="card-body"><a href="./' + movie.file + '" class="movie-title">' + escapeHtml(movie.title) + '</a>' +
      '<p>' + escapeHtml(movie.oneLine) + '</p>' +
      '<div class="movie-meta"><span>★ ' + escapeHtml(movie.rating) + '</span><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>' +
      '<div class="tag-row">' + tags + '</div></div></article>';
  }

  function initSearchPage() {
    var root = qs('[data-search-page]');
    if (!root || !window.SITE_MOVIES) {
      return;
    }
    var input = qs('[data-search-page-input]');
    var results = qs('[data-search-results]', root);
    var title = qs('[data-search-title]', root);
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    if (input) {
      input.value = q;
    }

    function render(term) {
      var key = term.trim().toLowerCase();
      var list = window.SITE_MOVIES.filter(function (movie) {
        if (!key) {
          return false;
        }
        return [movie.title, movie.region, movie.type, movie.genre, movie.tags.join(' '), movie.oneLine].join(' ').toLowerCase().indexOf(key) !== -1;
      }).slice(0, 160);
      if (title) {
        title.textContent = key ? '搜索结果：' + term : '精选内容';
      }
      if (!results) {
        return;
      }
      if (!key) {
        results.innerHTML = '';
        return;
      }
      results.innerHTML = list.length ? list.map(movieResultCard).join('') : '<div class="empty-state">未找到匹配内容</div>';
    }

    render(q);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
    initSearchPage();
  });
})();
