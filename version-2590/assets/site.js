(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector('.mobile-toggle');
    var menu = document.querySelector('.mobile-nav');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('.hero-prev');
    var next = document.querySelector('.hero-next');
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }
    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    start();
  }

  function initFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll('.movie-list-scope'));
    scopes.forEach(function (scope) {
      var search = scope.querySelector('[data-filter-search]');
      var year = scope.querySelector('[data-filter-year]');
      var category = scope.querySelector('[data-filter-category]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
      var rows = Array.prototype.slice.call(scope.querySelectorAll('.rank-row'));
      var empty = scope.querySelector('.no-results');
      if (!search && !year && !category) {
        return;
      }
      function value(control) {
        return control ? control.value.trim().toLowerCase() : '';
      }
      function apply() {
        var query = value(search);
        var selectedYear = value(year);
        var selectedCategory = value(category);
        var visible = 0;
        cards.forEach(function (card) {
          var words = (card.getAttribute('data-keywords') || '').toLowerCase();
          var cardYear = (card.getAttribute('data-year') || '').toLowerCase();
          var cats = (card.getAttribute('data-category') || '').toLowerCase();
          var match = true;
          if (query && words.indexOf(query) === -1) {
            match = false;
          }
          if (selectedYear && cardYear.indexOf(selectedYear) === -1) {
            match = false;
          }
          if (selectedCategory && cats.indexOf(selectedCategory) === -1) {
            match = false;
          }
          card.classList.toggle('is-hidden', !match);
          if (match) {
            visible += 1;
          }
        });
        rows.forEach(function (row) {
          var words = row.textContent.toLowerCase();
          var match = !query || words.indexOf(query) !== -1;
          row.classList.toggle('is-hidden', !match);
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }
      [search, year, category].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
    });
  }

  window.initMoviePlayer = function (stream) {
    var shell = document.querySelector('.video-shell');
    if (!shell) {
      return;
    }
    var video = shell.querySelector('video');
    var cover = shell.querySelector('.video-cover');
    if (!video || !stream) {
      return;
    }
    var prepared = false;
    function prepare() {
      if (prepared) {
        return;
      }
      prepared = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }
    function start() {
      prepare();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      video.controls = true;
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {
          video.controls = true;
        });
      }
    }
    if (cover) {
      cover.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
      if (!prepared) {
        start();
      }
    });
  };

  ready(function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
