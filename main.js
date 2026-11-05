/* ------------------------------------------------------------------
   EDIT YOUR PHOTO HIGHLIGHTS HERE
   Each highlight = one section on the site. List the image files from
   your /images folder. Missing files are skipped automatically, and a
   highlight with no photos is hidden.
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
const IMAGE_DIR = 'images/';

/* ------------------------------------------------------------------ */
(() => {
  const sectionsEl = document.getElementById('sections');
  const chipsEl = document.getElementById('chips');
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

  async function build() {
    for (const h of HIGHLIGHTS) {
      const checks = await Promise.all(h.files.map((f) => exists(IMAGE_DIR + f)));
      const photos = h.files.filter((_, i) => checks[i]).map((f, i) => ({
        src: IMAGE_DIR + f,
        alt: `${h.title}, photo ${i + 1}`,
        caption: `${h.title}`
      }));
      if (!photos.length) continue;

      const sec = document.createElement('section');
      sec.id = h.id;
      sec.className = 'folder tone-' + (sectionsEl.children.length % 3);
      sec.innerHTML = `
        <h3 class="folder-tab font-display italic text-2xl sm:text-3xl">${h.title}</h3>
        <div class="folder-body">
          <p class="folder-note max-w-xl">${h.blurb}</p>
          <div class="masonry mt-6"></div>
        </div>`;
      const grid = sec.querySelector('.masonry');
      photos.forEach((p, i) => {
        const b = document.createElement('button');
        b.className = 'shot';
        b.setAttribute('aria-label', `Open photo ${i + 1} of ${h.title}`);
        b.innerHTML = `<img loading="lazy" src="${p.src}" alt="${p.alt}" />`;
        b.addEventListener('click', () => open(photos, i));
        grid.appendChild(b);
      });
      sectionsEl.appendChild(sec);

      const chip = document.createElement('a');
      chip.href = '#' + h.id;
      chip.className = 'chip bg-white hover:bg-butter transition-colors';
      chip.textContent = h.title;
      chipsEl.appendChild(chip);
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

  // Hide hero/about polaroids whose photo file is missing
  document.addEventListener('error', (e) => {
    if (e.target.tagName === 'IMG') e.target.closest('.polaroid')?.remove();
  }, true);

  document.getElementById('year').textContent = new Date().getFullYear();
  build();
})();
