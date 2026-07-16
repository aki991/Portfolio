// ============================================================
// AM Digital — interakcije: hamburger meni + kontakt forma
// ============================================================
(function () {
  "use strict";

  // ---------- Hamburger meni (mobilni) ----------
  var hamburger = document.getElementById("hamburger");
  var mobileMenu = document.getElementById("mobile-menu");

  function closeMenu() {
    hamburger.setAttribute("aria-expanded", "false");
    hamburger.setAttribute("aria-label", "Otvori meni");
    mobileMenu.classList.remove("open");
    mobileMenu.hidden = true;
  }

  function openMenu() {
    hamburger.setAttribute("aria-expanded", "true");
    hamburger.setAttribute("aria-label", "Zatvori meni");
    mobileMenu.hidden = false;
    mobileMenu.classList.add("open");
  }

  hamburger.addEventListener("click", function () {
    var expanded = hamburger.getAttribute("aria-expanded") === "true";
    if (expanded) { closeMenu(); } else { openMenu(); }
  });

  // zatvori meni posle klika na link
  mobileMenu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  // zatvori meni na Escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && hamburger.getAttribute("aria-expanded") === "true") {
      closeMenu();
      hamburger.focus();
    }
  });

  // ---------- Kontakt forma → Formspree (slanje fetch-om, ostaje na strani) ----------
  var form = document.getElementById("contact-form");
  var success = document.getElementById("form-success");
  var errorBox = document.getElementById("form-error");
  var honeypot = document.getElementById("f-website");

  var fields = [
    {
      input: document.getElementById("f-name"),
      error: document.getElementById("err-name"),
      valid: function (v) { return v.trim().length > 0; }
    },
    {
      input: document.getElementById("f-email"),
      error: document.getElementById("err-email"),
      valid: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); }
    },
    {
      input: document.getElementById("f-message"),
      error: document.getElementById("err-message"),
      valid: function (v) { return v.trim().length > 0; }
    }
  ];

  function validateField(f) {
    var ok = f.valid(f.input.value);
    f.error.hidden = ok;
    f.input.setAttribute("aria-invalid", ok ? "false" : "true");
    f.input.closest(".field").classList.toggle("invalid", !ok);
    return ok;
  }

  // validiraj polje čim korisnik kuca (posle prvog pokušaja slanja)
  var triedSubmit = false;
  fields.forEach(function (f) {
    f.input.addEventListener("input", function () {
      if (triedSubmit) { validateField(f); }
    });
  });

  function setSending(sending) {
    var btn = form.querySelector(".btn-submit");
    btn.disabled = sending;
    btn.textContent = sending ? "Šalje se…" : "Pošalji poruku";
  }

  function clearErrors() {
    fields.forEach(function (f) {
      f.error.hidden = true;
      f.input.setAttribute("aria-invalid", "false");
      f.input.closest(".field").classList.remove("invalid");
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // honeypot: ako je skriveno polje popunjeno — to je bot, ne šaljemo
    if (honeypot && honeypot.value.trim() !== "") { return; }

    triedSubmit = true;
    success.hidden = true;
    errorBox.hidden = true;

    var allValid = true;
    fields.forEach(function (f) {
      if (!validateField(f)) { allValid = false; }
    });
    if (!allValid) {
      var firstInvalid = fields.find(function (f) { return f.error.hidden === false; });
      if (firstInvalid) { firstInvalid.input.focus(); }
      return;
    }

    setSending(true);

    fetch(form.action, {
      method: "POST",
      headers: { "Accept": "application/json" },
      body: new FormData(form)
    }).then(function (res) {
      if (!res.ok) { return Promise.reject(); }
      form.reset();
      triedSubmit = false;
      clearErrors();
      setSending(false);
      success.hidden = false;
      success.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }).catch(function () {
      setSending(false);
      errorBox.hidden = false;
      errorBox.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
  });

  // ---------- 3D tilt na portfolio karticama ----------
  // Radi samo na uređajima sa mišem i uz poštovanje prefers-reduced-motion.
  var canHover = window.matchMedia("(hover: hover)").matches;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (canHover && !reduceMotion) {
    var MAX_TILT = 7; // maksimalni nagib u stepenima (±7°)

    document.querySelectorAll("#radovi .tile").forEach(function (tile) {
      // sloj za svetlosni odsjaj (prati poziciju miša)
      var glare = document.createElement("span");
      glare.className = "tile-glare";
      glare.setAttribute("aria-hidden", "true");
      tile.appendChild(glare);

      // meka tranzicija za nagib; box-shadow zadržava svoj prelaz
      tile.style.transition = "transform .15s ease-out, box-shadow .25s ease";

      tile.addEventListener("mousemove", function (e) {
        var r = tile.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;   // 0..1 po širini
        var py = (e.clientY - r.top) / r.height;   // 0..1 po visini

        var rotY = (px - 0.5) * 2 * MAX_TILT;      // nagib levo/desno
        var rotX = (0.5 - py) * 2 * MAX_TILT;      // nagib gore/dole

        tile.style.transform =
          "perspective(900px) rotateX(" + rotX.toFixed(2) + "deg) rotateY(" +
          rotY.toFixed(2) + "deg) scale(1.02)";

        glare.style.background =
          "radial-gradient(circle at " + (px * 100).toFixed(1) + "% " +
          (py * 100).toFixed(1) + "%, rgba(79,224,245,.15), transparent 55%)";
        glare.style.opacity = "1";
      });

      tile.addEventListener("mouseleave", function () {
        tile.style.transform = "";   // glatko nazad u ravan položaj
        glare.style.opacity = "0";
      });
    });
  }

  // ---------- Dekorativna circuit mreža u pozadini ----------
  // Iz donjeg dela hero slike (tačka dodira robota) izlazi snop vodova koji
  // se granaju kroz bočne "kanale" pored sadržaja i završavaju svetlećim
  // čvorom pored naslova svake sekcije. Putanje se računaju iz izmerenog
  // layouta, pa se mreža ponovo gradi na resize. Na ≤900px se ne gradi —
  // tada ostaju postojeći centralni konektori.
  var canvasEl = document.querySelector(".canvas");
  var SVG_NS = "http://www.w3.org/2000/svg";
  var circuitSvg = null;
  var circuitH = 0;
  var circuitHeroB = 0;   // donja ivica hero sekcije u SVG koordinatama

  function svgNode(tag, attrs) {
    var el = document.createElementNS(SVG_NS, tag);
    for (var k in attrs) { el.setAttribute(k, attrs[k]); }
    return el;
  }

  // polilinija -> path sa zaobljenim skretanjima (Q krive u temenima)
  function roundedPath(pts, radius) {
    var d = "M" + pts[0][0].toFixed(1) + " " + pts[0][1].toFixed(1);
    for (var i = 1; i < pts.length - 1; i++) {
      var p0 = pts[i - 1], p1 = pts[i], p2 = pts[i + 1];
      var v1x = p1[0] - p0[0], v1y = p1[1] - p0[1];
      var v2x = p2[0] - p1[0], v2y = p2[1] - p1[1];
      var l1 = Math.hypot(v1x, v1y), l2 = Math.hypot(v2x, v2y);
      var r = Math.min(radius, l1 / 2, l2 / 2);
      var ax = p1[0] - (v1x / l1) * r, ay = p1[1] - (v1y / l1) * r;
      var bx = p1[0] + (v2x / l2) * r, by = p1[1] + (v2y / l2) * r;
      d += " L" + ax.toFixed(1) + " " + ay.toFixed(1) +
           " Q" + p1[0].toFixed(1) + " " + p1[1].toFixed(1) +
           " " + bx.toFixed(1) + " " + by.toFixed(1);
    }
    var last = pts[pts.length - 1];
    return d + " L" + last[0].toFixed(1) + " " + last[1].toFixed(1);
  }

  function buildCircuit() {
    if (circuitSvg) { circuitSvg.remove(); circuitSvg = null; }
    canvasEl.classList.remove("has-circuit");
    if (window.innerWidth <= 900) { return; }

    var cr = canvasEl.getBoundingClientRect();
    var W = Math.round(cr.width);
    var H = Math.round(cr.height);
    var secs = canvasEl.querySelectorAll(":scope > section");
    var cons = canvasEl.querySelectorAll(":scope > .connector");
    if (secs.length < 6 || cons.length < 5) { return; }

    function rel(node) {
      var r = node.getBoundingClientRect();
      return {
        l: r.left - cr.left, r: r.right - cr.left,
        t: r.top - cr.top, b: r.bottom - cr.top,
        cy: (r.top + r.bottom) / 2 - cr.top
      };
    }

    var hero = rel(secs[0]);
    circuitHeroB = hero.b;
    var head1 = rel(secs[1].querySelector(".sec-head"));
    var h2u = rel(secs[1].querySelector("h2"));    // Usluge
    var h2c = rel(secs[2].querySelector("h2"));    // Studija slučaja
    var h2r = rel(secs[3].querySelector("h2"));    // Radovi
    var h2o = rel(secs[4].querySelector("h2"));    // Publika (O nama)
    var h2k = rel(secs[5].querySelector("h2"));    // Kontakt
    var panel = rel(secs[5].querySelector(".contact-panel"));

    // bočni kanali: u praznini pored kolone sadržaja
    var gL = Math.max(24, head1.l - 90);
    var gR = Math.min(W - 24, head1.r + 90);
    var ox = Math.round(W * 0.62);                 // x tačke dodira na slici
    var oy = hero.b - 140;                         // izlaz iz donjeg dela slike
    var g1y = rel(cons[0]).cy;                     // prvi gap (hero → usluge)
    var splitY = g1y - 18;                         // tačka račvanja snopa

    var svg = svgNode("svg", {
      "class": "circuit-svg",
      "viewBox": "0 0 " + W + " " + H,
      "aria-hidden": "true"
    });

    function addWire(d, cls, width) {
      svg.appendChild(svgNode("path", { d: d, "class": "wire " + cls, "stroke-width": width }));
    }
    function addNode(x, y, r, cls) {
      svg.appendChild(svgNode("circle", { cx: x.toFixed(1), cy: y.toFixed(1), r: r, "class": cls }));
    }

    // snop iz hero slike do tačke račvanja
    addWire("M" + ox + " " + oy.toFixed(1) + " L" + ox + " " + splitY.toFixed(1), "wire-amber", 1.6);
    addNode(ox, oy, 2.5, "circuit-junction amber");

    // dva glavna voda: levi (usluge, studija, publika) i desni (radovi, kontakt)
    var dLeft = roundedPath([
      [ox, splitY], [ox - 26, g1y], [gL, g1y],
      [gL, h2o.cy - 18], [gL + 18, h2o.cy], [h2o.l - 18, h2o.cy]
    ], 10);
    var dRight = roundedPath([
      [ox, splitY], [ox + 26, g1y], [gR, g1y],
      [gR, h2k.cy - 18], [gR - 18, h2k.cy], [panel.r + 16, h2k.cy]
    ], 10);
    addWire(dLeft, "wire-amber", 1.6);
    addWire(dRight, "wire-amber", 1.6);

    // svetleći impuls koji putuje duž glavnih vodova
    [dLeft, dRight].forEach(function (d, i) {
      var p = svgNode("path", { d: d, "class": "wire-pulse", "stroke-width": 2, "pathLength": 1000 });
      p.style.animationDelay = (i * 3.5) + "s";
      svg.appendChild(p);
    });

    // čvor na račvanju (zamena za prvi konektor)
    addNode(ox, splitY, 5, "circuit-node amber pulse");

    // horizontalne prečke kroz gapove između sekcija (zamena za konektore),
    // boje čvorova prate originalni redosled (cy, amber, cy, amber)
    var rungColor = ["cyan", "amber", "cyan", "amber"];
    for (var i = 1; i < 5; i++) {
      var ry = rel(cons[i]).cy;
      addWire("M" + gL + " " + ry.toFixed(1) + " L" + gR + " " + ry.toFixed(1), "wire-cyan", 1.1);
      addNode(W / 2, ry, 5, "circuit-node " + rungColor[i - 1] + " pulse");
      addNode(gL, ry, 2.2, "circuit-junction cyan");
      addNode(gR, ry, 2.2, "circuit-junction cyan");
    }

    // grane od vodova do naslova sekcija (45° prilaz + čvor pored naslova)
    function branchLeft(h2, color) {
      addWire(roundedPath([[gL, h2.cy - 16], [gL + 16, h2.cy], [h2.l - 18, h2.cy]], 8), "wire-amber", 1.4);
      addNode(gL, h2.cy - 16, 2.2, "circuit-junction amber");
      addNode(h2.l - 18, h2.cy, 4, "circuit-node " + color + " pulse");
    }
    function branchRight(h2, nodeX, color) {
      addWire(roundedPath([[gR, h2.cy - 16], [gR - 16, h2.cy], [nodeX, h2.cy]], 8), "wire-amber", 1.4);
      addNode(gR, h2.cy - 16, 2.2, "circuit-junction amber");
      addNode(nodeX, h2.cy, 4, "circuit-node " + color + " pulse");
    }
    branchLeft(h2u, "cyan");
    branchLeft(h2c, "amber");                      // amber kao eyebrow te sekcije
    branchRight(h2r, h2r.r + 18, "cyan");
    addNode(h2o.l - 18, h2o.cy, 4, "circuit-node cyan pulse");   // kraj levog voda
    addNode(panel.r + 16, h2k.cy, 4, "circuit-node cyan pulse"); // kraj desnog voda

    // sitni dekorativni cyan ogranci
    var s1 = (h2u.cy + h2c.cy) / 2;
    addWire(roundedPath([[gL, s1], [gL - 14, s1 + 14], [gL - 14, s1 + 46]], 8), "wire-cyan", 1);
    addNode(gL - 14, s1 + 46, 2, "circuit-junction cyan");
    var s2 = (h2r.cy + rel(cons[4]).cy) / 2;
    addWire(roundedPath([[gR, s2], [gR + 14, s2 + 14], [gR + 14, s2 + 46]], 8), "wire-cyan", 1);
    addNode(gR + 14, s2 + 46, 2, "circuit-junction cyan");

    canvasEl.insertBefore(svg, canvasEl.firstChild);
    canvasEl.classList.add("has-circuit");
    circuitSvg = svg;
    circuitH = H;
  }

  var circuitTimer = null;
  function scheduleCircuit() {
    clearTimeout(circuitTimer);
    circuitTimer = setTimeout(buildCircuit, 150);
  }

  if (canvasEl) {
    buildCircuit();
    window.addEventListener("resize", scheduleCircuit);
    window.addEventListener("load", buildCircuit);
    // ako se visina sadržaja promeni (npr. učitavanje slika), preračunaj mrežu
    if (window.ResizeObserver) {
      new ResizeObserver(function (entries) {
        var h = Math.round(entries[0].contentRect.height);
        if (Math.abs(h - circuitH) > 2) { scheduleCircuit(); }
      }).observe(canvasEl);
    }
  }

  // ---------- Impuls na klik ----------
  // Klik na pozadinu (ispod hero sekcije) ispaljuje svetleći impuls: kratka
  // prilazna linija do najbližeg voda, zatim putovanje duž voda do kraja,
  // blesak na krajnjem čvoru i fade-out. Najviše 5 aktivnih odjednom.
  var activeClickPulses = 0;
  var PULSE_SEG = 34;      // dužina svetlećeg segmenta (px)
  var PULSE_SPEED = 450;   // brzina duž voda (px/s)

  document.addEventListener("click", function (e) {
    if (reduceMotion || !circuitSvg || !circuitSvg.isConnected) { return; }
    if (activeClickPulses >= 5) { return; }
    // ignoriši interaktivne elemente — klik na njih radi normalno, bez impulsa
    if (e.target && e.target.closest &&
        e.target.closest("a, button, input, textarea, select, label, video, .glass, .hamburger, nav, .mobile-menu")) {
      return;
    }

    // koordinate klika -> koordinatni sistem SVG-a
    var ctm = circuitSvg.getScreenCTM();
    if (!ctm) { return; }
    var clickPt = circuitSvg.createSVGPoint();
    clickPt.x = e.clientX;
    clickPt.y = e.clientY;
    var sp = clickPt.matrixTransform(ctm.inverse());
    if (sp.y < circuitHeroB) { return; }   // samo ispod hero sekcije

    // najbliža tačka na vodovima: grubo uzorkovanje na ~10px pa fino na 2px
    var best = null;
    circuitSvg.querySelectorAll("path.wire").forEach(function (path) {
      var total = path.getTotalLength();
      for (var l = 0; l <= total; l += 10) {
        var pt = path.getPointAtLength(l);
        var dx = pt.x - sp.x, dy = pt.y - sp.y;
        var d2 = dx * dx + dy * dy;
        if (!best || d2 < best.d2) { best = { path: path, len: l, pt: pt, d2: d2, total: total }; }
      }
    });
    if (!best) { return; }
    for (var l2 = Math.max(0, best.len - 9); l2 <= Math.min(best.total, best.len + 9); l2 += 2) {
      var rpt = best.path.getPointAtLength(l2);
      var rdx = rpt.x - sp.x, rdy = rpt.y - sp.y;
      var rd2 = rdx * rdx + rdy * rdy;
      if (rd2 < best.d2) { best.len = l2; best.pt = rpt; best.d2 = rd2; }
    }

    activeClickPulses++;
    var svg = circuitSvg;
    var done = false;
    function finish() {
      if (!done) { done = true; activeClickPulses = Math.max(0, activeClickPulses - 1); }
    }
    function gone(el) { return !svg.isConnected || !el.parentNode; }

    // faza 1: prilazna linija od klika do voda (animirano iscrtavanje ~0.3s)
    var adx = best.pt.x - sp.x, ady = best.pt.y - sp.y;
    var aDist = Math.sqrt(adx * adx + ady * ady);
    var approach = svgNode("path", {
      d: "M" + sp.x.toFixed(1) + " " + sp.y.toFixed(1) +
         " L" + best.pt.x.toFixed(1) + " " + best.pt.y.toFixed(1),
      "class": "wire-click", "stroke-width": 2
    });
    approach.style.strokeDasharray = aDist;
    approach.style.strokeDashoffset = aDist;
    svg.appendChild(approach);

    var tA = null;
    function drawApproach(ts) {
      if (gone(approach)) { finish(); return; }
      if (tA === null) { tA = ts; }
      var k = aDist > 1 ? Math.min(1, (ts - tA) / 300) : 1;
      approach.style.strokeDashoffset = aDist * (1 - k);
      if (k < 1) { requestAnimationFrame(drawApproach); } else { travel(); }
    }

    // faza 2: klon voda kao maska za segment koji klizi do kraja putanje
    function travel() {
      // prilazna linija izbledi dok impuls ulazi u vod
      var tF = null;
      (function fadeApproach(ts) {
        if (gone(approach)) { return; }
        if (tF === null) { tF = ts === undefined ? null : ts; }
        if (tF === null) { requestAnimationFrame(fadeApproach); return; }
        var k = Math.min(1, (ts - tF) / 250);
        approach.style.opacity = 1 - k;
        if (k < 1) { requestAnimationFrame(fadeApproach); } else { approach.remove(); }
      })();

      var clone = best.path.cloneNode(false);
      clone.setAttribute("class", "wire-click");
      clone.setAttribute("stroke-width", 2.2);
      clone.removeAttribute("style");
      var startS = Math.max(0, best.len - PULSE_SEG);
      var endS = Math.max(startS, best.total - PULSE_SEG);
      clone.style.strokeDasharray = PULSE_SEG + " 999999";
      clone.style.strokeDashoffset = -startS;   // segment pokriva [startS, startS+SEG]
      svg.appendChild(clone);

      var dur = ((endS - startS) / PULSE_SPEED) * 1000;
      var tT = null;
      function step(ts) {
        if (gone(clone)) { finish(); return; }
        if (tT === null) { tT = ts; }
        var k = dur > 0 ? Math.min(1, (ts - tT) / dur) : 1;
        clone.style.strokeDashoffset = -(startS + (endS - startS) * k);
        if (k < 1) { requestAnimationFrame(step); } else { flash(clone); }
      }
      requestAnimationFrame(step);
    }

    // faza 3: blesak na kraju voda, pa sve nestaje uz fade
    function flash(clone) {
      var end = best.path.getPointAtLength(best.total);
      var c = svgNode("circle", {
        cx: end.x.toFixed(1), cy: end.y.toFixed(1), r: 3, "class": "wire-click-flash"
      });
      svg.appendChild(c);
      var tB = null;
      function burst(ts) {
        if (gone(c)) { finish(); return; }
        if (tB === null) { tB = ts; }
        var k = Math.min(1, (ts - tB) / 380);
        c.setAttribute("r", (3 + 7 * k).toFixed(2));
        c.style.opacity = 1 - k;
        clone.style.opacity = 1 - k;
        if (k < 1) { requestAnimationFrame(burst); return; }
        if (clone.parentNode) { clone.remove(); }
        if (c.parentNode) { c.remove(); }
        finish();
      }
      requestAnimationFrame(burst);
    }

    requestAnimationFrame(drawApproach);
  });
})();

// ============================================================
// Hero video: <source> se dodaje (pa se fajl skida) samo na desktopu
// (> 768px) i van reduced-motion. Na mobilnom se video ne učitava —
// prikazuje se statična slika (CSS). Reaguje na resize / rotaciju ekrana.
// ============================================================
(function () {
  "use strict";
  var video = document.querySelector(".hero-video");
  if (!video) { return; }

  var mqDesktop = window.matchMedia("(min-width: 769px)");
  var mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function apply() {
    var useVideo = mqDesktop.matches && !mqReduce.matches;
    var source = video.querySelector("source");
    if (useVideo) {
      if (!source) {
        source = document.createElement("source");
        source.src = "videos/hero_video.mp4";
        source.type = "video/mp4";
        video.appendChild(source);
        video.load();
      }
      var p = video.play();
      if (p && p.catch) { p.catch(function () {}); }
    } else if (source) {
      // ukloni izvor i prekini eventualno preuzimanje videa
      source.remove();
      video.removeAttribute("src");
      video.load();
    }
  }

  apply();
  function onChange() { apply(); }
  if (mqDesktop.addEventListener) {
    mqDesktop.addEventListener("change", onChange);
    mqReduce.addEventListener("change", onChange);
  } else {                       // stariji browseri
    mqDesktop.addListener(onChange);
    mqReduce.addListener(onChange);
  }
})();

// ============================================================
// Studija slučaja: tabovi za prebacivanje između primera.
// Blag fade prelaz (van reduced-motion), naslov sekcije prati primer,
// pristupačno tastaturom (strelice / Home / End, roving tabindex).
// ============================================================
(function () {
  "use strict";
  var tablist = document.querySelector(".case-tabs");
  if (!tablist) { return; }

  var slice = Array.prototype.slice;
  var tabs = slice.call(tablist.querySelectorAll(".case-tab"));
  var panels = slice.call(document.querySelectorAll(".case-panels .case"));
  var title = document.getElementById("case-title");
  if (!tabs.length || tabs.length !== panels.length) { return; }

  function activate(idx, moveFocus) {
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    tabs.forEach(function (t, i) {
      var on = i === idx;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
    });
    panels.forEach(function (p, i) {
      var on = i === idx;
      p.hidden = !on;
      if (on) {
        if (title && p.dataset.title) { title.textContent = p.dataset.title; }
        if (!reduce) {                       // restartuj fade animaciju
          p.classList.remove("case-anim");
          void p.offsetWidth;
          p.classList.add("case-anim");
        }
      }
    });
    if (moveFocus) { tabs[idx].focus(); }
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () { activate(i); });
    tab.addEventListener("keydown", function (e) {
      var idx = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") { idx = (i + 1) % tabs.length; }
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { idx = (i - 1 + tabs.length) % tabs.length; }
      else if (e.key === "Home") { idx = 0; }
      else if (e.key === "End") { idx = tabs.length - 1; }
      if (idx !== null) { e.preventDefault(); activate(idx, true); }
    });
  });
})();

