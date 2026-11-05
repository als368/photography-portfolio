/* ------------------------------------------------------------------
   EDIT YOUR PHOTOS HERE
   HIGHLIGHTS = the six sections. MOSAIC = the photos in the top banner.
   List filenames from your /images folder. Missing files are skipped
   automatically, and a highlight with no photos is hidden.
------------------------------------------------------------------- */
const HIGHLIGHTS = [
  { id: 'networking-panels', title: 'Networking Panels',
    blurb: 'Speakers, conversations and connections from networking panel events.',
    files: ['IMG_5426.jpg', 'IMG_5430.jpg', 'IMG_5433.jpg', 'IMG_5436.jpg', 'IMG_5466.jpg', 'IMG_5721.jpg', 'IMG_5756.jpg'] },

  { id: 'go-eng-girl', title: 'Go Eng Girl!',
    blurb: 'Girls exploring engineering, hands-on and full of curiosity.',
    files: ['_MG_goenggirl.jpg', '_MG_5454.jpg', '_MG_5669.jpg', '_MG_5677.jpg', '_MG_5682.jpg', 'IMG_6785.jpg', 'IMG_6793.jpg', 'IMG_6828.jpg'] },

  { id: 'nvidia-x-wise', title: 'NVIDIA x WISE',
    blurb: 'Women in science and engineering coming together with NVIDIA.',
    files: ['IMG_1011.jpg', 'DSC01608.jpg', 'IMG_4860.jpg', 'IMG_4866.jpg', 'IMG_4885.jpg'] },

  { id: 'sickkids-ssure', title: 'SickKids SSURE Highlights',
    blurb: 'Moments from the SickKids SSURE research program.',
    files: ['IMG_6893.jpg', 'IMG_6914_2.jpg', 'IMG_6922_2.jpg', 'IMG_6939.jpg', 'IMG_6954_2.jpg', 'IMG_7017.jpg', 'IMG_7099.jpg', 'IMG_7264.jpg'] },

  { id: 'hart-house-exhibit', title: 'U of T Hart House Exhibit Submission',
    blurb: 'My photography submission for the Hart House exhibit.',
    files: ['mateoshoot1.jpg', 'mateoshoot2.jpg', 'Sabaa_Rashid_2.jpg', 'Xinran_Xu_2.jpg', 'photo2.jpg', 'IMG_0926.jpg', 'IMG_0931.jpg'] },

  { id: 'girls-in-med-research', title: 'Girls in Med Research Competition',
    blurb: 'Presentations, teamwork and the thrill of competition day.',
    files: ['_MG_5707.jpg', '_MG_5708.jpg', 'photo1.jpg'] }
];

// Top banner mosaic (12 tiles). Any missing photo becomes a pastel tile.
const MOSAIC = ['IMG_1011.jpg', 'mateoshoot1.jpg', '_MG_5708.jpg', 'IMG_5430.jpg', 'IMG_0931.jpg', 'IMG_6939.jpg',
                'Sabaa_Rashid_2.jpg', 'IMG_4885.jpg', 'IMG_0926.jpg', '_MG_5677.jpg', 'IMG_5721.jpg', 'IMG_7264.jpg'];

const IMAGE_DIR = 'images/';

