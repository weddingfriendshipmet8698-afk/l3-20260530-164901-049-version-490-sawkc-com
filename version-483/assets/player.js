(function () {
    var currentScript = document.currentScript;
    var localHlsUrl = "";

    if (currentScript && currentScript.src) {
        localHlsUrl = new URL("hls-vendor-dru42stk.js", currentScript.src).href;
    }

    function loadRemoteHls() {
        return new Promise(function (resolve, reject) {
            if (window.Hls) {
                resolve(window.Hls);
                return;
            }

            var script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";
            script.onload = function () {
                resolve(window.Hls);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    function getLocalHls() {
        if (!localHlsUrl) {
            return Promise.reject(new Error("hls"));
        }

        return import(localHlsUrl).then(function (module) {
            return module.H;
        });
    }

    function getHls() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }

        return getLocalHls().catch(function () {
            return loadRemoteHls();
        });
    }

    function playVideo(video, url) {
        if (!video || !url) {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            if (video.src !== url) {
                video.src = url;
            }

            video.play().catch(function () {});
            return;
        }

        getHls().then(function (Hls) {
            if (Hls && Hls.isSupported()) {
                if (!video.__hlsPlayer) {
                    video.__hlsPlayer = new Hls({
                        enableWorker: true,
                        lowLatencyMode: false
                    });
                    video.__hlsPlayer.attachMedia(video);
                }

                video.__hlsPlayer.loadSource(url);
                video.__hlsPlayer.on(Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
                return;
            }

            video.src = url;
            video.play().catch(function () {});
        }).catch(function () {
            video.src = url;
            video.play().catch(function () {});
        });
    }

    window.bindMoviePlayer = function (videoId, buttonId, overlayId, url) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var overlay = document.getElementById(overlayId);

        function begin() {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }

            if (video) {
                video.setAttribute("controls", "controls");
            }

            playVideo(video, url);
        }

        if (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();
                begin();
            });
        }

        if (overlay) {
            overlay.addEventListener("click", begin);
        }

        if (video) {
            video.addEventListener("click", function () {
                if (video.paused && !video.currentSrc) {
                    begin();
                }
            });
        }
    };
})();