// ============================================================
// "Saznaj više" modal za kartice iz sekcije "Za koga radimo".
// Fade/scale (van reduced-motion), zatvara se X / overlay / Escape,
// focus trap + povratak fokusa, zaključan skrol pozadine.
// ============================================================
(function () {
  "use strict";
  var overlay = document.getElementById("aud-modal");
  if (!overlay) { return; }
  var dialog = overlay.querySelector(".modal");
  var closeBtn = document.getElementById("aud-modal-close");
  var titleEl = document.getElementById("aud-modal-title");
  var bodyEl = document.getElementById("aud-modal-body");
  var triggers = Array.prototype.slice.call(document.querySelectorAll(".aud-link[data-modal]"));

  var CONTENT = {
    med: {
      title: "Za medicinske i stomatološke ordinacije",
      body: "Pacijenti danas prvo traže termin online — i odlaze kod onih koje mogu odmah da zakažu. Pravimo sajtove i sisteme za zakazivanje koji rade 24 sata, sa automatskim podsetnicima koji smanjuju broj nedolazaka. AI asistent odgovara na najčešća pitanja i predlaže slobodne termine, danju i noću, tako da vaše osoblje ne mora da bude vezano za telefon. Vi dobijate uredan, popunjen kalendar i više vremena za pacijente."
    },
    rest: {
      title: "Za restorane i kafiće",
      body: "Gost koji ne može brzo da rezerviše sto ili poruči — ode kod drugog. Objedinjujemo online rezervacije i porudžbine na jednom mestu, sa AI asistentom koji prima upite i van radnog vremena. Automatske potvrde i podsetnici smanjuju prazne stolove i greške u porudžbinama, a lepe fotografije i jasan meni pretvaraju posetioce sajta u goste."
    },
    salon: {
      title: "Za salone lepote i frizerske salone",
      body: "Kraj zakazivanju preko DM-a i izgubljenih poruka. Klijenti sami biraju termin online, u bilo koje doba, a automatski podsetnici dan pre termina drastično smanjuju nedolaske. Lista čekanja automatski popunjava otkazane termine, tako da vaš raspored ostaje pun — bez da provodite večeri odgovarajući na poruke."
    }
  };

  var lastTrigger = null;
  var isOpen = false;

  function reduceMotion() { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; }

  function openModal(key, trigger) {
    var data = CONTENT[key];
    if (!data) { return; }
    lastTrigger = trigger || null;

    titleEl.textContent = data.title;
    bodyEl.textContent = "";
    var p = document.createElement("p");
    p.textContent = data.body;
    bodyEl.appendChild(p);

    // zaključaj skrol pozadine (kompenzuj širinu scrollbara)
    var sw = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (sw > 0) { document.body.style.paddingRight = sw + "px"; }

    overlay.hidden = false;
    void overlay.offsetWidth;          // reflow da fade/scale krene iz početnog stanja
    overlay.classList.add("open");
    isOpen = true;

    closeBtn.focus();
    document.addEventListener("keydown", onKeydown, true);
  }

  function finishClose() {
    overlay.hidden = true;
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
    isOpen = false;
    document.removeEventListener("keydown", onKeydown, true);
    if (lastTrigger && lastTrigger.focus) { lastTrigger.focus(); }
    lastTrigger = null;
  }

  function closeModal() {
    if (!isOpen) { return; }
    overlay.classList.remove("open");
    if (reduceMotion()) {
      finishClose();
    } else {
      var done = false;
      var end = function () { if (done) { return; } done = true; overlay.removeEventListener("transitionend", onEnd); finishClose(); };
      var onEnd = function (e) { if (e.target === overlay) { end(); } };
      overlay.addEventListener("transitionend", onEnd);
      setTimeout(end, 400);            // fallback ako transitionend izostane
    }
  }

  function focusables() {
    return Array.prototype.slice.call(
      dialog.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])')
    ).filter(function (el) { return el.offsetParent !== null; });
  }

  function onKeydown(e) {
    if (e.key === "Escape") { e.preventDefault(); closeModal(); return; }
    if (e.key === "Tab") {
      var f = focusables();
      if (!f.length) { e.preventDefault(); return; }
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      else if (!dialog.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    }
  }

  triggers.forEach(function (btn) {
    btn.addEventListener("click", function () { openModal(btn.dataset.modal, btn); });
  });
  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", function (e) { if (e.target === overlay) { closeModal(); } });
})();

