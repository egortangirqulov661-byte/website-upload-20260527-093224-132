(function () {
    const menuToggle = document.querySelector('[data-menu-toggle]');
    const mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    const heroRoot = document.querySelector('[data-hero-carousel]');
    if (heroRoot) {
        const slides = Array.from(heroRoot.querySelectorAll('[data-hero-slide]'));
        const dotsRoot = heroRoot.querySelector('[data-hero-dots]');
        let current = 0;
        let timer = null;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            if (dotsRoot) {
                Array.from(dotsRoot.children).forEach(function (dot, dotIndex) {
                    dot.classList.toggle('active', dotIndex === current);
                });
            }
        }

        function startTimer() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        if (dotsRoot) {
            slides.forEach(function (_, index) {
                const button = document.createElement('button');
                button.type = 'button';
                button.setAttribute('aria-label', '切换推荐影片 ' + (index + 1));
                button.addEventListener('click', function () {
                    showSlide(index);
                    startTimer();
                });
                dotsRoot.appendChild(button);
            });
        }

        showSlide(0);
        startTimer();
    }

    const filterRoot = document.querySelector('[data-filter-root]');
    if (filterRoot) {
        const input = filterRoot.querySelector('[data-filter-input]');
        const typeFilter = filterRoot.querySelector('[data-type-filter]');
        const sortSelect = filterRoot.querySelector('[data-sort-select]');
        const grid = document.querySelector('[data-card-grid]');
        const count = document.querySelector('[data-result-count]');
        const cards = grid ? Array.from(grid.querySelectorAll('.movie-card')) : [];

        function applyFilter() {
            const keyword = input ? input.value.trim().toLowerCase() : '';
            const typeValue = typeFilter ? typeFilter.value : '';
            let visible = [];

            cards.forEach(function (card) {
                const search = (card.dataset.search || '').toLowerCase();
                const type = card.dataset.type || '';
                const genre = card.dataset.genre || '';
                const matchesKeyword = !keyword || search.includes(keyword);
                const matchesType = !typeValue || type === typeValue || genre.includes(typeValue) || search.includes(typeValue.toLowerCase());
                const shouldShow = matchesKeyword && matchesType;
                card.classList.toggle('is-hidden', !shouldShow);
                if (shouldShow) {
                    visible.push(card);
                }
            });

            if (sortSelect && grid) {
                const sorted = visible.slice().sort(function (a, b) {
                    if (sortSelect.value === 'year-asc') {
                        return Number(a.dataset.year) - Number(b.dataset.year);
                    }
                    if (sortSelect.value === 'title') {
                        return (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-CN');
                    }
                    return Number(b.dataset.year) - Number(a.dataset.year);
                });
                sorted.forEach(function (card) {
                    grid.appendChild(card);
                });
            }

            if (count) {
                count.textContent = '共 ' + visible.length + ' 部影片';
            }
        }

        [input, typeFilter, sortSelect].forEach(function (element) {
            if (element) {
                element.addEventListener('input', applyFilter);
                element.addEventListener('change', applyFilter);
            }
        });

        applyFilter();
    }

    const globalSearch = document.querySelector('[data-global-search]');
    if (globalSearch && Array.isArray(window.MOVIE_SEARCH_DATA)) {
        const input = globalSearch.querySelector('[data-global-search-input]');
        const button = globalSearch.querySelector('[data-global-search-button]');
        const results = globalSearch.querySelector('[data-global-search-results]');
        const count = globalSearch.querySelector('[data-global-search-count]');

        function renderSearch() {
            const keyword = input.value.trim().toLowerCase();
            if (!keyword) {
                results.innerHTML = '';
                count.textContent = '请输入关键词开始搜索';
                return;
            }
            const matched = window.MOVIE_SEARCH_DATA.filter(function (movie) {
                return movie.search.toLowerCase().includes(keyword);
            }).slice(0, 80);
            results.innerHTML = matched.map(function (movie) {
                return [
                    '<article class="movie-card">',
                    '    <a class="poster-link" href="./' + movie.file + '">',
                    '        <img src="' + movie.image + '" alt="' + movie.title + '" loading="lazy">',
                    '        <span class="poster-glow"></span>',
                    '    </a>',
                    '    <div class="movie-card-body">',
                    '        <div class="movie-meta-line"><span>' + movie.year + '</span><span>' + movie.region + '</span><span>' + movie.type + '</span></div>',
                    '        <h3><a href="./' + movie.file + '">' + movie.title + '</a></h3>',
                    '        <p>' + movie.oneLine + '</p>',
                    '    </div>',
                    '</article>'
                ].join('');
            }).join('');
            count.textContent = '找到 ' + matched.length + ' 条相关结果';
        }

        button.addEventListener('click', renderSearch);
        input.addEventListener('input', renderSearch);
        input.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                renderSearch();
            }
        });
    }

    document.querySelectorAll('.js-player').forEach(function (shell) {
        const video = shell.querySelector('video');
        const trigger = shell.querySelector('.js-play-trigger');
        const stream = shell.dataset.stream;
        let hlsInstance = null;
        let prepared = false;

        function prepareVideo() {
            if (prepared || !video || !stream) {
                return;
            }
            prepared = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
            } else {
                video.src = stream;
            }
        }

        function playVideo() {
            prepareVideo();
            shell.classList.add('is-playing');
            const promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    shell.classList.remove('is-playing');
                });
            }
        }

        if (trigger) {
            trigger.addEventListener('click', playVideo);
        }

        if (video) {
            video.addEventListener('play', function () {
                shell.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                if (video.currentTime === 0 || video.ended) {
                    shell.classList.remove('is-playing');
                }
            });
            video.addEventListener('click', function () {
                if (!prepared) {
                    playVideo();
                }
            });
        }
    });
})();
