(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupFilters() {
    var searchInput = document.querySelector('[data-card-search]');
    var typeSelect = document.querySelector('[data-card-type]');
    var categorySelect = document.querySelector('[data-card-category]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

    if (!cards.length) {
      return;
    }

    function applyFilter() {
      var query = normalize(searchInput && searchInput.value);
      var typeValue = normalize(typeSelect && typeSelect.value);
      var categoryValue = normalize(categorySelect && categorySelect.value);

      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.year,
          card.dataset.region,
          card.dataset.type,
          card.dataset.category,
          card.dataset.tags,
          card.textContent
        ].join(' '));
        var typeMatched = !typeValue || normalize(card.dataset.type).indexOf(typeValue) !== -1;
        var categoryMatched = !categoryValue || normalize(card.dataset.category) === categoryValue;
        var queryMatched = !query || haystack.indexOf(query) !== -1;
        card.classList.toggle('is-hidden', !(typeMatched && categoryMatched && queryMatched));
      });
    }

    [searchInput, typeSelect, categorySelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');
    if (initialQuery && searchInput) {
      searchInput.value = initialQuery;
      applyFilter();
    }
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
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

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
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

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-play-button]');
      var source = player.dataset.src;
      var fallback = player.dataset.fallback;
      var started = false;
      var hlsInstance = null;

      if (!video || !source) {
        return;
      }

      function attachFallback() {
        if (fallback && video.src.indexOf(fallback) === -1) {
          video.src = fallback;
          video.load();
        }
      }

      function startPlayback() {
        if (!started) {
          started = true;
          if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: false,
              backBufferLength: 90
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal) {
                hlsInstance.destroy();
                attachFallback();
              }
            });
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
          } else {
            attachFallback();
          }
        }

        player.classList.add('playing');
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            attachFallback();
            video.play().catch(function () {});
          });
        }
      }

      if (button) {
        button.addEventListener('click', startPlayback);
      }

      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayback();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupFilters();
    setupHero();
    setupPlayers();
  });
})();
