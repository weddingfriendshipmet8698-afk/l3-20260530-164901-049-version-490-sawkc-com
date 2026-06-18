
(function () {
  var body = document.body;
  var navToggle = document.querySelector('.nav-toggle');
  var mobileMenu = document.querySelector('.mobile-menu');

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', function () {
      var opened = mobileMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
      body.classList.toggle('no-scroll', opened);
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var prev = document.querySelector('.hero-control.prev');
  var next = document.querySelector('.hero-control.next');
  var current = 0;
  var timer = null;

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

  function startHero() {
    if (slides.length < 2) {
      return;
    }
    window.clearInterval(timer);
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-slide-to')) || 0);
      startHero();
    });
  });

  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(current - 1);
      startHero();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(current + 1);
      startHero();
    });
  }

  showSlide(0);
  startHero();

  var searchInput = document.querySelector('.site-search');
  var grids = Array.prototype.slice.call(document.querySelectorAll('.searchable-grid'));

  function applySearch() {
    if (!searchInput || !grids.length) {
      return;
    }
    var query = searchInput.value.trim().toLowerCase();
    grids.forEach(function (grid) {
      var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card, .ranking-card'));
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-tags') || '',
          card.getAttribute('data-year') || '',
          card.textContent || ''
        ].join(' ').toLowerCase();
        var matched = !query || haystack.indexOf(query) !== -1;
        card.classList.toggle('is-filtered-out', !matched);
        if (matched) {
          visible += 1;
        }
      });
      var empty = grid.querySelector('.empty-state');
      if (!empty) {
        empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.textContent = '暂无匹配内容';
        grid.appendChild(empty);
      }
      empty.style.display = visible ? 'none' : 'block';
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', applySearch);
  }
})();
