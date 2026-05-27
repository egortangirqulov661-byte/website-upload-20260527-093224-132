(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
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

  var filterForms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));
  filterForms.forEach(function (form) {
    var scopeSelector = form.getAttribute('data-filter-form');
    var scope = document.querySelector(scopeSelector) || document;
    var queryInput = form.querySelector('[data-filter-query]');
    var typeSelect = form.querySelector('[data-filter-type]');
    var yearSelect = form.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));

    function applyFilter() {
      var query = queryInput ? queryInput.value.trim().toLowerCase() : '';
      var type = typeSelect ? typeSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year')
        ].join(' ').toLowerCase();
        var yearValue = card.getAttribute('data-year') || '';
        var typeValue = card.getAttribute('data-type') || '';
        var matchQuery = !query || haystack.indexOf(query) >= 0;
        var matchType = !type || typeValue === type;
        var matchYear = !year || yearValue === year;
        card.classList.toggle('hidden-card', !(matchQuery && matchType && matchYear));
      });
    }

    form.addEventListener('input', applyFilter);
    form.addEventListener('change', applyFilter);
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilter();
    });
  });
})();
