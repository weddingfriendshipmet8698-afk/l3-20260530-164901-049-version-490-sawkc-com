function initializePlayer(source) {
    const video = document.getElementById("movie-video");
    const trigger = document.getElementById("play-trigger");
    let ready = false;
    let hlsInstance = null;

    const attach = function () {
        if (!video || !source || ready) {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            ready = true;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                ready = true;
            });
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal && hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                    video.src = source;
                    ready = true;
                }
            });
            return;
        }

        video.src = source;
        ready = true;
    };

    const start = function () {
        attach();
        if (!video) {
            return;
        }
        if (trigger) {
            trigger.classList.add("is-hidden");
        }
        const playTask = video.play();
        if (playTask && typeof playTask.catch === "function") {
            playTask.catch(function () {
                if (trigger) {
                    trigger.classList.remove("is-hidden");
                }
            });
        }
    };

    attach();

    if (trigger) {
        trigger.addEventListener("click", start);
    }

    if (video) {
        video.addEventListener("play", function () {
            if (trigger) {
                trigger.classList.add("is-hidden");
            }
        });
        video.addEventListener("pause", function () {
            if (trigger && video.currentTime === 0) {
                trigger.classList.remove("is-hidden");
            }
        });
    }
}
