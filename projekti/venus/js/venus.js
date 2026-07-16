/* ============================================================
   VENUS — deljena interakcija: nav, scroll reveal, kintsugi,
   galerija (filteri + lightbox), forma za zakazivanje
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- sticky nav: promena na scroll ---------- */
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 24);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- mobilni meni (hamburger + focus trap) ---------- */
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  var lastFocused = null;

  function menuOpen() { return toggle && toggle.getAttribute('aria-expanded') === 'true'; }

  function setMenu(open) {
    if (!toggle || !links) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Zatvori meni' : 'Otvori meni');
    links.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      lastFocused = document.activeElement;
      var first = links.querySelector('a');
      if (first) first.focus();
    } else if (lastFocused) {
      lastFocused.focus();
    }
  }

  if (toggle && links) {
    toggle.addEventListener('click', function () { setMenu(!menuOpen()); });

    // zatvori pri kliku na link
    links.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });

    document.addEventListener('keydown', function (e) {
      if (!menuOpen()) return;
      if (e.key === 'Escape') { setMenu(false); return; }
      if (e.key === 'Tab') {
        // focus trap unutar otvorenog menija
        var focusables = [toggle].concat(Array.prototype.slice.call(links.querySelectorAll('a')));
        var i = focusables.indexOf(document.activeElement);
        if (e.shiftKey && (i === 0 || i === -1)) {
          e.preventDefault(); focusables[focusables.length - 1].focus();
        } else if (!e.shiftKey && i === focusables.length - 1) {
          e.preventDefault(); focusables[0].focus();
        }
      }
    });
  }

  /* ---------- scroll reveal ---------- */
  var observed = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    observed.forEach(function (el) { io.observe(el); });
  } else {
    observed.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ---------- galerija: filteri ---------- */
  var filterBtns = document.querySelectorAll('.filter-btn');
  var tiles = document.querySelectorAll('.masonry .tile');

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
      btn.setAttribute('aria-pressed', 'true');
      var cat = btn.dataset.filter;
      tiles.forEach(function (tile) {
        var show = cat === 'sve' || tile.dataset.cat === cat;
        tile.style.display = show ? '' : 'none';
      });
    });
  });

  /* ---------- galerija: lightbox ---------- */
  var lightbox = document.getElementById('lightbox');
  if (lightbox && tiles.length) {
    var lbStage = lightbox.querySelector('.lb-stage');
    var lbCat = lightbox.querySelector('.lb-cat');
    var lbText = lightbox.querySelector('.lb-text');
    var lbCounter = lightbox.querySelector('.lb-counter');
    var lbClose = lightbox.querySelector('.lb-close');
    var lbPrev = lightbox.querySelector('.lb-prev');
    var lbNext = lightbox.querySelector('.lb-next');
    var current = -1;
    var lbLastFocused = null;

    function visibleTiles() {
      return Array.prototype.filter.call(tiles, function (t) { return t.style.display !== 'none'; });
    }

    function renderLightbox(index) {
      var list = visibleTiles();
      if (!list.length) return;
      current = (index + list.length) % list.length;
      var tile = list[current];
      var visual = tile.querySelector('img, .ph');
      lbStage.innerHTML = '';
      if (visual) {
        var clone = visual.cloneNode(true);
        clone.removeAttribute('loading'); // u lightbox-u odmah učitaj
        lbStage.appendChild(clone);
      }
      lbCat.textContent = tile.dataset.catLabel || '';
      lbText.textContent = tile.dataset.caption || '';
      lbCounter.textContent = (current + 1) + ' / ' + list.length;
    }

    function openLightbox(index) {
      lbLastFocused = document.activeElement;
      renderLightbox(index);
      lightbox.hidden = false;
      requestAnimationFrame(function () { lightbox.classList.add('open'); });
      document.body.style.overflow = 'hidden';
      lbClose.focus();
    }

    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
      window.setTimeout(function () { lightbox.hidden = true; }, reduceMotion ? 0 : 300);
      if (lbLastFocused) lbLastFocused.focus();
    }

    tiles.forEach(function (tile) {
      tile.addEventListener('click', function () {
        var list = visibleTiles();
        openLightbox(list.indexOf(tile));
      });
    });

    lbClose.addEventListener('click', closeLightbox);
    lbPrev.addEventListener('click', function () { renderLightbox(current - 1); });
    lbNext.addEventListener('click', function () { renderLightbox(current + 1); });
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', function (e) {
      if (lightbox.hidden) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') renderLightbox(current - 1);
      if (e.key === 'ArrowRight') renderLightbox(current + 1);
      if (e.key === 'Tab') {
        // focus trap u lightbox-u
        var focusables = [lbClose, lbPrev, lbNext];
        var i = focusables.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); focusables[focusables.length - 1].focus(); }
        else if (!e.shiftKey && i === focusables.length - 1) { e.preventDefault(); focusables[0].focus(); }
      }
    });
  }

  /* ---------- forma za zakazivanje ---------- */
  var form = document.getElementById('bookingForm');
  if (form) {
    var successBox = document.getElementById('formSuccess');
    var liveRegion = document.getElementById('formLive');

    var validators = {
      ime: function (v) {
        if (!v.trim()) return 'Unesite ime i prezime.';
        if (v.trim().length < 3) return 'Ime je prekratko — unesite puno ime i prezime.';
        return '';
      },
      telefon: function (v) {
        var digits = v.replace(/\D/g, '');
        if (!v.trim()) return 'Unesite broj telefona kako bismo potvrdili termin.';
        if (digits.length < 8) return 'Broj telefona je nepotpun — proverite cifre.';
        return '';
      },
      email: function (v) {
        if (!v.trim()) return 'Unesite email adresu.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) return 'Email adresa nije ispravna — proverite format (ime@domen.rs).';
        return '';
      },
      usluga: function (v) {
        if (!v) return 'Izaberite uslugu koja vas zanima.';
        return '';
      },
      datum: function (v) {
        if (!v) return 'Izaberite željeni datum.';
        var d = new Date(v + 'T00:00:00');
        var today = new Date(); today.setHours(0, 0, 0, 0);
        if (d < today) return 'Datum je u prošlosti — izaberite današnji ili kasniji.';
        return '';
      },
      vreme: function (v) {
        if (!v) return 'Izaberite deo dana koji vam odgovara.';
        return '';
      }
    };

    function validateField(input) {
      var name = input.name;
      if (!validators[name]) return true;
      var msg = validators[name](input.value);
      var field = input.closest('.field');
      var errEl = field.querySelector('.field-error');
      field.classList.toggle('invalid', !!msg);
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (errEl) errEl.textContent = msg;
      return !msg;
    }

    // validacija na blur (ne na svaki karakter)
    form.querySelectorAll('input, select, textarea').forEach(function (input) {
      input.addEventListener('blur', function () {
        if (input.value || input.closest('.field').classList.contains('invalid')) validateField(input);
      });
      input.addEventListener('input', function () {
        // skloni grešku čim je polje ispravljeno
        if (input.closest('.field').classList.contains('invalid')) validateField(input);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var inputs = form.querySelectorAll('input, select, textarea');
      var firstInvalid = null;
      inputs.forEach(function (input) {
        if (!validateField(input) && !firstInvalid) firstInvalid = input;
      });
      if (firstInvalid) {
        firstInvalid.focus();
        if (liveRegion) liveRegion.textContent = 'Forma ima greške — proverite označena polja.';
        return;
      }
      // simulacija slanja (nema backend-a)
      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Slanje…';
      window.setTimeout(function () {
        form.style.display = 'none';
        if (successBox) {
          successBox.classList.add('visible');
          successBox.querySelector('h2').focus();
        }
        if (liveRegion) liveRegion.textContent = 'Zahtev za termin je uspešno poslat.';
      }, reduceMotion ? 0 : 700);
    });

    // min datum = danas
    var dateInput = form.querySelector('input[type="date"]');
    if (dateInput) {
      var now = new Date();
      var iso = now.getFullYear() + '-' +
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0');
      dateInput.min = iso;
    }
  }
})();
