/* ============================================================
   VENUS FX — Faza 0/1: sloj interakcija po uzoru na referencu
   · cursor spotlight na karticama (.cglow, --mx/--my)
   · magnetna dugmad (--tx/--ty)
   · GSAP hero ulazni tajmlajn (3D zub i njegova logika NETAKNUTI)
   Sve zaštićeno prefers-reduced-motion + hover/pointer proverom.
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger); // spremno za Fazu 2 (brojači, scan-reveal)
  }

  /* ---------- cursor spotlight: zlatni odsjaj prati pokazivač ---------- */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll('.card, .tile').forEach(function (el) {
      var glow = document.createElement('i');
      glow.className = 'cglow';
      glow.setAttribute('aria-hidden', 'true'); // čisto dekorativno
      el.appendChild(glow);

      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });

    /* ---------- magnetna dugmad: blago prate pokazivač ---------- */
    document.querySelectorAll('.btn').forEach(function (btn) {
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        btn.style.setProperty('--tx', (dx * 0.12).toFixed(1) + 'px');
        btn.style.setProperty('--ty', (dy * 0.18).toFixed(1) + 'px');
      });
      btn.addEventListener('pointerleave', function () {
        btn.style.setProperty('--tx', '0px');
        btn.style.setProperty('--ty', '0px');
      });
    });
  }

  /* ---------- hero: ulazni tajmlajn (samo početna) ---------- */
  var hero = document.querySelector('.hero');
  if (!hero || !window.gsap || reduceMotion) return;

  // h1 → reči u .w spanove (tekst ostaje netaknut za čitače ekrana;
  // <br> i <em> se čuvaju — em postaje sadržaj svog .w spana)
  var h1 = hero.querySelector('h1');
  if (h1 && !h1.querySelector('.w')) {
    var frag = document.createDocumentFragment();
    Array.prototype.slice.call(h1.childNodes).forEach(function (node) {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          var s = document.createElement('span');
          s.className = 'w';
          s.textContent = part;
          frag.appendChild(s);
        });
      } else if (node.nodeName === 'BR') {
        frag.appendChild(document.createElement('br'));
      } else {
        var w = document.createElement('span');
        w.className = 'w';
        w.appendChild(node.cloneNode(true));
        frag.appendChild(w);
      }
    });
    h1.textContent = '';
    h1.appendChild(frag);
  }

  var tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.from(hero.querySelector('.eyebrow'), { y: 26, autoAlpha: 0, duration: 0.8 }, 0.1)
    .from(hero.querySelectorAll('h1 .w'), { y: 72, autoAlpha: 0, duration: 1.1, stagger: 0.09 }, '-=0.5')
    .from(hero.querySelector('.lede'), { y: 24, autoAlpha: 0, duration: 0.8 }, '-=0.75')
    .from(hero.querySelector('.hero-actions'), { y: 20, autoAlpha: 0, duration: 0.7 }, '-=0.6')
    .from('#stage', { autoAlpha: 0, x: 44, duration: 1.5 }, 0.35);
})();
