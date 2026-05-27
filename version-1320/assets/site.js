(function () {
  var header = document.querySelector('[data-site-header]');
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    }, { passive: true });
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function getPagePrefix() {
    var depth = Number(document.body ? document.body.getAttribute('data-depth') : 0);

    if (!Number.isFinite(depth) || depth < 0) {
      depth = 0;
    }

    return '../'.repeat(depth);
  }

  function setupGlobalSearch() {
    var roots = document.querySelectorAll('[data-search-root]');
    var items = window.MOVIE_SEARCH_INDEX || [];
    var pagePrefix = getPagePrefix();

    roots.forEach(function (root) {
      var input = root.querySelector('[data-global-search]');
      var panel = root.querySelector('[data-global-search-panel]');

      if (!input || !panel) {
        return;
      }

      input.addEventListener('input', function () {
        var query = normalize(input.value);
        panel.innerHTML = '';

        if (!query) {
          panel.classList.remove('is-open');
          return;
        }

        var matched = items.filter(function (item) {
          return normalize(item.title + ' ' + item.region + ' ' + item.type + ' ' + item.genre + ' ' + item.tags).indexOf(query) !== -1;
        }).slice(0, 12);

        if (!matched.length) {
          var empty = document.createElement('div');
          empty.className = 'no-results-message';
          empty.textContent = '没有找到匹配影片，请尝试更换关键词。';
          panel.appendChild(empty);
          panel.classList.add('is-open');
          return;
        }

        matched.forEach(function (item) {
          var link = document.createElement('a');
          var image = document.createElement('img');
          var textWrap = document.createElement('span');
          var title = document.createElement('strong');
          var meta = document.createElement('span');

          link.className = 'search-result-item';
          link.href = pagePrefix + item.url;
          image.src = pagePrefix + item.cover;
          image.alt = item.title;
          title.textContent = item.title;
          meta.textContent = item.region + ' · ' + item.type + ' · ' + item.year;

          textWrap.appendChild(title);
          textWrap.appendChild(meta);
          link.appendChild(image);
          link.appendChild(textWrap);
          panel.appendChild(link);
        });

        panel.classList.add('is-open');
      });

      document.addEventListener('click', function (event) {
        if (!root.contains(event.target)) {
          panel.classList.remove('is-open');
        }
      });
    });
  }

  function setupHeroSearch() {
    var form = document.querySelector('[data-hero-search-form]');

    if (!form) {
      return;
    }

    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      var value = input ? input.value.trim() : '';

      if (!value) {
        return;
      }

      event.preventDefault();
      window.location.href = 'categories.html?search=' + encodeURIComponent(value);
    });
  }

  function setupHeroCarousel() {
    var root = document.querySelector('[data-hero-carousel]');

    if (!root) {
      return;
    }

    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var previous = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (previous) {
      previous.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupLocalFilters() {
    var panels = document.querySelectorAll('[data-local-filter]');

    panels.forEach(function (panel) {
      var section = panel.closest('section') || document;
      var input = panel.querySelector('[data-local-search]');
      var count = panel.querySelector('[data-filter-count]');
      var chips = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-type]'));
      var cards = Array.prototype.slice.call(section.querySelectorAll('[data-movie-card]'));
      var active = { type: 'all', value: 'all' };

      function applyFilters() {
        var query = normalize(input ? input.value : '');
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre')
          ].join(' '));
          var filterMatched = active.type === 'all' || normalize(card.getAttribute('data-' + active.type)).indexOf(normalize(active.value)) !== -1;
          var searchMatched = !query || haystack.indexOf(query) !== -1;
          var shouldShow = filterMatched && searchMatched;

          card.classList.toggle('is-hidden-by-filter', !shouldShow);
          if (shouldShow) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = '显示 ' + visible + ' / ' + cards.length;
        }
      }

      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          chips.forEach(function (item) {
            item.classList.remove('is-active');
          });

          chip.classList.add('is-active');
          active = {
            type: chip.getAttribute('data-filter-type'),
            value: chip.getAttribute('data-filter-value')
          };
          applyFilters();
        });
      });

      if (input) {
        input.addEventListener('input', applyFilters);
      }

      var params = new URLSearchParams(window.location.search);
      var incomingSearch = params.get('search');

      if (incomingSearch && input) {
        input.value = incomingSearch;
      }

      applyFilters();
    });
  }

  var hlsLoaderPromise = null;

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }

    if (!hlsLoaderPromise) {
      hlsLoaderPromise = new Promise(function (resolve, reject) {
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    hlsLoaderPromise.then(callback).catch(function () {
      callback();
    });
  }

  function setupPlayers() {
    var players = document.querySelectorAll('[data-player]');

    players.forEach(function (player) {
      var video = player.querySelector('video[data-video-src]');
      var button = player.querySelector('[data-play-button]');
      var note = player.querySelector('[data-player-note]');
      var initialized = false;

      if (!video || !button) {
        return;
      }

      function setNote(message) {
        if (note) {
          note.textContent = message;
        }
      }

      function startPlayback() {
        var source = video.getAttribute('data-video-src');

        if (!source) {
          setNote('当前影片没有可用播放源。');
          return;
        }

        button.classList.add('is-hidden');

        function attachSource() {
          if (initialized) {
            video.play().catch(function () {
              button.classList.remove('is-hidden');
            });
            return;
          }

          if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });

            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              initialized = true;
              setNote('HLS 播放源已加载，可以开始观看。');
              video.play().catch(function () {
                button.classList.remove('is-hidden');
                setNote('浏览器阻止了自动播放，请再次点击播放按钮。');
              });
            });
            hls.on(window.Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal) {
                setNote('播放源加载失败，请稍后重试或更换浏览器。');
              }
            });
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            initialized = true;
            setNote('浏览器已使用原生 HLS 能力播放。');
            video.play().catch(function () {
              button.classList.remove('is-hidden');
            });
          } else {
            video.src = source;
            initialized = true;
            setNote('已尝试直接加载 m3u8 播放源。');
            video.play().catch(function () {
              button.classList.remove('is-hidden');
            });
          }
        }

        loadHls(attachSource);
      }

      button.addEventListener('click', startPlayback);
      video.addEventListener('play', function () {
        button.classList.add('is-hidden');
      });
    });
  }

  setupGlobalSearch();
  setupHeroSearch();
  setupHeroCarousel();
  setupLocalFilters();
  setupPlayers();
})();
