(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var navToggle = document.querySelector("[data-nav-toggle]");
    var navLinks = document.querySelector("[data-nav-links]");

    if (navToggle && navLinks) {
      navToggle.addEventListener("click", function () {
        navLinks.classList.toggle("is-open");
      });
    }

    initHero();
    initSearch();
    initPlayer();
  });

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initSearch() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-search-scope]"));

    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-search-input]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      var empty = scope.querySelector("[data-empty-state]");

      if (!input || !cards.length) {
        return;
      }

      function filter() {
        var keyword = input.value.trim().toLowerCase();
        var visibleCount = 0;

        cards.forEach(function (card) {
          var text = card.getAttribute("data-search") || "";
          var matched = !keyword || text.indexOf(keyword) !== -1;
          card.style.display = matched ? "" : "none";
          if (matched) {
            visibleCount += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visibleCount === 0);
        }
      }

      input.addEventListener("input", filter);

      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (query) {
        input.value = query;
        filter();
      }
    });
  }

  function initPlayer() {
    var player = document.querySelector("[data-player]");
    if (!player) {
      return;
    }

    var video = player.querySelector("video");
    var button = player.querySelector("[data-play-button]");
    var stream = player.getAttribute("data-stream");
    var hlsInstance = null;
    var loaded = false;

    if (!video || !stream) {
      return;
    }

    function attachStream() {
      if (loaded) {
        return Promise.resolve();
      }

      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        return new Promise(function (resolve) {
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            resolve();
          });
        });
      }

      video.src = stream;
      return Promise.resolve();
    }

    function play() {
      attachStream().then(function () {
        if (button) {
          button.classList.add("is-hidden");
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      });
    }

    if (button) {
      button.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener("play", function () {
      if (button) {
        button.classList.add("is-hidden");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
})();