// ============================================================
// Veliki modal sa živim pregledom sajta — za sve pločice iz Radova
// označene sa data-site-demo (Venus sajt, BurgerHouse meni…).
// X / overlay / Escape zatvaraju, fokus se čuva, skrol je zaključan.
// Iframe se puni tek pri otvaranju, a prazni pri zatvaranju (gasi 3D/video).
// ============================================================
(function () {
  "use strict";
  var tiles = Array.prototype.slice.call(document.querySelectorAll(".tile-link[data-site-demo]"));
  var overlay = document.getElementById("site-modal");
  if (!tiles.length || !overlay) { return; }
  var dialog = overlay.querySelector(".modal");
  var closeBtn = document.getElementById("site-modal-close");
  var frame = document.getElementById("site-modal-frame");

  var isOpen = false;
  var lastTile = null;

  function reduceMotion() { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; }

  var gallery = document.getElementById("site-modal-gallery");

  function openModal(tile) {
    lastTile = tile;
    frame.title = tile.dataset.demoLabel || "Pregled sajta";
    dialog.setAttribute("aria-label", tile.dataset.demoLabel || "Pregled sajta");
    // desktop aplikacije na telefonu/tabletu (≤768px): umesto žive aplikacije
    // prikaži galeriju slika iz aplikacije (data-demo-images na pločici)
    var demoImages = tile.getAttribute("data-demo-images");
    var useGallery = !!(gallery && demoImages &&
      window.matchMedia("(max-width: 768px)").matches);
    if (useGallery) {
      frame.src = "about:blank";
      frame.hidden = true;
      gallery.innerHTML = demoImages.split(",").map(function (src, i) {
        return '<img src="' + src.trim() + '" alt="Ekran aplikacije ' + (i + 1) +
          '" loading="lazy" decoding="async">';
      }).join("");
      gallery.hidden = false;
    } else {
      if (gallery) { gallery.hidden = true; gallery.innerHTML = ""; }
      frame.hidden = false;
      frame.src = tile.getAttribute("href");
    }
    // mobilne aplikacije: uži modal u obliku telefona
    dialog.classList.toggle("is-phone", tile.hasAttribute("data-demo-phone"));
    var sw = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (sw > 0) { document.body.style.paddingRight = sw + "px"; }
    overlay.hidden = false;
    void overlay.offsetWidth;
    overlay.classList.add("open");
    isOpen = true;
    closeBtn.focus();
    document.addEventListener("keydown", onKeydown, true);
  }

  function finishClose() {
    overlay.hidden = true;
    frame.src = "about:blank";          // zaustavi 3D scenu i video u pozadini
    if (gallery) { gallery.hidden = true; gallery.innerHTML = ""; }
    frame.hidden = false;
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
    isOpen = false;
    document.removeEventListener("keydown", onKeydown, true);
    if (lastTile) { lastTile.focus(); }
  }

  function closeModal() {
    if (!isOpen) { return; }
    overlay.classList.remove("open");
    if (reduceMotion()) { finishClose(); return; }
    var done = false;
    var end = function () { if (done) { return; } done = true; overlay.removeEventListener("transitionend", onEnd); finishClose(); };
    var onEnd = function (e) { if (e.target === overlay) { end(); } };
    overlay.addEventListener("transitionend", onEnd);
    setTimeout(end, 400);
  }

  function onKeydown(e) {
    if (e.key === "Escape") { e.preventDefault(); closeModal(); return; }
    if (e.key === "Tab" && !dialog.contains(document.activeElement)) {
      e.preventDefault();
      closeBtn.focus();
    }
  }

  tiles.forEach(function (tile) {
    tile.addEventListener("click", function (e) {
      // ctrl/cmd/shift/srednji klik: pusti browser da otvori u novom tabu
      if (e.ctrlKey || e.metaKey || e.shiftKey || (typeof e.button === "number" && e.button !== 0)) { return; }
      e.preventDefault();
      openModal(tile);
    });
  });
  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", function (e) { if (e.target === overlay) { closeModal(); } });
})();
