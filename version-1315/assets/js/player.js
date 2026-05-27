(function () {
  window.initMoviePlayer = function (src, playerId) {
    const Hls = window.Hls;
    const shell = document.getElementById(playerId);

  if (!shell) {
    return;
  }

  const video = shell.querySelector('video');
  const cover = shell.querySelector('[data-play-cover]');
  let ready = false;
  let hls = null;

  const attach = () => {
    if (!video || ready) {
      return;
    }

    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else if (Hls && Hls.isSupported()) {
      hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(src);
      hls.attachMedia(video);
    } else {
      video.src = src;
    }
  };

  const play = () => {
    attach();

    if (cover) {
      cover.classList.add('is-hidden');
    }

    const action = video.play();

    if (action && typeof action.catch === 'function') {
      action.catch(() => {
        if (cover) {
          cover.classList.remove('is-hidden');
        }
      });
    }
  };

  if (cover) {
    cover.addEventListener('click', play);
  }

  if (video) {
    video.addEventListener('click', () => {
      if (!ready) {
        play();
      }
    });

    video.addEventListener('play', () => {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    });
  }

    window.addEventListener('pagehide', () => {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  };
})();
