(() => {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', () => {
      mobileNav.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = [...hero.querySelectorAll('[data-hero-slide]')];
    const dots = [...hero.querySelectorAll('[data-hero-dot]')];
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    const show = (index) => {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    const start = () => {
      timer = window.setInterval(() => show(current + 1), 5000);
    };

    const restart = () => {
      window.clearInterval(timer);
      start();
    };

    if (prev) {
      prev.addEventListener('click', () => {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', () => {
        show(current + 1);
        restart();
      });
    }

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        show(index);
        restart();
      });
    });

    show(0);
    start();
  }

  const filterInput = document.querySelector('[data-filter-input]');
  const filterCards = [...document.querySelectorAll('[data-card]')];
  const emptyState = document.querySelector('[data-empty-state]');

  if (filterInput && filterCards.length) {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');

    if (query) {
      filterInput.value = query;
    }

    const applyFilter = () => {
      const term = filterInput.value.trim().toLowerCase();
      let visible = 0;

      filterCards.forEach((card) => {
        const matched = !term || card.textContent.toLowerCase().includes(term);
        card.hidden = !matched;

        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    };

    filterInput.addEventListener('input', applyFilter);
    applyFilter();
  }
})();
