(function() {
  window.setupPlayer = function(video, trigger, source) {
    if (!video || !trigger || !source) {
      return;
    }

    var started = false;

    function begin() {
      if (started) {
        return;
      }

      started = true;
      trigger.classList.add("is-hidden");
      video.controls = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.play().catch(function() {});
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function() {
          video.play().catch(function() {});
        });
        hls.on(window.Hls.Events.ERROR, function(event, data) {
          if (data && data.fatal) {
            hls.destroy();
            video.src = source;
            video.play().catch(function() {});
          }
        });
        return;
      }

      video.src = source;
      video.play().catch(function() {});
    }

    trigger.addEventListener("click", begin);
    video.addEventListener("click", begin);
  };
})();
