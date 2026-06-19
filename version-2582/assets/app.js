(() => {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');

  if (menuButton && menu) {
    menuButton.addEventListener('click', () => {
      menu.classList.toggle('is-open');
    });
  }

  const slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
    const prev = slider.querySelector('[data-hero-prev]');
    const next = slider.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    const showSlide = (target) => {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('active', dotIndex === index);
      });
    };

    const start = () => {
      window.clearInterval(timer);
      timer = window.setInterval(() => showSlide(index + 1), 5200);
    };

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        showSlide(Number(dot.dataset.heroDot || 0));
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', () => {
        showSlide(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', () => {
        showSlide(index + 1);
        start();
      });
    }

    showSlide(0);
    start();
  }

  const scopes = document.querySelectorAll('[data-filter-scope]');

  scopes.forEach((scope) => {
    const input = scope.querySelector('[data-search-input]');
    const clearButton = scope.querySelector('[data-clear-filter]');
    const noResult = scope.querySelector('[data-no-result]');
    const selects = Array.from(scope.querySelectorAll('[data-filter-select]'));
    const cards = Array.from(document.querySelectorAll('.filter-card'));

    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');

    if (input && query) {
      input.value = query;
    }

    const normalize = (value) => String(value || '').toLowerCase().trim();

    const applyFilters = () => {
      const term = normalize(input ? input.value : '');
      const filters = selects.map((select) => ({
        key: select.dataset.filterSelect,
        value: normalize(select.value)
      }));
      let visible = 0;

      cards.forEach((card) => {
        const haystack = normalize(card.dataset.search);
        const matchesTerm = !term || haystack.includes(term);
        const matchesFilters = filters.every((filter) => {
          if (!filter.value) {
            return true;
          }
          return normalize(card.dataset[filter.key]).includes(filter.value);
        });
        const matched = matchesTerm && matchesFilters;
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (noResult) {
        noResult.hidden = visible !== 0;
      }
    };

    if (input) {
      input.addEventListener('input', applyFilters);
    }

    selects.forEach((select) => {
      select.addEventListener('change', applyFilters);
    });

    if (clearButton) {
      clearButton.addEventListener('click', () => {
        if (input) {
          input.value = '';
        }
        selects.forEach((select) => {
          select.value = '';
        });
        applyFilters();
      });
    }

    applyFilters();
  });

  const video = document.querySelector('#movieVideo');
  const playButton = document.querySelector('[data-play-button]');
  const message = document.querySelector('[data-player-message]');

  if (video && playButton) {
    let loaded = false;
    let hlsInstance = null;

    const setMessage = (value) => {
      if (message) {
        message.textContent = value || '';
      }
    };

    const attachSource = () => {
      const source = video.dataset.src;

      if (!source || loaded) {
        return;
      }

      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, (event, data) => {
          if (data && data.fatal) {
            setMessage('播放加载遇到问题，请稍后重试。');
          }
        });
        return;
      }

      video.src = source;
    };

    const startVideo = () => {
      attachSource();
      playButton.classList.add('is-hidden');
      setMessage('');
      const playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          playButton.classList.remove('is-hidden');
        });
      }
    };

    playButton.addEventListener('click', startVideo);

    video.addEventListener('click', () => {
      if (video.paused) {
        startVideo();
      }
    });

    video.addEventListener('play', () => {
      playButton.classList.add('is-hidden');
    });

    video.addEventListener('error', () => {
      setMessage('播放加载遇到问题，请稍后重试。');
      playButton.classList.remove('is-hidden');
    });

    window.addEventListener('pagehide', () => {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
})();
