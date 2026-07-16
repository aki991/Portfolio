/* ============================================================
   VENUS — cinematic video sekcija
   · video se pauzira van viewport-a (IntersectionObserver)
   · reduced-motion: bez autoplay-a — poster + play dugme
   · GSAP reveal natpisa kad sekcija uđe u viewport
   ============================================================ */
(function () {
  'use strict';

  var video = document.getElementById('cinemaVideo');
  if (!video) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var section = video.closest('.cinema');
  var btn = document.getElementById('cinemaPlay');

  video.muted = true; // atribut + property (browseri umeju da ignorišu sam atribut)

  function showBtn() { btn.classList.add('visible'); }
  function hideBtn() { btn.classList.remove('visible'); }

  if (reduceMotion) {
    /* bez automatskog puštanja: poster + play dugme */
    video.removeAttribute('autoplay');
    video.pause();
    showBtn();
  } else if ('IntersectionObserver' in window) {
    /* pauziraj kad sekcija nije u vidnom polju */
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var p = video.play();
          if (p && p.catch) p.catch(function () { showBtn(); }); // autoplay blokiran → ponudi dugme
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.15 });
    io.observe(section);
  }

  btn.addEventListener('click', function () {
    if (video.paused) {
      video.play();
      hideBtn();
      btn.setAttribute('aria-label', 'Pauziraj video');
    } else {
      video.pause();
      showBtn();
      btn.setAttribute('aria-label', 'Pusti video');
    }
  });

  /* ---------- GSAP reveal natpisa ---------- */
  if (window.gsap && window.ScrollTrigger && !reduceMotion) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.from('.cinema-title .cl', {
      y: 64, autoAlpha: 0, duration: 1.1, stagger: 0.06, ease: 'expo.out',
      scrollTrigger: { trigger: section, start: 'top 70%', once: true }
    });
    gsap.from('.cinema-tag', {
      y: 22, autoAlpha: 0, duration: 0.9, delay: 0.35, ease: 'expo.out',
      scrollTrigger: { trigger: section, start: 'top 70%', once: true }
    });
  }
})();
