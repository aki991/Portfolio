/* ============================================================
   VENUS — "Izaberite svog specijalistu" (rotirajući karusel)
   · izabrani doktor uvek na centru; bočni manji/zatamnjeni
   · rotacija: figure FIZIČKI putuju do nove pozicije (CSS
     tranzicija transform/filter — prekid usred puta je čist,
     jer retarget CSS tranzicije kreće iz trenutnog stanja)
   · klik na bočnog / strelice na ekranu / tastatura ←→ / swipe
   · panel crossfade + stat linije koje se ponovo pune
   · reduced-motion: trenutna promena, bez putovanja
   ============================================================ */
(function () {
  'use strict';

  var section = document.getElementById('specijalisti');
  if (!section) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- PODACI — privremeni, slobodno izmeni ---------- */
  var DOCTORS = [
    {
      ime: 'Dr Nikola Simić',
      specijalnost: 'Implantologija i oralna hirurgija',
      opis: 'Specijalista oralne hirurgije sa preko 1.500 ugrađenih implantata. Svaki zahvat planira digitalno, do desetinke milimetra — pre nego što uzme instrument u ruke. Pacijenti ga pamte po mirnoj ruci i još mirnijem glasu.',
      fakti: [
        ['Obrazovanje', 'Stomatološki fakultet u Beogradu · specijalizacija iz oralne hirurgije'],
        ['Iskustvo', '12 godina prakse · 1.500+ ugrađenih implantata'],
        ['Uža oblast', 'Vođena implantacija i nadogradnja kosti'],
        ['Van ordinacije', 'Planinar i strastveni fotograf prirode']
      ],
      slika: 'assets/doctors/doktor-1.png', w: 337, h: 988
    },
    {
      ime: 'Dr Tamara Ilić',
      specijalnost: 'Protetika i restaurativna stomatologija',
      opis: 'Krunice i mostovi koji se ne razlikuju od prirodnog zuba — to je njen zanat. Svaki rad vodi od otiska do finalnog cementiranja, u bliskoj saradnji sa našom laboratorijom, i ne predaje ga dok ne bude savršen.',
      fakti: [
        ['Obrazovanje', 'Stomatološki fakultet u Beogradu · specijalizacija iz stomatološke protetike'],
        ['Iskustvo', '9 godina prakse · 800+ protetskih radova'],
        ['Uža oblast', 'Bezmetalna keramika i digitalni otisak'],
        ['Van ordinacije', 'Slika akvarele — preciznost je i tu njen potpis']
      ],
      slika: 'assets/doctors/doktor-2.png', w: 303, h: 962
    },
    {
      ime: 'Dr Milica Petrović',
      specijalnost: 'Estetska stomatologija',
      opis: 'Osnivač ordinacije. Usavršavala se u Beču i Milanu u oblasti minimalno invazivne estetike. Veruje da se najbolji rad ne primećuje — primećuje se samo osmeh.',
      fakti: [
        ['Obrazovanje', 'Stomatološki fakultet u Beogradu · usavršavanje u Beču i Milanu'],
        ['Iskustvo', '15 godina prakse · osnivač ordinacije Venus'],
        ['Uža oblast', 'Digitalni dizajn osmeha i keramičke folije'],
        ['Van ordinacije', 'Ljubitelj opere i dugih šetnji pored Morave']
      ],
      slika: 'assets/doctors/doktor-3.png', w: 322, h: 954
    },
    {
      ime: 'Dr Jelena Kovač',
      specijalnost: 'Ortodoncija i dečja stomatologija',
      opis: 'Strpljenje je njen glavni instrument — od bravica kod odraslih do prvog odlaska deteta zubaru. Terapiju planira tako da osmeh raste pravilno, bez straha i bez žurbe.',
      fakti: [
        ['Obrazovanje', 'Stomatološki fakultet u Beogradu · specijalizacija iz ortopedije vilica'],
        ['Iskustvo', '10 godina prakse · 600+ završenih ortodontskih terapija'],
        ['Uža oblast', 'Providne folije (aligneri) i rana prevencija kod dece'],
        ['Van ordinacije', 'Mama dvoje dece — zna tačno kako izgleda prva poseta zubaru']
      ],
      slika: 'assets/doctors/doktor-4.png', w: 291, h: 967
    },
    {
      ime: 'Dr Marko Đorđević',
      specijalnost: 'Parodontologija i oralna medicina',
      opis: 'Čuvar temelja svakog osmeha — desni i kosti koje zub drže. Rane znake problema uočava pre nego što postanu vidljivi, a terapiju vodi temeljno i bez nelagode.',
      fakti: [
        ['Obrazovanje', 'Stomatološki fakultet u Beogradu · specijalizacija iz parodontologije'],
        ['Iskustvo', '8 godina prakse · fokus na regenerativne terapije desni'],
        ['Uža oblast', 'Lečenje parodontopatije i oralne medicine'],
        ['Van ordinacije', 'Šahista i kuvar amater — strpljiv u svemu što radi']
      ],
      slika: 'assets/doctors/doktor-5.png', w: 351, h: 991
    }
  ];

  var track = document.getElementById('csTrack');
  var stage = document.getElementById('csStage');
  var panel = document.getElementById('csPanel');
  var specEl = document.getElementById('csSpec');
  var nameEl = document.getElementById('csName');
  var bioEl = document.getElementById('csBio');
  var factsEl = document.getElementById('csFacts');
  var counterEl = document.getElementById('csCounter');

  var figures = [];
  /* current = indeks doktora na centru; ostali dobijaju slot po
     kružnom rastojanju: 0=centar, 1=desni, 2=daleko-desni (skriven),
     n-2=daleko-levi (skriven), n-1=levi */
  var current = 0;
  var panelTimer = null;
  var swipeX = null, swiped = false;

  function pad2(n) { return String(n).padStart(2, '0'); }

  function rel(docIdx) {
    return (docIdx - current + DOCTORS.length) % DOCTORS.length;
  }

  /* ---------- izgradnja figura iz niza ---------- */
  DOCTORS.forEach(function (d, i) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cs-figure';
    btn.setAttribute('aria-label', 'Prikaži: ' + d.ime + ', ' + d.specijalnost);
    btn.setAttribute('aria-pressed', 'false');

    var img = document.createElement('img');
    img.src = d.slika;
    img.alt = ''; // ime nosi dugme (aria-label)
    img.width = d.w;
    img.height = d.h;
    img.decoding = 'async';
    img.draggable = false;

    btn.appendChild(img);
    btn.addEventListener('click', function () {
      if (swiped) return;
      var d = rel(i);
      if (d === DOCTORS.length - 1) rotate(-1); // levi prelazi na centar
      else if (d === 1) rotate(1);              // desni prelazi na centar
      // klik na centralnog ili skrivene: ništa
    });
    track.appendChild(btn);
    figures.push(btn);
  });

  /* ---------- dodela slotova (CSS animira putovanje) ---------- */
  var prevSlots = [];
  function applySlots() {
    var n = DOCTORS.length;
    var teleported = [];
    figures.forEach(function (f, di) {
      var d = rel(di);
      var slot = d === 0 ? 'c'
        : d === 1 ? 'r'
        : d === n - 1 ? 'l'
        : d <= n / 2 ? 'fr' : 'fl';

      /* skok sa krajnje-leve na krajnje-desnu poziciju (i obrnuto)
         ide bez tranzicije — figura ne "preleće" preko cele scene */
      if ((prevSlots[di] === 'fl' && slot === 'fr') ||
          (prevSlots[di] === 'fr' && slot === 'fl')) {
        f.classList.add('no-trans');
        teleported.push(f);
      }
      prevSlots[di] = slot;

      f.classList.toggle('slot-c', slot === 'c');
      f.classList.toggle('slot-r', slot === 'r');
      f.classList.toggle('slot-l', slot === 'l');
      f.classList.toggle('slot-fr', slot === 'fr');
      f.classList.toggle('slot-fl', slot === 'fl');
      f.setAttribute('aria-pressed', String(slot === 'c'));
    });
    if (teleported.length) {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          teleported.forEach(function (f) { f.classList.remove('no-trans'); });
        });
      });
    }
  }

  /* ---------- popuna panela ---------- */
  function fillPanel(d) {
    specEl.textContent = d.specijalnost;
    nameEl.textContent = d.ime;
    bioEl.textContent = d.opis;

    factsEl.innerHTML = '';
    d.fakti.forEach(function (fact) {
      var row = document.createElement('div');
      row.className = 'cs-fact';

      var label = document.createElement('span');
      label.className = 'cs-fact-label';
      label.textContent = fact[0];

      var val = document.createElement('span');
      val.className = 'cs-fact-val';
      val.textContent = fact[1];

      row.appendChild(label);
      row.appendChild(val);
      factsEl.appendChild(row);
    });
  }

  /* ---------- panel crossfade (čist prekid pri brzom klikćanju) ---------- */
  function updatePanel() {
    var d = DOCTORS[current];
    counterEl.textContent = pad2(current + 1) + ' / ' + pad2(DOCTORS.length);

    if (reduceMotion) { fillPanel(d); return; }

    panel.classList.add('switching');
    if (panelTimer) window.clearTimeout(panelTimer);
    panelTimer = window.setTimeout(function () {
      fillPanel(d);
      panel.classList.remove('switching');
      panelTimer = null;
    }, 180);
  }

  /* ---------- rotacija kruga pozicija ----------
     dir = +1: desni prelazi na centar; dir = -1: levi na centar.
     Brzi uzastopni klikovi su bezbedni: nova dodela slotova
     retarguje CSS tranzicije iz trenutnog međustanja. */
  function rotate(dir) {
    current = (current + dir + DOCTORS.length) % DOCTORS.length;
    applySlots();
    updatePanel();
  }

  /* ---------- kontrole ---------- */
  document.getElementById('csPrev').addEventListener('click', function () { rotate(-1); });
  document.getElementById('csNext').addEventListener('click', function () { rotate(1); });

  /* tastatura ←/→ — samo dok je sekcija u vidnom polju */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    var t = e.target;
    if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
    var lb = document.getElementById('lightbox');
    if (lb && !lb.hidden) return; // lightbox ima svoje strelice
    var r = section.getBoundingClientRect();
    if (r.bottom < 100 || r.top > window.innerHeight - 100) return;
    rotate(e.key === 'ArrowRight' ? 1 : -1);
  });

  /* swipe (mobilni) */
  stage.addEventListener('pointerdown', function (e) {
    swipeX = e.clientX; swiped = false;
  });
  stage.addEventListener('pointerup', function (e) {
    if (swipeX === null) return;
    var dx = e.clientX - swipeX;
    swipeX = null;
    if (Math.abs(dx) > 44) {
      swiped = true;
      rotate(dx < 0 ? 1 : -1);
      window.setTimeout(function () { swiped = false; }, 80);
    }
  });
  stage.addEventListener('pointercancel', function () { swipeX = null; });

  /* ---------- init ---------- */
  applySlots();
  fillPanel(DOCTORS[current]);
  counterEl.textContent = pad2(current + 1) + ' / ' + pad2(DOCTORS.length);
  section.classList.add('cs-ready');
})();
