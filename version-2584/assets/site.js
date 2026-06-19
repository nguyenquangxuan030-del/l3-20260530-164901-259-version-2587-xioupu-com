(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.mobile-nav');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      var opened = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', opened ? 'false' : 'true');
      nav.hidden = opened;
    });
  }

  function initHero() {
    var hero = document.querySelector('.hero-carousel');
    if (!hero) {
      return;
    }
    var slides = selectAll('.hero-slide', hero);
    var dots = selectAll('.hero-dot', hero);
    var prev = hero.querySelector('.hero-prev');
    var next = hero.querySelector('.hero-next');
    var current = 0;
    var timer = null;

    function activate(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        activate(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        activate(parseInt(dot.getAttribute('data-slide-target'), 10) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        activate(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        activate(current + 1);
        restart();
      });
    }

    activate(0);
    restart();
  }

  function includesText(value, query) {
    return String(value || '').toLowerCase().indexOf(query) !== -1;
  }

  function initFilters() {
    var lists = selectAll('.filter-list');
    if (!lists.length) {
      return;
    }
    var queryInput = document.querySelector('.filter-query');
    var typeSelect = document.querySelector('.filter-type');
    var yearSelect = document.querySelector('.filter-year');
    var genreInput = document.querySelector('.filter-genre');
    var empty = document.querySelector('.empty-state');

    function apply() {
      var query = queryInput ? queryInput.value.trim().toLowerCase() : '';
      var type = typeSelect ? typeSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var genre = genreInput ? genreInput.value.trim().toLowerCase() : '';
      var visible = 0;
      selectAll('.movie-card').forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.textContent
        ].join(' ').toLowerCase();
        var matched = true;
        if (query && !includesText(haystack, query)) {
          matched = false;
        }
        if (type && card.getAttribute('data-type') !== type) {
          matched = false;
        }
        if (year && card.getAttribute('data-year') !== year) {
          matched = false;
        }
        if (genre && !includesText(card.getAttribute('data-genre'), genre)) {
          matched = false;
        }
        card.classList.toggle('hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [queryInput, typeSelect, yearSelect, genreInput].forEach(function (control) {
      if (!control) {
        return;
      }
      control.addEventListener('input', apply);
      control.addEventListener('change', apply);
    });
  }

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
  });

  window.initMoviePlayer = function (sourceUrl) {
    ready(function () {
      var video = document.getElementById('player');
      var overlay = document.querySelector('.play-overlay');
      if (!video || !sourceUrl) {
        return;
      }
      var attached = false;

      function attach() {
        if (attached) {
          return;
        }
        attached = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = sourceUrl;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(sourceUrl);
          hls.attachMedia(video);
          return;
        }
        video.src = sourceUrl;
      }

      function play() {
        attach();
        video.controls = true;
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function () {});
        }
      }

      if (overlay) {
        overlay.addEventListener('click', play);
      }
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
    });
  };
})();
