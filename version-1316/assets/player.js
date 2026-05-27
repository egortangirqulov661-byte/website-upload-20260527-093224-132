import { H as Hls } from './hls-core.js';

function attachStream(video, url) {
  if (!video || !url) {
    return Promise.resolve();
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    if (video.src !== url) {
      video.src = url;
    }
    return video.play();
  }

  if (Hls && Hls.isSupported()) {
    if (!video.__hlsInstance) {
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      video.__hlsInstance = hls;
    }
    return video.play();
  }

  video.src = url;
  return video.play();
}

document.querySelectorAll('.player-shell').forEach(function (shell) {
  var video = shell.querySelector('video');
  var cover = shell.querySelector('.player-cover');
  var url = shell.getAttribute('data-stream');

  function start() {
    if (cover) {
      cover.classList.add('hidden');
    }
    attachStream(video, url).catch(function () {});
  }

  if (cover) {
    cover.addEventListener('click', start);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      } else {
        video.pause();
      }
    });
  }
});