/* ------------------------------------------------------------------ */
(() => {
  const sectionsEl = document.getElementById('sections');
  const chipsEl = document.getElementById('chips');
  const mosaicEl = document.getElementById('mosaic');
  const box = document.getElementById('lightbox');
  const lbImg = document.getElementById('lb-img');
  const lbCap = document.getElementById('lb-cap');
  let list = [], index = 0, lastFocus = null;

  // Check which image files really exist before drawing anything
  const exists = (src) => new Promise((res) => {
    const im = new Image();
    im.onload = () => res(true);
    im.onerror = () => res(false);
    im.src = src;
  });

  // Accept .jpg / .JPG / .jpeg / .png so capital letters in file endings don't matter
  const EXTS = ['.jpg', '.JPG', '.jpeg', '.JPEG', '.png', '.PNG'];
  async function resolve(file) {
    const base = IMAGE_DIR + file.replace(/\.[^.]+$/, '');
    for (const ext of EXTS) {
      const url = encodeURI(base + ext);
      if (await exists(url)) return url;
    }
    return null;
  }

  const missing = [];

  async function buildMosaic() {
    const urls = (await Promise.all(MOSAIC.map(resolve)));
    const tints = ['tint-a', 'tint-b', 'tint-c'];
    urls.forEach((u, i) => {
      const d = document.createElement('div');
      d.className = 'm-tile' + (u ? '' : ' ' + tints[i % 3]);
      if (u) d.innerHTML = `<img src="${u}" alt="" />`;
      else missing.push(MOSAIC[i]);
      mosaicEl.appendChild(d);
    });
  }

  async function build() {
    for (const h of HIGHLIGHTS) {
      const urls = await Promise.all(h.files.map(resolve));
      h.files.forEach((f, i) => { if (!urls[i]) missing.push(f); });
      const photos = urls.filter(Boolean).map((src, i) => ({
        src,
        alt: `${h.title}, photo ${i + 1}`,
        caption: `${h.title} | ${i + 1} of ${urls.filter(Boolean).length}`
      }));
      if (!photos.length) continue;

      const n = sectionsEl.children.length + 1;
      const sec = document.createElement('section');
      sec.id = h.id;
      sec.className = 'dump tone-' + ((n - 1) % 3);
      sec.innerHTML = `
        <header class="dump-head">
          <span class="dump-num">${n}.</span>
          <h3 class="script dump-title">${h.title}</h3>
          <p class="spec">${h.blurb} | ${photos.length} photos</p>
        </header>
        <div class="dump-grid"></div>`;
      const grid = sec.querySelector('.dump-grid');
      photos.forEach((p, i) => {
        const b = document.createElement('button');
        b.className = 'tile';
        b.setAttribute('aria-label', `Open photo ${i + 1} of ${h.title}`);
        b.innerHTML = `<img loading="lazy" src="${p.src}" alt="${p.alt}" />`;
        b.addEventListener('click', () => open(photos, i));
        grid.appendChild(b);
      });
      sectionsEl.appendChild(sec);

      const chip = document.createElement('a');
      chip.href = '#' + h.id;
      chip.className = 'chip';
      chip.textContent = `${n}. ${h.title}`;
      chipsEl.appendChild(chip);
    }
    if (missing.length) console.warn('Photos not found in /images:', missing);
    if (!sectionsEl.children.length) {
      sectionsEl.innerHTML = '<p class="spec">No photos found yet. Check that your files are inside the images folder and that their names match js/main.js exactly.</p>';
    }
    // jump to a #hash target (e.g. from the Collaborations stickers) once built
    if (location.hash) document.querySelector(location.hash)?.scrollIntoView();
  }

  // Lightbox
  function show(i) {
    index = (i + list.length) % list.length;
    const p = list[index];
    lbImg.src = p.src; lbImg.alt = p.alt; lbCap.textContent = p.caption;
  }
  function open(photos, i) {
    list = photos; lastFocus = document.activeElement;
    show(i);
    box.hidden = false;
    document.body.style.overflow = 'hidden';
    box.querySelector('.lb-close').focus();
  }
  function close() {
    box.hidden = true; lbImg.src = '';
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  box.addEventListener('click', (e) => {
    const act = e.target.dataset.act;
    if (act === 'close' || e.target === box) close();
    else if (act === 'prev') show(index - 1);
    else if (act === 'next') show(index + 1);
  });
  document.addEventListener('keydown', (e) => {
    if (box.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });
  let startX = 0;
  box.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
  });

  // Hide the About photocard if its photo file is missing
  document.addEventListener('error', (e) => {
    if (e.target.tagName === 'IMG') e.target.closest('.photocard')?.remove();
  }, true);

  document.getElementById('year').textContent = new Date().getFullYear();
  buildMosaic().then(build);
})();
