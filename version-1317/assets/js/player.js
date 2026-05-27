(function () {
  function initPlayer() {
    var video = document.querySelector("[data-player]");
    var mask = document.querySelector("[data-player-mask]");
    var button = document.querySelector("[data-play-button]");
    if (!video) {
      return;
    }

    var src = video.getAttribute("data-src") || "";
    var attached = false;

    function attach() {
      if (attached || !src) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        attached = true;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        attached = true;
        return;
      }
      video.src = src;
      attached = true;
    }

    function play() {
      attach();
      if (mask) {
        mask.classList.add("is-hidden");
      }
      var action = video.play();
      if (action && typeof action.catch === "function") {
        action.catch(function () {});
      }
    }

    if (mask) {
      mask.addEventListener("click", play);
    }
    if (button) {
      button.addEventListener("click", function (event) {
        event.stopPropagation();
        play();
      });
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
  }

  if (document.readyState !== "loading") {
    initPlayer();
  } else {
    document.addEventListener("DOMContentLoaded", initPlayer);
  }
})();
