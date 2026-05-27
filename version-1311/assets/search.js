(function () {
  var input = document.getElementById('searchInput');
  var results = document.getElementById('searchResults');
  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get('q') || '';

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function cardTemplate(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '' +
      '<article class="movie-card compact">' +
        '<a class="poster-wrap" href="' + escapeHtml(item.url) + '">' +
          '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
          '<span class="poster-shade"></span>' +
          '<span class="play-pill">立即播放</span>' +
        '</a>' +
        '<div class="card-body">' +
          '<h3><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h3>' +
          '<p class="card-meta">' + escapeHtml(item.year) + ' · ' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + '</p>' +
          '<p class="card-desc">' + escapeHtml(item.oneLine) + '</p>' +
          '<div class="tag-list">' + tags + '</div>' +
        '</div>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[character];
    });
  }

  function runSearch(query) {
    if (!results) {
      return;
    }

    var keyword = normalize(query);
    var source = window.MovieSearchIndex || [];
    var matches = source.filter(function (item) {
      var text = normalize([
        item.title,
        item.year,
        item.region,
        item.type,
        item.genre,
        (item.tags || []).join(' '),
        item.oneLine
      ].join(' '));

      return !keyword || text.indexOf(keyword) !== -1;
    }).slice(0, 80);

    if (!matches.length) {
      results.innerHTML = '<p class="search-empty">没有找到匹配影片。</p>';
      return;
    }

    results.innerHTML = matches.map(cardTemplate).join('');
  }

  if (input) {
    input.value = initialQuery;
    input.addEventListener('input', function () {
      runSearch(input.value);
    });
  }

  runSearch(initialQuery);
})();
