(function () {
  var menuButton = document.querySelector('.menu-button');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  if (slides.length) {
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('.filter-search'));
  var chips = Array.prototype.slice.call(document.querySelectorAll('.filter-chip'));

  function applyFilters(scope) {
    var root = scope || document;
    var input = root.querySelector('.filter-search') || document.querySelector('.filter-search');
    var keyword = input ? input.value.trim().toLowerCase() : '';
    var activeChip = root.querySelector('.filter-chip.active') || document.querySelector('.filter-chip.active');
    var filter = activeChip ? activeChip.getAttribute('data-filter') : 'all';
    var cards = Array.prototype.slice.call(root.querySelectorAll('.movie-card'));
    var matched = 0;

    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-genre') || '',
        card.getAttribute('data-region') || '',
        card.getAttribute('data-year') || '',
        card.getAttribute('data-tags') || ''
      ].join(' ').toLowerCase();
      var chipOk = filter === 'all' || haystack.indexOf(filter.toLowerCase()) !== -1;
      var keywordOk = !keyword || haystack.indexOf(keyword) !== -1;
      var visible = chipOk && keywordOk;
      card.style.display = visible ? '' : 'none';
      if (visible) {
        matched += 1;
      }
    });

    var empty = root.querySelector('.no-results') || document.querySelector('.no-results');
    if (empty) {
      empty.classList.toggle('show', cards.length > 0 && matched === 0);
    }
  }

  searchInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      applyFilters(input.closest('.filter-scope') || document);
    });
  });

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var scope = chip.closest('.filter-scope') || document;
      Array.prototype.slice.call(scope.querySelectorAll('.filter-chip')).forEach(function (item) {
        item.classList.remove('active');
      });
      chip.classList.add('active');
      applyFilters(scope);
    });
  });

  window.initMoviePlayer = function (options) {
    var video = document.getElementById(options.videoId);
    var button = document.getElementById(options.buttonId);
    var overlay = document.getElementById(options.overlayId);
    var source = options.source;
    var started = false;
    var hlsInstance = null;

    if (!video || !source) {
      return;
    }

    function attachSource() {
      if (started) {
        return;
      }

      started = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function startPlayback(event) {
      if (event) {
        event.preventDefault();
      }

      attachSource();

      if (overlay) {
        overlay.classList.add('hidden');
      }

      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', startPlayback);
    }

    if (overlay) {
      overlay.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
      if (!started) {
        startPlayback();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('hidden');
      }
    });

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
