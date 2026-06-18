(function() {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function() {
      menu.classList.toggle("is-open");
      button.textContent = menu.classList.contains("is-open") ? "×" : "☰";
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    if (!slides.length) {
      return;
    }
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, idx) {
        slide.classList.toggle("is-active", idx === current);
      });
      dots.forEach(function(dot, idx) {
        dot.classList.toggle("is-active", idx === current);
      });
    }

    function next() {
      show(current + 1);
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(next, 5000);
    }

    var prevButton = document.querySelector("[data-hero-prev]");
    var nextButton = document.querySelector("[data-hero-next]");
    if (prevButton) {
      prevButton.addEventListener("click", function() {
        show(current - 1);
        restart();
      });
    }
    if (nextButton) {
      nextButton.addEventListener("click", function() {
        next();
        restart();
      });
    }
    dots.forEach(function(dot) {
      dot.addEventListener("click", function() {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });
    restart();
  }

  function setupSearch() {
    var input = document.querySelector("[data-site-search]");
    if (!input) {
      return;
    }
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
    input.addEventListener("input", function() {
      var query = input.value.trim().toLowerCase();
      cards.forEach(function(card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();
        card.classList.toggle("search-hidden", query && haystack.indexOf(query) === -1);
      });
    });
  }

  ready(function() {
    setupMenu();
    setupHero();
    setupSearch();
  });

  window.initDetailPlayer = function(source) {
    var video = document.querySelector("[data-player-video]");
    var starter = document.querySelector("[data-player-start]");
    var hlsInstance = null;
    var loaded = false;

    if (!video || !starter || !source) {
      return;
    }

    function load() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          maxBufferLength: 45,
          backBufferLength: 30
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
      video.controls = true;
    }

    function play() {
      load();
      starter.classList.add("is-hidden");
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function() {
          starter.classList.remove("is-hidden");
        });
      }
    }

    starter.addEventListener("click", play);
    video.addEventListener("click", function() {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });
    video.addEventListener("ended", function() {
      starter.classList.remove("is-hidden");
    });
    window.addEventListener("beforeunload", function() {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
