/* ============================================================
   VENUS — stranica Usluge: modal sa opisom pod-oblasti
   · klik na naziv pod-oblasti (u listi ili indeksu) otvara
     prozor sa opisom i slikama, bez napuštanja stranice
   · otvara se i preko hash-a (npr. usluge.html#sinus-lift)
   ============================================================ */
(function () {
  'use strict';

  var SUBS = {
    'all-on-4': {
      area: 'Zubni implanti', title: 'All on 4',
      text: 'Koncept koji celu vilicu oslanja na samo četiri implantata — dva prava napred i dva pod uglom pozadi. Fiksni most se najčešće postavlja u roku od 24 časa, pa iz ordinacije izlazite sa zubima koji se ne vade. Idealno rešenje kada je izgubljena većina zuba, a želite stabilnost bez klasične proteze.',
      imgs: ['assets/gallery/implant2.webp']
    },
    'all-on-6': {
      area: 'Zubni implanti', title: 'All on 6',
      text: 'Nadogradnja All on 4 koncepta: šest implantata nosi fiksni most cele vilice, uz još ravnomerniji raspored opterećenja pri žvakanju. Preporučuje se kada kvalitet kosti dozvoljava dodatna uporišta — za maksimalnu dugotrajnost rada. Zubi izgledaju i funkcionišu kao prirodni.',
      imgs: ['assets/gallery/implant2.webp']
    },
    'zigomaticni-implanti': {
      area: 'Zubni implanti', title: 'Zigomatični implanti',
      text: 'Rešenje za najteže slučajeve — kada je vilična kost toliko izgubljena da klasična implantacija nije moguća. Implantati se usidravaju u jagodičnu (zigomatičnu) kost, pa nadogradnja kosti najčešće nije potrebna. Fiksni zubi postaju mogući i tamo gde je ranije jedina opcija bila totalna proteza.',
      imgs: []
    },
    'krunice-na-implantima': {
      area: 'Zubni implanti', title: 'Krunice na implantima',
      text: 'Pojedinačna nadoknada izgubljenog zuba bez brušenja susednih zdravih zuba. Implantat preuzima ulogu korena, a keramička krunica na njemu se ne razlikuje od prirodnog zuba. Trajno, stabilno i higijenski najbolje rešenje za jedan ili više nedostajućih zuba.',
      imgs: ['assets/gallery/holivud1.jpg']
    },
    'bezmetalne-krunice': {
      area: 'Estetska stomatologija', title: 'Bezmetalne krunice',
      text: 'Krunice od potpune keramike, bez metalne osnove — svetlost propuštaju isto kao prirodna gleđ. Zato deluju živo i prirodno čak i na prednjim zubima, bez tamne ivice uz desni. Biokompatibilne su i pogodne za pacijente osetljive na metale.',
      imgs: ['assets/gallery/holivud1.jpg']
    },
    'cirkonijum-krunice': {
      area: 'Estetska stomatologija', title: 'Cirkonijum krunice',
      text: 'Cirkonijum-dioksid spaja čvrstoću metala sa estetikom keramike. Krunice su izuzetno otporne na lom, a opet dovoljno prozirne da verno prate boju okolnih zuba. Odličan izbor i za bočne regije, gde je pritisak žvakanja najveći.',
      imgs: []
    },
    'keramicke-fasete': {
      area: 'Estetska stomatologija', title: 'Keramičke fasete',
      text: 'Tanke keramičke ljuspice (0,3–0,7 mm) koje se lepe na prednju stranu zuba i trajno koriguju oblik, boju i sitne nepravilnosti. Brušenje zuba je minimalno ili ga uopšte nema. Rezultat je prirodan, ujednačen osmeh koji ne izgleda „urađeno".',
      imgs: ['assets/gallery/fasete1.jpg', 'assets/gallery/fasete6.jpg']
    },
    'beljenje-zuba': {
      area: 'Estetska stomatologija', title: 'Beljenje zuba',
      text: 'Profesionalno izbeljivanje u ordinaciji, pod kontrolom lekara i bezbedno po gleđ. Zubi postaju svetliji za nekoliko nijansi već nakon jedne posete. Pre tretmana uklanjamo kamenac i naslage, da bi rezultat bio ravnomeran i dugotrajan.',
      imgs: ['assets/gallery/izbeljivanje1.png']
    },
    'ortodoncija': {
      area: 'Estetska stomatologija', title: 'Ortodoncija',
      text: 'Ispravljanje zuba i zagrižaja fiksnim protezama (bravicama) ili providnim folijama — za decu i odrasle. Pravilan zagrižaj nije samo estetika: čuva zube, desni i vilični zglob. Terapiju planiramo na osnovu ortodontske analize i snimka, uz jasan plan i rokove.',
      imgs: ['assets/gallery/fiksna1.webp', 'assets/gallery/fiksna3.jpg']
    },
    'uklanjanje-kamenca': {
      area: 'Parodontologija', title: 'Uklanjanje zubnog kamenca',
      text: 'Ultrazvučno uklanjanje kamenca i mekih naslaga, praćeno peskiranjem i poliranjem zuba. Bezbolno je, traje oko pola sata i preporučuje se na svakih šest meseci. Najbolja prevencija parodontopatije, zapaljenja desni i neprijatnog zadaha.',
      imgs: []
    },
    'vadjenje-umnjaka': {
      area: 'Oralna hirurgija', title: 'Vađenje umnjaka',
      text: 'Umnjaci koji rastu ukoso, nepotpuno niču ili prave pritisak na susedne zube vade se planirano — pre nego što naprave štetu. Zahvat radimo uz lokalnu anesteziju i minimalnu traumu, sa jasnim uputstvima za oporavak.',
      imgs: []
    },
    'vadjenje-zuba': {
      area: 'Oralna hirurgija', title: 'Vađenje zuba',
      text: 'Kada zub nije moguće spasiti, vađenje radimo pažljivo i bezbolno, uz maksimalno očuvanje okolne kosti — što je važno za kasniju implantaciju. Dobijate precizna uputstva za negu rane i kontrolu zarastanja.',
      imgs: []
    },
    'apikotomija': {
      area: 'Oralna hirurgija', title: 'Apikotomija',
      text: 'Hirurško uklanjanje vrha korena zuba zajedno sa upalnim procesom — kada lečenje kanala nije dovoljno. Zub se na taj način čuva umesto da se vadi. Zahvat je kratak i radi se uz lokalnu anesteziju.',
      imgs: []
    },
    'rezanj-operacija': {
      area: 'Oralna hirurgija', title: 'Režanj operacija',
      text: 'Hirurško lečenje uznapredovale parodontopatije: podizanjem mekog tkiva čiste se duboki parodontalni džepovi do kojih redovno čišćenje ne dopire. Cilj je da se zaustavi gubitak kosti i produži život zuba.',
      imgs: []
    },
    'resekcija-frenuluma': {
      area: 'Oralna hirurgija', title: 'Resekcija frenuluma',
      text: 'Korekcija resice (frenuluma) gornje usne ili jezika kada ometa govor, dojenje, nošenje proteze ili povlači desni. Kratka intervencija uz lokalnu anesteziju, sa brzim i jednostavnim oporavkom.',
      imgs: []
    },
    'nivelacija-grebena': {
      area: 'Oralna hirurgija', title: 'Nivelacija grebena',
      text: 'Izravnavanje i oblikovanje koštanog grebena posle vađenja zuba — priprema za stabilnu i udobnu protezu ili precizan protetski rad. Ravnomeran greben znači bolje naleganje i manje žuljanja.',
      imgs: []
    },
    'cistektomija': {
      area: 'Oralna hirurgija', title: 'Cistektomija',
      text: 'Uklanjanje viličnih cista u celosti, uz maksimalno očuvanje okolnog zdravog tkiva i zuba. Cista se šalje na analizu, a koštani defekt se po potrebi popunjava veštačkom kosti.',
      imgs: []
    },
    'sinus-lift': {
      area: 'Oralna hirurgija', title: 'Sinus lift',
      text: 'Podizanje dna maksilarnog sinusa i ugradnja veštačke kosti — kada u bočnoj regiji gornje vilice nema dovoljno kosti za implantat. Radi se kao samostalan zahvat ili istovremeno sa ugradnjom implantata.',
      imgs: []
    },
    'popravka-zuba': {
      area: 'Opšta stomatologija', title: 'Popravka zuba',
      text: 'Kompozitne plombe u boji zuba, postavljene sloj po sloj tako da prate anatomiju i nijansu zuba. Popravka se ne primećuje — ni na pogled, ni pri žvakanju. Stara amalgamska plomba može bezbedno da se zameni belom.',
      imgs: []
    },
    'lecenje-zuba': {
      area: 'Opšta stomatologija', title: 'Lečenje zuba',
      text: 'Lečenje kanala korena (endodoncija) mašinskom tehnikom, uz preciznu obradu i punjenje kanala. Cilj je da se zub sačuva i posle dubokog karijesa ili upale živca — bezbolno i najčešće u jednoj do dve posete.',
      imgs: []
    },
    'karijes': {
      area: 'Opšta stomatologija', title: 'Karijes',
      text: 'Rano otkrivanje karijesa pregledom i snimkom, a zatim minimalno invazivno uklanjanje — buši se samo ono što je bolesno. Što se karijes ranije otkrije, popravka je manja, jeftinija i trajnija.',
      imgs: []
    },
    'zalivanje-fisura': {
      area: 'Dečija stomatologija', title: 'Zalivanje fisura zuba',
      text: 'Duboki žlebovi (fisure) na griznim površinama stalnih zuba zalivaju se tečnim materijalom koji ih štiti od karijesa. Bezbolna, brza i najisplativija prevencija kod dece — idealno odmah po nicanju stalnih kutnjaka.',
      imgs: []
    },
    'fluorizacija': {
      area: 'Dečija stomatologija', title: 'Fluorizacija zuba',
      text: 'Nanošenje visokokoncentrovanog fluorida jača gleđ i čini je otpornijom na kiseline i karijes. Tretman je bezbolan i traje nekoliko minuta, a preporučuje se deci dva puta godišnje uz redovnu kontrolu.',
      imgs: []
    },
    'hijaluronski-fileri': {
      area: 'Estetska medicina', title: 'Hijaluronski fileri',
      text: 'Hijaluronska kiselina vraća volumen i hidrataciju usnama i licu — diskretno i uvek u granicama prirodnog izgleda. Tretman traje kratko, rezultat je vidljiv odmah, a efekat se postepeno i ravnomerno povlači.',
      imgs: []
    },
    'botoks': {
      area: 'Estetska medicina', title: 'Botoks',
      text: 'Opuštanje mimičnih mišića koji stvaraju bore čela, između obrva i oko očiju. Izraz lica ostaje prirodan — samo odmorniji. Efekat traje četiri do šest meseci, a tretman se radi u jednoj kratkoj poseti.',
      imgs: []
    }
  };

  /* ---------- izgradnja modala ---------- */
  var modal = document.createElement('div');
  modal.className = 'sub-modal';
  modal.hidden = true;
  modal.innerHTML =
    '<div class="sub-modal-card" role="dialog" aria-modal="true" aria-labelledby="subModalTitle">' +
    '  <button type="button" class="sub-modal-close" aria-label="Zatvori">' +
    '    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
    '  </button>' +
    '  <p class="eyebrow"><span id="subModalArea"></span></p>' +
    '  <h2 id="subModalTitle"></h2>' +
    '  <p class="sub-modal-text" id="subModalText"></p>' +
    '  <div class="sub-modal-imgs" id="subModalImgs"></div>' +
    '</div>';
  document.body.appendChild(modal);

  var areaEl = modal.querySelector('#subModalArea');
  var titleEl = modal.querySelector('#subModalTitle');
  var textEl = modal.querySelector('#subModalText');
  var imgsEl = modal.querySelector('#subModalImgs');
  var closeBtn = modal.querySelector('.sub-modal-close');
  var lastFocused = null;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function openSub(slug) {
    var d = SUBS[slug];
    if (!d) return false;
    areaEl.textContent = d.area;
    titleEl.textContent = d.title;
    textEl.textContent = d.text;
    imgsEl.innerHTML = '';
    d.imgs.forEach(function (src) {
      var img = document.createElement('img');
      img.src = src;
      img.alt = d.title + ' — pre i posle';
      imgsEl.appendChild(img);
    });
    lastFocused = document.activeElement;
    modal.hidden = false;
    requestAnimationFrame(function () { modal.classList.add('open'); });
    document.body.style.overflow = 'hidden';
    closeBtn.focus({ preventScroll: true });
    return true;
  }

  function closeSub() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    window.setTimeout(function () { modal.hidden = true; }, reduceMotion ? 0 : 300);
    if (lastFocused) lastFocused.focus({ preventScroll: true });
  }

  closeBtn.addEventListener('click', closeSub);
  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeSub();
  });
  document.addEventListener('keydown', function (e) {
    if (!modal.hidden && e.key === 'Escape') closeSub();
  });

  /* klik na naziv pod-oblasti u listama "Šta uključuje" */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.sub-open');
    if (btn) { openSub(btn.dataset.sub); return; }

    /* klik na pod-oblast u padajućem meniju (ista stranica) —
       otvori modal bez promene hash-a, da se stranica ne skroluje u pozadini */
    var link = e.target.closest('.submenu a');
    if (link) {
      var slug = (link.getAttribute('href') || '').split('#')[1];
      if (slug && SUBS[slug] && openSub(slug)) e.preventDefault();
    }
  });

  /* otvaranje preko hash-a: iz padajućeg menija ili direktnim linkom */
  function openFromHash() {
    var slug = window.location.hash.replace('#', '');
    if (SUBS[slug]) openSub(slug);
  }
  window.addEventListener('hashchange', openFromHash);
  openFromHash();

  /* ---------- indeks usluga: leva lista bira desni panel ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.svc-tab'));
  var panels = Array.prototype.slice.call(document.querySelectorAll('.svc-panel'));
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t, j) { t.setAttribute('aria-selected', String(i === j)); });
      panels.forEach(function (p, j) { p.hidden = i !== j; });
    });
  });
})();
