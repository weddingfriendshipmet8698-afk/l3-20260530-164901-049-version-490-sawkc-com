
function initVideoPlayer(source) {
  var video = document.getElementById('mainVideo');
  var overlay = document.getElementById('playOverlay');
  var ready = false;
  var hls = null;

  if (!video || !source) {
    return;
  }

  function loadSource() {
    if (ready) {
      return;
    }
    ready = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function playVideo() {
    loadSource();
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    video.controls = true;
    var playResult = video.play();
    if (playResult && typeof playResult.catch === 'function') {
      playResult.catch(function () {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      });
    }
  }

  if (overlay) {
    overlay.addEventListener('click', playVideo);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    }
  });

  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });

  video.addEventListener('ended', function () {
    if (overlay) {
      overlay.classList.remove('is-hidden');
    }
  });

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
