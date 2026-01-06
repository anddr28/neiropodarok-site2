/* script.js
   Canvas gallery, video handling, form, FAQ, improved interactions.
*/
document.addEventListener('DOMContentLoaded', () => {
  const $ = (s,ctx=document) => ctx.querySelector(s);
  const $$ = (s,ctx=document) => Array.from(ctx.querySelectorAll(s));

  // Best-effort protection: allow contextmenu in inputs
  document.addEventListener('contextmenu', (e) => {
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) return;
    e.preventDefault();
  }, { passive: false });
  document.addEventListener('dragstart', e => e.preventDefault(), { passive: false });
  document.addEventListener('copy', e => e.preventDefault(), { passive: false });

  /* ---------- Gallery -> Canvas modal ---------- */
  const tiles = $$('.gallery .tile');
  const modal = $('#canvasModal');
  const overlay = $('#modalOverlay');
  const preview = $('#preview');
  const ctx = preview.getContext('2d');
  const closeModalBtn = $('#closeModal');
  const zIn = $('#zIn');
  const zOut = $('#zOut');

  let img = new Image();
  let scale = 1;
  let baseW = 0, baseH = 0;

  function fitCanvas(image) {
    const maxW = Math.min(1000, window.innerWidth - 80);
    const maxH = Math.min(800, window.innerHeight - 160);
    const w = image.width, h = image.height;
    const ratio = Math.min(maxW / w, maxH / h, 1);
    baseW = Math.round(w * ratio);
    baseH = Math.round(h * ratio);
  }

  function draw() {
    let dw = Math.round(baseW * scale);
    let dh = Math.round(baseH * scale);
    const maxDisplayW = Math.min(window.innerWidth - 48, 1100);
    if (dw > maxDisplayW) {
      const factor = maxDisplayW / dw;
      dw = Math.round(dw * factor);
      dh = Math.round(dh * factor);
    }
    preview.width = dw;
    preview.height = dh;
    preview.style.width = dw + 'px';
    preview.style.height = dh + 'px';
    ctx.clearRect(0,0,preview.width,preview.height);
    ctx.drawImage(img, 0, 0, preview.width, preview.height);
    // watermark
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = '#000';
    ctx.font = Math.max(12, Math.round(preview.width / 22)) + 'px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('Neiropodarok', preview.width - 12, preview.height - 20);
    ctx.restore();
  }

  function openTile(tile) {
    const src = tile.getAttribute('data-src') || tile.querySelector('img')?.src;
    if (!src) return;
    img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      fitCanvas(img);
      scale = 1;
      draw();
      modal.style.display = 'flex';
      modal.setAttribute('aria-hidden', 'false');
    };
    img.src = src;
  }

  tiles.forEach(t => {
    t.addEventListener('click', () => openTile(t));
  });

  closeModalBtn.addEventListener('click', closeCanvas);
  overlay.addEventListener('click', closeCanvas);
  function closeCanvas() {
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    ctx.clearRect(0,0,preview.width,preview.height);
  }
  zIn.addEventListener('click', () => { scale = Math.min(scale + 0.15, 3); draw(); });
  zOut.addEventListener('click', () => { scale = Math.max(scale - 0.15, 0.3); draw(); });

  /* ---------- Video handling ---------- */
  const videos = $$('video');
  videos.forEach(v => {
    v.addEventListener('loadedmetadata', () => {
      if (v.videoHeight && v.videoWidth && v.videoHeight > v.videoWidth) {
        const parent = v.closest('.video-card') || v.closest('.video-block');
        if (parent) parent.classList.add('vertical');
      }
    });
  });

  /* ---------- Form (demo) ---------- */
  const createForm = $('#createForm');
  const formMsg = $('#formMsg');
  if (createForm) {
    createForm.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      formMsg.textContent = 'Отправка…';
      await new Promise(r => setTimeout(r, 900));
      formMsg.textContent = 'Заявка принята. Менеджер свяжется с вами.';
      createForm.reset();
    });
  }

  /* ---------- FAQ accordion ---------- */
  $$('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    q.addEventListener('click', () => {
      const open = a.style.display === 'block';
      $$('.faq-a').forEach(x => x.style.display = 'none');
      a.style.display = open ? 'none' : 'block';
    });
  });

  /* ---------- Кнопка "Наверх" (Рабочая логика) ---------- */
  const toTop = $('#toTop');
  if (toTop) {
    window.addEventListener('scroll', () => {
      // Кнопка появляется после прокрутки на 300px
      if (window.scrollY > 300) {
        toTop.classList.add('show');
      } else {
        toTop.classList.remove('show');
      }
    });

    toTop.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // Навигация по кнопкам
  $('#demoBtn').addEventListener('click', () => document.getElementById('examples').scrollIntoView({ behavior: 'smooth' }));
  $('#orderBtn').addEventListener('click', () => document.getElementById('createCard').scrollIntoView({ behavior: 'smooth' }));
  $('#topOrder').addEventListener('click', () => document.getElementById('createCard').scrollIntoView({ behavior: 'smooth' }));
});