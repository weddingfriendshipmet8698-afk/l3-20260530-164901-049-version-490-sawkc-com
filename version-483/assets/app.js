(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var mobile = document.querySelector("[data-mobile-menu]");

        if (toggle && mobile) {
            toggle.addEventListener("click", function () {
                mobile.classList.toggle("is-open");
            });
        }

        var backTop = document.querySelector("[data-back-top]");

        if (backTop) {
            window.addEventListener("scroll", function () {
                if (window.scrollY > 360) {
                    backTop.classList.add("is-visible");
                } else {
                    backTop.classList.remove("is-visible");
                }
            });

            backTop.addEventListener("click", function () {
                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var heroIndex = 0;
        var heroTimer = null;

        function showHero(index) {
            if (!slides.length) {
                return;
            }

            heroIndex = (index + slides.length) % slides.length;

            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === heroIndex);
            });

            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === heroIndex);
            });
        }

        if (slides.length) {
            showHero(0);

            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    showHero(i);

                    if (heroTimer) {
                        window.clearInterval(heroTimer);
                    }

                    heroTimer = window.setInterval(function () {
                        showHero(heroIndex + 1);
                    }, 5200);
                });
            });

            heroTimer = window.setInterval(function () {
                showHero(heroIndex + 1);
            }, 5200);
        }

        var searchInput = document.querySelector("[data-search-input]");
        var yearFilter = document.querySelector("[data-year-filter]");
        var regionFilter = document.querySelector("[data-region-filter]");
        var genreFilter = document.querySelector("[data-genre-filter]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-title]"));
        var emptyState = document.querySelector("[data-empty-state]");

        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }

        function applySearch() {
            var keyword = normalize(searchInput && searchInput.value);
            var year = normalize(yearFilter && yearFilter.value);
            var region = normalize(regionFilter && regionFilter.value);
            var genre = normalize(genreFilter && genreFilter.value);
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-region") + " " + card.getAttribute("data-year") + " " + card.getAttribute("data-genre") + " " + card.textContent);
                var cardYear = normalize(card.getAttribute("data-year"));
                var cardRegion = normalize(card.getAttribute("data-region"));
                var cardGenre = normalize(card.getAttribute("data-genre"));
                var match = true;

                if (keyword && text.indexOf(keyword) === -1) {
                    match = false;
                }

                if (year && cardYear.indexOf(year) === -1) {
                    match = false;
                }

                if (region && cardRegion.indexOf(region) === -1) {
                    match = false;
                }

                if (genre && cardGenre.indexOf(genre) === -1) {
                    match = false;
                }

                card.style.display = match ? "" : "none";

                if (match) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle("is-visible", visible === 0);
            }
        }

        [searchInput, yearFilter, regionFilter, genreFilter].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applySearch);
                control.addEventListener("change", applySearch);
            }
        });

        if (searchInput || yearFilter || regionFilter || genreFilter) {
            applySearch();
        }
    });
})();
