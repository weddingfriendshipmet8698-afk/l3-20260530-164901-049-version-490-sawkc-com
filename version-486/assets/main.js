(function () {
    const menuButton = document.querySelector("[data-menu-toggle]");
    const mobileMenu = document.querySelector("[data-mobile-menu]");

    if (menuButton && mobileMenu) {
        menuButton.addEventListener("click", function () {
            mobileMenu.classList.toggle("is-open");
        });
    }

    const hero = document.querySelector("[data-hero]");
    if (hero) {
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        let activeIndex = 0;

        const showSlide = function (index) {
            if (!slides.length) {
                return;
            }

            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === activeIndex);
            });
        };

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                showSlide(dotIndex);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5600);
        }
    }

    const filterPanels = Array.from(document.querySelectorAll("[data-filter-panel]"));

    filterPanels.forEach(function (panel) {
        const scope = panel.closest("section") || document;
        const input = panel.querySelector("[data-search-input]");
        const typeFilter = panel.querySelector("[data-type-filter]");
        const yearFilter = panel.querySelector("[data-year-filter]");
        const reset = panel.querySelector("[data-filter-reset]");
        const cards = Array.from(scope.parentElement ? scope.parentElement.querySelectorAll("[data-movie-card]") : document.querySelectorAll("[data-movie-card]"));
        let message = null;

        const ensureMessage = function () {
            if (!message && cards.length) {
                message = document.createElement("div");
                message.className = "no-results";
                message.textContent = "没有找到匹配的影片";
                cards[cards.length - 1].parentElement.appendChild(message);
            }
            return message;
        };

        const filterCards = function () {
            const keyword = input ? input.value.trim().toLowerCase() : "";
            const typeValue = typeFilter ? typeFilter.value : "";
            const yearValue = yearFilter ? yearFilter.value : "";
            let visibleCount = 0;

            cards.forEach(function (card) {
                const text = [
                    card.dataset.title || "",
                    card.dataset.region || "",
                    card.dataset.type || "",
                    card.dataset.year || "",
                    card.dataset.tags || ""
                ].join(" ").toLowerCase();
                const matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
                const matchesType = !typeValue || (card.dataset.type || "").indexOf(typeValue) !== -1;
                const matchesYear = !yearValue || card.dataset.year === yearValue;
                const visible = matchesKeyword && matchesType && matchesYear;
                card.style.display = visible ? "" : "none";
                if (visible) {
                    visibleCount += 1;
                }
            });

            const empty = ensureMessage();
            if (empty) {
                empty.style.display = visibleCount === 0 ? "block" : "none";
            }
        };

        if (input) {
            input.addEventListener("input", filterCards);
        }

        if (typeFilter) {
            typeFilter.addEventListener("change", filterCards);
        }

        if (yearFilter) {
            yearFilter.addEventListener("change", filterCards);
        }

        if (reset) {
            reset.addEventListener("click", function () {
                if (input) {
                    input.value = "";
                }
                if (typeFilter) {
                    typeFilter.value = "";
                }
                if (yearFilter) {
                    yearFilter.value = "";
                }
                filterCards();
            });
        }
    });
})();
