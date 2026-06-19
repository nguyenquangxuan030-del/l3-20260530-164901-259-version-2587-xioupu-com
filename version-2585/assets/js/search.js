(function () {
  function escapeText(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function card(movie) {
    var tags = Array.isArray(movie.tags) ? movie.tags.slice(0, 3).join(" ") : "";
    return [
      '<article class="movie-card" data-title="', escapeText(movie.title), '" data-category="', escapeText(movie.category), '" data-tags="', escapeText(tags), '">',
      '<a class="poster-link" href="', escapeText(movie.url), '" aria-label="', escapeText(movie.title), '">',
      '<span class="poster-frame"><img src="', escapeText(movie.cover), '" alt="', escapeText(movie.title), '" loading="lazy"><span class="poster-shade"></span><span class="play-mark">▶</span><span class="duration-badge">', escapeText(movie.duration), '</span></span>',
      '</a>',
      '<div class="movie-info"><h3><a href="', escapeText(movie.url), '">', escapeText(movie.title), '</a></h3>',
      '<p>', escapeText(movie.oneLine), '</p>',
      '<div class="meta-row"><span>⭐ ', escapeText(movie.rating), '</span><span>', escapeText(movie.category), '</span><span>', escapeText(movie.year), '</span></div></div>',
      '</article>'
    ].join("");
  }

  function render() {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var input = document.getElementById("search-input");
    var title = document.getElementById("search-title");
    var results = document.getElementById("search-results");
    var data = Array.isArray(window.SEARCH_MOVIES) ? window.SEARCH_MOVIES : [];

    if (input) {
      input.value = query;
    }
    if (!results) {
      return;
    }
    if (!query) {
      return;
    }

    var lower = query.toLowerCase();
    var matched = data.filter(function (movie) {
      return [movie.title, movie.category, movie.region, movie.year, movie.genre, movie.oneLine, (movie.tags || []).join(" ")]
        .join(" ")
        .toLowerCase()
        .indexOf(lower) !== -1;
    }).slice(0, 120);

    if (title) {
      title.textContent = '“' + query + '”的搜索结果';
    }
    results.innerHTML = matched.length ? matched.map(card).join("") : '<div class="empty-state">没有找到匹配的剧集</div>';
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
