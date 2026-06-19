(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
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
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var searchForm = document.querySelector('[data-search-form]');
  var searchInput = document.querySelector('[data-search-input]');
  var searchResults = document.querySelector('[data-search-results]');
  var searchTitle = document.querySelector('[data-search-title]');
  if (searchForm && searchInput && searchResults && window.SEARCH_MOVIES) {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    searchInput.value = initial;
    function createCard(movie) {
      var tags = movie.tags.slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return [
        '<article class="movie-card">',
        '<a class="card-cover" href="' + movie.url + '">',
        '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '<span class="play-dot">▶</span>',
        '</a>',
        '<div class="card-body">',
        '<a class="card-title" href="' + movie.url + '">' + escapeHtml(movie.title) + '</a>',
        '<p class="card-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + ' · ' + escapeHtml(movie.year) + '</p>',
        '<p class="card-desc">' + escapeHtml(movie.desc) + '</p>',
        '<div class="tag-row">' + tags + '</div>',
        '</div>',
        '</article>'
      ].join('');
    }
    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
    function runSearch() {
      var q = searchInput.value.trim().toLowerCase();
      var pool = window.SEARCH_MOVIES;
      var result = q ? pool.filter(function (movie) {
        return movie.search.indexOf(q) !== -1;
      }) : pool.slice(0, 60);
      searchTitle.textContent = q ? '搜索结果' : '推荐浏览';
      searchResults.innerHTML = result.slice(0, 120).map(createCard).join('');
    }
    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var q = searchInput.value.trim();
      var next = q ? 'search.html?q=' + encodeURIComponent(q) : 'search.html';
      window.history.replaceState(null, '', next);
      runSearch();
    });
    searchInput.addEventListener('input', runSearch);
    runSearch();
  }
}());

function setupPlayer(url) {
  var video = document.getElementById('main-player');
  var cover = document.querySelector('[data-player-cover]');
  if (!video || !cover || !url) {
    return;
  }
  var ready = false;
  var hlsInstance = null;
  function attach() {
    if (ready) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      ready = true;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hlsInstance.loadSource(url);
      hlsInstance.attachMedia(video);
      ready = true;
      return;
    }
    video.src = url;
    ready = true;
  }
  function start() {
    attach();
    cover.classList.add('is-hidden');
    video.setAttribute('controls', 'controls');
    var action = video.play();
    if (action && typeof action.catch === 'function') {
      action.catch(function () {});
    }
  }
  cover.addEventListener('click', start);
  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    } else {
      video.pause();
    }
  });
  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
