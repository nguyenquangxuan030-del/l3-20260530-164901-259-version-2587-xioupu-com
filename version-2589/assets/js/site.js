(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMobileMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var slides = selectAll('[data-hero-slide]');
    if (slides.length < 2) {
      return;
    }
    var dots = selectAll('[data-hero-dot]');
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function start() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    start();
  }

  function createResultCard(item) {
    var article = document.createElement('article');
    article.className = 'movie-card movie-card-compact';
    article.innerHTML = [
      '<a class="movie-cover" href="' + item.url + '">',
      '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '<span class="movie-year">' + item.year + '</span>',
      '</a>',
      '<div class="movie-card-body">',
      '<div class="movie-card-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>',
      '<h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
      '<p>' + escapeHtml(item.oneLine) + '</p>',
      '<div class="genre-tags"><span>' + escapeHtml(item.category) + '</span></div>',
      '</div>'
    ].join('');
    return article;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function initGlobalSearch() {
    var input = document.querySelector('[data-global-search]');
    var results = document.querySelector('[data-search-results]');
    var clear = document.querySelector('[data-clear-search]');
    if (!input || !results || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    function render() {
      var query = input.value.trim().toLowerCase();
      results.innerHTML = '';
      if (!query) {
        return;
      }
      var matched = window.MOVIE_SEARCH_INDEX.filter(function (item) {
        return item.tokens.indexOf(query) !== -1;
      }).slice(0, 24);

      if (!matched.length) {
        var empty = document.createElement('div');
        empty.className = 'search-empty';
        empty.textContent = '没有找到匹配影片';
        results.appendChild(empty);
        return;
      }

      matched.forEach(function (item) {
        results.appendChild(createResultCard(item));
      });
    }

    input.addEventListener('input', render);
    if (clear) {
      clear.addEventListener('click', function () {
        input.value = '';
        render();
        input.focus();
      });
    }
  }

  function initLocalFilter() {
    var input = document.querySelector('[data-local-filter]');
    if (!input) {
      return;
    }
    var cards = selectAll('[data-card]');
    input.addEventListener('input', function () {
      var query = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
        card.classList.toggle('is-hidden', query && text.indexOf(query) === -1);
      });
    });
  }

  function initPlayers() {
    selectAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-play-button]');
      if (!video) {
        return;
      }
      var src = video.getAttribute('data-src');
      var hls = null;
      var loaded = false;

      function load() {
        if (loaded || !src) {
          return;
        }
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(src);
          hls.attachMedia(video);
        } else {
          video.src = src;
        }
      }

      function play() {
        load();
        video.play().then(function () {
          if (button) {
            button.classList.add('is-hidden');
          }
        }).catch(function () {
          if (button) {
            button.classList.remove('is-hidden');
          }
        });
      }

      if (button) {
        button.addEventListener('click', play);
      }
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
      });
      video.addEventListener('pause', function () {
        if (button && video.currentTime === 0) {
          button.classList.remove('is-hidden');
        }
      });
      video.addEventListener('error', function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
        loaded = false;
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHero();
    initGlobalSearch();
    initLocalFilter();
    initPlayers();
  });
})();
