(function () {
    var mobileButton = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (mobileButton && mobileNav) {
        mobileButton.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    var backTop = document.querySelector(".back-top");

    if (backTop) {
        window.addEventListener("scroll", function () {
            if (window.scrollY > 460) {
                backTop.classList.add("is-visible");
            } else {
                backTop.classList.remove("is-visible");
            }
        });

        backTop.addEventListener("click", function (event) {
            event.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }

    var heroCards = Array.prototype.slice.call(document.querySelectorAll(".hero-card"));
    var heroDots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var heroIndex = 0;
    var heroTimer = null;

    function showHero(index) {
        if (!heroCards.length) {
            return;
        }

        heroIndex = (index + heroCards.length) % heroCards.length;

        heroCards.forEach(function (card, cardIndex) {
            card.classList.toggle("is-active", cardIndex === heroIndex);
        });

        heroDots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === heroIndex);
        });
    }

    function startHero() {
        if (heroCards.length < 2) {
            return;
        }

        window.clearInterval(heroTimer);
        heroTimer = window.setInterval(function () {
            showHero(heroIndex + 1);
        }, 5200);
    }

    heroDots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            showHero(index);
            startHero();
        });
    });

    showHero(0);
    startHero();

    var filterForms = Array.prototype.slice.call(document.querySelectorAll(".filter-bar"));

    filterForms.forEach(function (bar) {
        var input = bar.querySelector(".js-search-input");
        var region = bar.querySelector(".js-region-filter");
        var genre = bar.querySelector(".js-genre-filter");
        var year = bar.querySelector(".js-year-filter");
        var scope = document.querySelector(bar.getAttribute("data-target") || ".js-card-scope");
        var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll(".movie-card")) : [];
        var noResult = document.querySelector(bar.getAttribute("data-empty") || ".no-result");

        function valueOf(element) {
            return element ? element.value.trim().toLowerCase() : "";
        }

        function runFilter() {
            var keyword = valueOf(input);
            var regionValue = valueOf(region);
            var genreValue = valueOf(genre);
            var yearValue = valueOf(year);
            var visible = 0;

            cards.forEach(function (card) {
                var text = [
                    card.getAttribute("data-title") || "",
                    card.getAttribute("data-region") || "",
                    card.getAttribute("data-genre") || "",
                    card.getAttribute("data-tags") || "",
                    card.textContent || ""
                ].join(" ").toLowerCase();

                var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchedRegion = !regionValue || (card.getAttribute("data-region") || "").toLowerCase().indexOf(regionValue) !== -1;
                var matchedGenre = !genreValue || (card.getAttribute("data-genre") || "").toLowerCase().indexOf(genreValue) !== -1;
                var matchedYear = !yearValue || (card.getAttribute("data-year") || "").toLowerCase() === yearValue;
                var matched = matchedKeyword && matchedRegion && matchedGenre && matchedYear;

                card.classList.toggle("hidden-by-filter", !matched);

                if (matched) {
                    visible += 1;
                }
            });

            if (noResult) {
                noResult.classList.toggle("is-visible", visible === 0);
            }
        }

        if (input && window.location.search) {
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q");

            if (query) {
                input.value = query;
            }
        }

        [input, region, genre, year].forEach(function (control) {
            if (control) {
                control.addEventListener("input", runFilter);
                control.addEventListener("change", runFilter);
            }
        });

        runFilter();
    });
})();

function initMoviePlayer(url) {
    var video = document.getElementById("movie-player");
    var layer = document.querySelector(".play-layer");
    var button = document.querySelector(".play-button");
    var hls = null;
    var ready = false;

    if (!video) {
        return;
    }

    function attach() {
        if (ready) {
            return;
        }

        ready = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(url);
            hls.attachMedia(video);
        } else {
            video.src = url;
        }
    }

    function play() {
        attach();

        if (layer) {
            layer.classList.add("is-hidden");
        }

        var promise = video.play();

        if (promise && promise.catch) {
            promise.catch(function () {});
        }
    }

    if (layer) {
        layer.addEventListener("click", play);
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

    video.addEventListener("play", function () {
        if (layer) {
            layer.classList.add("is-hidden");
        }
    });

    window.addEventListener("pagehide", function () {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
}
