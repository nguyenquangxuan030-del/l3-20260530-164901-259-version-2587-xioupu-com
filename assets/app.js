(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function textOf(el) {
    return (el.getAttribute("data-title") + " " + el.getAttribute("data-genre") + " " + el.getAttribute("data-region") + " " + el.getAttribute("data-year") + " " + el.textContent).toLowerCase();
  }

  function playVideo(video) {
    var p = video.play();
    if (p && typeof p.catch === "function") {
      p.catch(function () {});
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var links = document.querySelector("[data-nav-links]");
    if (toggle && links) {
      toggle.addEventListener("click", function () {
        links.classList.toggle("is-open");
      });
    }

    var slider = document.querySelector("[data-hero-slider]");
    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
      var thumbs = Array.prototype.slice.call(document.querySelectorAll("[data-hero-thumb]"));
      var active = 0;
      var timer = null;

      function setSlide(index) {
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === active);
        });
        thumbs.forEach(function (thumb, i) {
          thumb.classList.toggle("is-active", i === active);
        });
      }

      function schedule() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          setSlide(active + 1);
        }, 5200);
      }

      thumbs.forEach(function (thumb, i) {
        thumb.addEventListener("click", function () {
          setSlide(i);
          schedule();
        });
      });
      setSlide(0);
      schedule();
    }

    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search]"));
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var currentFilter = "all";

    function applyFilter() {
      var query = inputs.map(function (input) {
        return input.value.trim().toLowerCase();
      }).filter(Boolean).join(" ");

      cards.forEach(function (card) {
        var haystack = textOf(card);
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchFilter = currentFilter === "all" || haystack.indexOf(currentFilter.toLowerCase()) !== -1;
        card.classList.toggle("hidden-card", !(matchQuery && matchFilter));
      });
    }

    inputs.forEach(function (input) {
      input.addEventListener("input", applyFilter);
    });

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        currentFilter = button.getAttribute("data-filter-value") || "all";
        buttons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        applyFilter();
      });
    });
  });

  window.initMoviePlayer = function (videoId, sourceUrl) {
    var video = document.getElementById(videoId);
    if (!video) {
      return;
    }
    var box = video.closest(".player-box");
    var cover = box ? box.querySelector(".play-cover") : null;
    var started = false;
    var hlsInstance = null;

    function start() {
      if (cover) {
        cover.classList.add("is-hidden");
      }
      video.controls = true;
      if (started) {
        playVideo(video);
        return;
      }
      started = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
        video.addEventListener("loadedmetadata", function () {
          playVideo(video);
        }, { once: true });
        video.load();
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo(video);
        });
      } else {
        video.src = sourceUrl;
        video.load();
        playVideo(video);
      }
    }

    if (cover) {
      cover.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (!started) {
        start();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
