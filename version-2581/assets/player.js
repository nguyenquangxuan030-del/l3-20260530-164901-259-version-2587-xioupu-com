(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  onReady(function () {
    document.querySelectorAll("[data-player]").forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector(".play-overlay");
      var stream = video ? video.getAttribute("data-stream") : "";
      var hlsInstance = null;
      var attached = false;

      if (!video || !button || !stream) {
        return;
      }

      function attachStream() {
        if (attached) {
          return;
        }
        attached = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            maxBufferLength: 30,
            enableWorker: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          return;
        }

        video.src = stream;
      }

      function playVideo() {
        attachStream();
        button.classList.add("is-hidden");
        video.setAttribute("controls", "controls");
        var playTask = video.play();

        if (playTask && typeof playTask.catch === "function") {
          playTask.catch(function () {
            button.classList.remove("is-hidden");
          });
        }
      }

      button.addEventListener("click", playVideo);
      video.addEventListener("click", function () {
        if (video.paused) {
          playVideo();
        }
      });
      video.addEventListener("ended", function () {
        button.classList.remove("is-hidden");
      });
    });
  });
})();
