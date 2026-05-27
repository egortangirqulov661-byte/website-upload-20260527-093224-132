(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-main-nav]");
    if (menuButton && nav) {
      menuButton.addEventListener("click", function () {
        nav.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function setSlide(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
        });
      }

      function startTimer() {
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function () {
          setSlide(index + 1);
        }, 5200);
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          setSlide(parseInt(dot.getAttribute("data-hero-dot"), 10) || 0);
          startTimer();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          setSlide(index - 1);
          startTimer();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          setSlide(index + 1);
          startTimer();
        });
      }

      setSlide(0);
      startTimer();
    });

    document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
      var search = panel.querySelector("[data-search-box]");
      var type = panel.querySelector("[data-type-filter]");
      var year = panel.querySelector("[data-year-filter]");
      var category = panel.querySelector("[data-category-filter]");
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

      function apply() {
        var q = search ? search.value.trim().toLowerCase() : "";
        var t = type ? type.value : "";
        var y = year ? year.value : "";
        var c = category ? category.value : "";
        cards.forEach(function (card) {
          var hay = (card.getAttribute("data-search") || "").toLowerCase();
          var ok = true;
          if (q && hay.indexOf(q) === -1) {
            ok = false;
          }
          if (t && card.getAttribute("data-type") !== t) {
            ok = false;
          }
          if (y && card.getAttribute("data-year") !== y) {
            ok = false;
          }
          if (c && card.getAttribute("data-category") !== c) {
            ok = false;
          }
          card.hidden = !ok;
        });
      }

      [search, type, year, category].forEach(function (node) {
        if (node) {
          node.addEventListener("input", apply);
          node.addEventListener("change", apply);
        }
      });
    });
  });
})();
