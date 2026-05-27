(function () {
  var toggle = document.querySelector('.menu-toggle');
  var panel = document.querySelector('.mobile-panel');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }
  }

  var filterInput = document.querySelector('.page-filter-input');
  var yearSelect = document.querySelector('.page-filter-year');
  var typeSelect = document.querySelector('.page-filter-type');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.filter-target .movie-card'));

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function filterCards() {
    var keyword = normalize(filterInput && filterInput.value);
    var year = normalize(yearSelect && yearSelect.value);
    var type = normalize(typeSelect && typeSelect.value);

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year')
      ].join(' '));
      var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchYear = !year || normalize(card.getAttribute('data-year')) === year;
      var matchType = !type || normalize(card.getAttribute('data-type')) === type;

      card.style.display = matchKeyword && matchYear && matchType ? '' : 'none';
    });
  }

  [filterInput, yearSelect, typeSelect].forEach(function (control) {
    if (control) {
      control.addEventListener('input', filterCards);
      control.addEventListener('change', filterCards);
    }
  });
})();
