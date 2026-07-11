// Daaneswaran — Portfolio
// Scroll progress rail (timecode), reveal-on-scroll, parallax layers,
// and 3D tilt interaction for the project cards.

(function () {
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     Timecode progress rail
  --------------------------------------------------------- */
  var fill = document.getElementById('reelFill');
  var tc = document.getElementById('headerTC');

  function pad(n) { return n.toString().padStart(2, '0'); }

  function formatTimecode(fraction) {
    var totalFrames = Math.floor(fraction * 24 * 60 * 10); // ~10 min "reel"
    var ff = totalFrames % 24;
    var totalSeconds = Math.floor(totalFrames / 24);
    var ss = totalSeconds % 60;
    var mm = Math.floor(totalSeconds / 60) % 60;
    var hh = Math.floor(totalSeconds / 3600);
    return pad(hh) + ':' + pad(mm) + ':' + pad(ss) + ':' + pad(ff);
  }

  var scrollHandlers = [];
  var ticking = false;

  function onScrollRaf() {
    var doc = document.documentElement;
    var scrollTop = doc.scrollTop || document.body.scrollTop;
    var scrollHeight = doc.scrollHeight - doc.clientHeight;
    var fraction = scrollHeight > 0 ? scrollTop / scrollHeight : 0;

    if (fill) fill.style.width = (fraction * 100) + '%';
    if (tc) tc.textContent = formatTimecode(fraction);

    for (var i = 0; i < scrollHandlers.length; i++) scrollHandlers[i]();
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(onScrollRaf);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScrollRaf();

  /* ---------------------------------------------------------
     Reveal-on-scroll (fade + rise) for standard blocks
  --------------------------------------------------------- */
  var revealSelectors = [
    '.split__text', '.split__media',
    '.education__content .timeline li',
    '.experience__title', '.exp-item',
    '.projects__head',
    '.project__intro-text', '.gallery-label', '.gallery-grid img',
    '.masonry img',
    '.outro__content'
  ];

  var revealEls = Array.prototype.slice.call(document.querySelectorAll(revealSelectors.join(',')));
  revealEls.forEach(function (el, i) {
    el.classList.add('reveal');
    el.style.transitionDelay = (Math.min(i % 6, 5) * 60) + 'ms';
  });

  /* Reveal-on-scroll (scale + fade) for project cards */
  var scaleEls = Array.prototype.slice.call(document.querySelectorAll('.reveal-scale'));
  scaleEls.forEach(function (el, i) {
    el.style.transitionDelay = (i * 90) + 'ms';
  });

  var allRevealEls = revealEls.concat(scaleEls);

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );
    allRevealEls.forEach(function (el) { io.observe(el); });
  } else {
    allRevealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------------------------------------------------------
     Parallax layers
  --------------------------------------------------------- */
  if (!prefersReducedMotion) {
    var parallaxEls = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));

    if (parallaxEls.length) {
      var applyParallax = function () {
        var viewportH = window.innerHeight;
        var viewportCenter = viewportH / 2;

        parallaxEls.forEach(function (el) {
          var rect = el.getBoundingClientRect();
          // Only bother computing for elements anywhere near the viewport.
          if (rect.bottom < -200 || rect.top > viewportH + 200) return;
          var elCenter = rect.top + rect.height / 2;
          var distance = viewportCenter - elCenter;
          var factor = parseFloat(el.getAttribute('data-parallax')) || 0.1;
          var y = distance * factor;
          el.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0)';
        });
      };

      scrollHandlers.push(applyParallax);
      applyParallax();
    }
  }

  /* ---------------------------------------------------------
     3D tilt interaction for project cards
  --------------------------------------------------------- */
  if (!prefersReducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('.project-card'));

    cards.forEach(function (card) {
      var surface = card.querySelector('.project-card__surface');
      if (!surface) return;
      var raf = null;

      function handleMove(e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width;  // 0..1
        var y = (e.clientY - rect.top) / rect.height;  // 0..1
        var rotateY = (x - 0.5) * 14;  // left/right tilt
        var rotateX = (0.5 - y) * 14;  // up/down tilt

        if (raf) window.cancelAnimationFrame(raf);
        raf = window.requestAnimationFrame(function () {
          surface.style.transform =
            'scale(1.045) perspective(900px) rotateX(' + rotateX.toFixed(2) + 'deg) rotateY(' + rotateY.toFixed(2) + 'deg)';
        });
      }

      function reset() {
        if (raf) window.cancelAnimationFrame(raf);
        surface.style.transform = '';
      }

      card.addEventListener('mousemove', handleMove);
      card.addEventListener('mouseleave', reset);
      card.addEventListener('blur', reset, true);
    });
  }
})();
