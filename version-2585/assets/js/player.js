(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  window.setupMoviePlayer = function (videoId, sourceUrl, buttonId) {
    ready(function () {
      var video = document.getElementById(videoId);
      var button = document.getElementById(buttonId);
      var hls = null;

      if (!video || !button || !sourceUrl) {
        return;
      }

      function attachSource() {
        if (video.getAttribute("data-ready") === "1") {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(sourceUrl);
          hls.attachMedia(video);
        } else {
          video.src = sourceUrl;
        }
        video.setAttribute("data-ready", "1");
      }

      function beginPlay() {
        attachSource();
        button.classList.add("is-hidden");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            button.classList.remove("is-hidden");
          });
        }
      }

      button.addEventListener("click", beginPlay);
      video.addEventListener("play", function () {
        button.classList.add("is-hidden");
      });
      video.addEventListener("ended", function () {
        button.classList.remove("is-hidden");
      });
      video.addEventListener("click", function () {
        if (video.paused) {
          beginPlay();
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  };
})();
