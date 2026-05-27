(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    var searchInput = document.querySelector('[data-search-input]');
    var typeSelect = document.querySelector('[data-type-select]');
    var yearSelect = document.querySelector('[data-year-select]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var emptyNote = document.querySelector('[data-empty-note]');

    function filterCards() {
      var q = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var type = typeSelect ? typeSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var title = (card.getAttribute('data-title') || '').toLowerCase();
        var tags = (card.getAttribute('data-tags') || '').toLowerCase();
        var cardType = card.getAttribute('data-type') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var matchQuery = !q || title.indexOf(q) !== -1 || tags.indexOf(q) !== -1;
        var matchType = !type || cardType === type;
        var matchYear = !year || cardYear === year;
        var shouldShow = matchQuery && matchType && matchYear;

        card.style.display = shouldShow ? '' : 'none';
        if (shouldShow) {
          visible += 1;
        }
      });

      if (emptyNote) {
        emptyNote.style.display = visible ? 'none' : 'block';
      }
    }

    [searchInput, typeSelect, yearSelect].forEach(function (el) {
      if (el) {
        el.addEventListener('input', filterCards);
        el.addEventListener('change', filterCards);
      }
    });

    var playTriggers = Array.prototype.slice.call(document.querySelectorAll('[data-play-trigger]'));
    playTriggers.forEach(function (button) {
      button.addEventListener('click', function () {
        var targetId = button.getAttribute('data-target');
        var video = document.getElementById(targetId);
        var cover = button.closest('.play-cover');
        if (!video) {
          return;
        }

        var source = video.getAttribute('data-src');
        if (!source) {
          return;
        }

        if (cover) {
          cover.classList.add('hidden');
        }

        if (window.Hls && window.Hls.isSupported()) {
          if (!video._hlsInstance) {
            var hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: false
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            video._hlsInstance = hls;
          }
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else {
          video.src = source;
        }

        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            video.controls = true;
          });
        }
      });
    });
  });
})();
