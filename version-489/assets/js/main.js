(function() {
  var toggle = document.querySelector("[data-nav-toggle]");
  var menu = document.querySelector("[data-mobile-nav]");
  if (toggle && menu) {
    toggle.addEventListener("click", function() {
      menu.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var next = hero.querySelector("[data-hero-next]");
    var prev = hero.querySelector("[data-hero-prev]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function() {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (next) {
      next.addEventListener("click", function() {
        show(current + 1);
        start();
      });
    }

    if (prev) {
      prev.addEventListener("click", function() {
        show(current - 1);
        start();
      });
    }

    dots.forEach(function(dot, i) {
      dot.addEventListener("click", function() {
        show(i);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  document.querySelectorAll("[data-filter-area]").forEach(function(area) {
    var search = area.querySelector("[data-search-input]");
    var type = area.querySelector("[data-filter-type]");
    var year = area.querySelector("[data-filter-year]");
    var scope = area.parentElement || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-card]"));

    function matchText(card, value) {
      if (!value) {
        return true;
      }
      var source = [
        card.getAttribute("data-title") || "",
        card.getAttribute("data-region") || "",
        card.getAttribute("data-type") || "",
        card.getAttribute("data-year") || "",
        card.getAttribute("data-genre") || ""
      ].join(" ").toLowerCase();
      return source.indexOf(value.toLowerCase()) !== -1;
    }

    function filter() {
      var keyword = search ? search.value.trim() : "";
      var typeValue = type ? type.value : "";
      var yearValue = year ? year.value : "";
      cards.forEach(function(card) {
        var ok = matchText(card, keyword);
        if (typeValue && card.getAttribute("data-type") !== typeValue) {
          ok = false;
        }
        if (yearValue && card.getAttribute("data-year") !== yearValue) {
          ok = false;
        }
        card.style.display = ok ? "" : "none";
      });
    }

    [search, type, year].forEach(function(node) {
      if (node) {
        node.addEventListener("input", filter);
        node.addEventListener("change", filter);
      }
    });
  });
})();
