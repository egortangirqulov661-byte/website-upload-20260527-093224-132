(function () {
  function initPlayer(shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.play-overlay');
    var src = shell.getAttribute('data-src');
    var started = false;

    function bindSource() {
      if (started || !video || !src) {
        return;
      }

      started = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });

        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
    }

    function playVideo() {
      bindSource();

      var result = video.play();

      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        playVideo();
      });
    }

    if (video) {
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });

      video.addEventListener('pause', function () {
        shell.classList.remove('is-playing');
      });

      video.addEventListener('click', function () {
        if (!started) {
          playVideo();
        }
      });
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initPlayer);
})();
