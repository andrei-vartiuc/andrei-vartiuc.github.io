document.addEventListener('DOMContentLoaded', () => {

  // Nom du hero : les lettres se déchiffrent une fois au chargement
  const lines = document.querySelectorAll('#hero-name .line');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&@';

  lines.forEach(line => {
    const text = line.dataset.text;
    line.setAttribute('aria-hidden', 'true');
    line.innerHTML = '';
    [...text].forEach(c => {
      const s = document.createElement('span');
      s.className = 'ch';
      s.textContent = c;
      line.appendChild(s);
    });
  });

  function decrypt() {
    let delay = 0;
    lines.forEach(line => {
      line.querySelectorAll('.ch').forEach(span => {
        const final = span.textContent;
        span.style.width = span.getBoundingClientRect().width + 'px';
        const start = performance.now() + delay;
        const duration = 500 + delay * 0.6;
        delay += 70;
        span.classList.add('scrambling');
        span.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        (function tick(now) {
          if (now < start) return requestAnimationFrame(tick);
          if (now - start >= duration) {
            span.textContent = final;
            span.classList.remove('scrambling');
            span.style.width = '';
            return;
          }
          span.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          requestAnimationFrame(tick);
        })(performance.now());
      });
    });
  }

  if (!reduceMotion) {
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(decrypt);
  }

  // Tags des cartes projets
  const projects = document.querySelectorAll('.project');
  function fillTags(el, tech) {
    el.innerHTML = '';
    tech.split(',').forEach(t => {
      const chip = document.createElement('span');
      chip.className = 'chip';
      chip.textContent = t.trim();
      el.appendChild(chip);
    });
  }
  projects.forEach(p => fillTags(p.querySelector('.card-tags'), p.dataset.tech));

  // Filtres
  document.querySelectorAll('.filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      projects.forEach(p => {
        p.hidden = !(filter === 'all' || p.dataset.category.split(' ').includes(filter));
      });
    });
  });

  // Modale
  const modal = document.getElementById('project-modal');
  const card = modal.querySelector('.modal-card');
  const img = document.getElementById('modal-img');
  const counter = document.getElementById('modal-counter');
  const thumbs = document.getElementById('modal-thumbnails');
  const prevBtn = document.getElementById('modal-prev-btn');
  const nextBtn = document.getElementById('modal-next-btn');
  const github = document.getElementById('modal-github');
  const demo = document.getElementById('modal-demo');
  let images = [];
  let index = 0;
  let lastFocus = null;

  function show(i) {
    index = (i + images.length) % images.length;
    img.src = images[index];
    img.alt = `Capture ${index + 1} sur ${images.length}`;
    counter.textContent = `${index + 1} / ${images.length}`;
    thumbs.querySelectorAll('button').forEach((b, k) => b.classList.toggle('active', k === index));
  }

  function openModal(p) {
    lastFocus = document.activeElement;
    images = JSON.parse(p.dataset.images);
    document.getElementById('modal-title').textContent = p.dataset.title;
    document.getElementById('modal-desc').textContent = p.dataset.desc;
    fillTags(document.getElementById('modal-tech'), p.dataset.tech);

    for (const [el, url] of [[github, p.dataset.github], [demo, p.dataset.live]]) {
      el.hidden = !url;
      if (url) el.href = url;
    }

    const multi = images.length > 1;
    prevBtn.hidden = nextBtn.hidden = counter.hidden = !multi;
    thumbs.hidden = !multi;
    thumbs.innerHTML = '';
    if (multi) {
      images.forEach((src, k) => {
        const b = document.createElement('button');
        b.setAttribute('aria-label', `Image ${k + 1}`);
        b.innerHTML = `<img src="${src}" alt="" />`;
        b.addEventListener('click', () => show(k));
        thumbs.appendChild(b);
      });
    }

    show(0);
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    document.getElementById('modal-close-btn').focus();
  }

  function closeModal() {
    modal.hidden = true;
    card.classList.remove('zoom');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  projects.forEach(p => p.querySelector('.card').addEventListener('click', () => openModal(p)));
  document.getElementById('modal-close-btn').addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  prevBtn.addEventListener('click', () => show(index - 1));
  nextBtn.addEventListener('click', () => show(index + 1));
  img.addEventListener('click', () => card.classList.toggle('zoom'));

  document.addEventListener('keydown', e => {
    if (modal.hidden) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });

  // Copie de l'email
  const toast = document.getElementById('toast');
  function notify(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }
  document.getElementById('copy-email-btn').addEventListener('click', () => {
    const email = document.getElementById('email-text').textContent.trim();
    navigator.clipboard.writeText(email)
      .then(() => notify('Adresse copiée'))
      .catch(() => notify(email));
  });
});
