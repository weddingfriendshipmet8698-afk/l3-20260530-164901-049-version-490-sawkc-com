(function () {
    var mobileButton = document.querySelector(".mobile-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (mobileButton && mobileNav) {
        mobileButton.addEventListener("click", function () {
            var open = mobileNav.hasAttribute("hidden");
            if (open) {
                mobileNav.removeAttribute("hidden");
                mobileButton.setAttribute("aria-expanded", "true");
                mobileButton.textContent = "×";
            } else {
                mobileNav.setAttribute("hidden", "");
                mobileButton.setAttribute("aria-expanded", "false");
                mobileButton.textContent = "☰";
            }
        });
    }

    document.querySelectorAll("img").forEach(function (image) {
        image.addEventListener("error", function () {
            image.classList.add("image-empty");
        }, { once: true });
    });

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                restart();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                showSlide(dotIndex);
                restart();
            });
        });

        showSlide(0);
        restart();
    }

    document.querySelectorAll("[data-local-filter]").forEach(function (panel) {
        var input = panel.querySelector("[data-filter-input]");
        var year = panel.querySelector("[data-filter-year]");
        var region = panel.querySelector("[data-filter-region]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-title]"));

        function applyFilter() {
            var keyword = input ? input.value.trim().toLowerCase() : "";
            var selectedYear = year ? year.value : "";
            var selectedRegion = region ? region.value : "";

            cards.forEach(function (card) {
                var text = [
                    card.dataset.title || "",
                    card.dataset.year || "",
                    card.dataset.region || "",
                    card.dataset.genre || ""
                ].join(" ").toLowerCase();
                var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchedYear = !selectedYear || card.dataset.year === selectedYear;
                var matchedRegion = !selectedRegion || (card.dataset.region || "").indexOf(selectedRegion) !== -1;
                card.classList.toggle("hidden-card", !(matchedKeyword && matchedYear && matchedRegion));
            });
        }

        [input, year, region].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilter);
                control.addEventListener("change", applyFilter);
            }
        });
    });

    var searchRoot = document.querySelector("[data-search-root]");
    if (searchRoot && window.MOVIE_INDEX) {
        var searchInput = searchRoot.querySelector("[data-search-input]");
        var searchYear = searchRoot.querySelector("[data-search-year]");
        var searchType = searchRoot.querySelector("[data-search-type]");
        var resultBox = searchRoot.querySelector("[data-search-results]");
        var resultNote = searchRoot.querySelector("[data-search-note]");

        function card(movie) {
            var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
                return "<span>" + escapeHtml(tag) + "</span>";
            }).join("");
            return [
                "<a class=\"movie-card\" href=\"" + escapeAttr(movie.url) + "\">",
                "<span class=\"poster-shell\"><img src=\"" + escapeAttr(movie.cover) + "\" alt=\"" + escapeAttr(movie.title) + "\" loading=\"lazy\"><span class=\"poster-gradient\"></span><span class=\"movie-badge\">" + escapeHtml(movie.type) + "</span></span>",
                "<span class=\"movie-info\"><strong>" + escapeHtml(movie.title) + "</strong><small>" + escapeHtml(movie.year) + " · " + escapeHtml(movie.region) + " · " + escapeHtml(movie.genre) + "</small><em>" + escapeHtml(movie.oneLine) + "</em><span class=\"tag-row\">" + tags + "</span></span>",
                "</a>"
            ].join("");
        }

        function escapeHtml(value) {
            return String(value).replace(/[&<>]/g, function (char) {
                return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[char];
            });
        }

        function escapeAttr(value) {
            return escapeHtml(value).replace(/"/g, "&quot;");
        }

        function render() {
            var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
            var yearValue = searchYear ? searchYear.value : "";
            var typeValue = searchType ? searchType.value : "";
            var result = window.MOVIE_INDEX.filter(function (movie) {
                var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags.join(" "), movie.oneLine].join(" ").toLowerCase();
                return (!keyword || text.indexOf(keyword) !== -1)
                    && (!yearValue || movie.year === yearValue)
                    && (!typeValue || movie.type.indexOf(typeValue) !== -1 || movie.genre.indexOf(typeValue) !== -1);
            }).slice(0, 96);

            resultBox.innerHTML = result.map(card).join("");
            resultNote.textContent = result.length ? "已为你筛选出相关剧目" : "没有找到匹配内容";
            resultBox.querySelectorAll("img").forEach(function (image) {
                image.addEventListener("error", function () {
                    image.classList.add("image-empty");
                }, { once: true });
            });
        }

        [searchInput, searchYear, searchType].forEach(function (control) {
            if (control) {
                control.addEventListener("input", render);
                control.addEventListener("change", render);
            }
        });
        render();
    }

    document.querySelectorAll("[data-player]").forEach(function (player) {
        var video = player.querySelector("video");
        var buttons = Array.prototype.slice.call(player.querySelectorAll("[data-play]"));
        var layer = player.querySelector(".play-layer");
        var message = player.querySelector(".player-message");
        var stream = player.getAttribute("data-stream");
        var hls = null;
        var ready = false;

        function setMessage(text) {
            if (message) {
                message.textContent = text || "";
            }
        }

        function hideLayer() {
            if (layer) {
                layer.classList.add("is-hidden");
            }
        }

        function attachStream() {
            if (!video || !stream || ready) {
                return;
            }
            ready = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }
        }

        function startPlayback(event) {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
            attachStream();
            hideLayer();
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    setMessage("点击视频区域继续播放");
                });
            }
        }

        buttons.forEach(function (button) {
            button.addEventListener("click", startPlayback);
        });

        if (video) {
            video.addEventListener("click", startPlayback);
            video.addEventListener("play", hideLayer);
            video.addEventListener("error", function () {
                setMessage("播放失败，请稍后重试");
            });
        }
    });
})();
