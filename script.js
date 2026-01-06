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
    img.onerror = () => {
      const fallback = tile.querySelector('img')?.src;
      if (fallback) img.src = fallback;
      else console.warn('Image load failed:', src);
    };
    img.src = src;
  }

  tiles.forEach(t => {
    t.addEventListener('click', () => openTile(t));
    t.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') openTile(t); });
  });

  // close handlers: button and overlay click and ESC
  closeModalBtn.addEventListener('click', closeCanvas);
  overlay.addEventListener('click', closeCanvas);
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCanvas(); });
  function closeCanvas() {
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    ctx.clearRect(0,0,preview.width,preview.height);
  }
  zIn.addEventListener('click', () => { scale = Math.min(scale + 0.15, 3); draw(); });
  zOut.addEventListener('click', () => { scale = Math.max(scale - 0.15, 0.3); draw(); });
  preview.addEventListener('contextmenu', e => e.preventDefault());

  /* ---------- Video handling: vertical detection ---------- */
  const videos = $$('video');
  videos.forEach(v => {
    v.setAttribute('controlsList', 'nodownload');
    v.setAttribute('disablePictureInPicture', '');
    v.setAttribute('playsinline', '');
    v.addEventListener('contextmenu', e => e.preventDefault());
    v.addEventListener('click', async () => { try { if (v.paused) await v.play(); else v.pause(); } catch(e){} });

    v.addEventListener('loadedmetadata', () => {
      if (v.videoHeight && v.videoWidth && v.videoHeight > v.videoWidth) {
        const parent = v.closest('.video-card') || v.closest('.video-block');
        if (parent) {
          parent.classList.add('vertical');
          v.style.objectFit = 'contain';
          v.style.maxHeight = Math.min(window.innerHeight * 0.78, 800) + 'px';
          v.style.width = 'auto';
        }
      }
    });
  });

  /* ---------- Helper to change hero video on the fly ---------- */
  window.setHeroVideo = function(src) {
    const hero = $('#heroVideo');
    if (!hero) return console.warn('Hero video not found');
    const source = hero.querySelector('source');
    if (source) {
      source.src = src;
      hero.load();
      hero.play().catch(()=>{});
    }
  };

  /* ---------- Form (demo) ---------- */
  const createForm = $('#createForm');
  const formMsg = $('#formMsg');
  if (createForm) {
    createForm.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const fd = new FormData(createForm);
      const event = fd.get('event');
      if (!event) { formMsg.textContent = 'Выберите событие'; formMsg.style.color = '#d04c4c'; return; }
      formMsg.textContent = 'Отправка…'; formMsg.style.color = '';
      await new Promise(r => setTimeout(r, 900));
      formMsg.textContent = 'Заявка принята. Менеджер свяжется с вами.'; formMsg.style.color = 'green';
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

  /* ---------- toTop (animated) ---------- */
  const toTop = $('#toTop');
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  window.addEventListener('scroll', () => { toTop.style.display = window.scrollY > 200 ? 'flex' : 'none'; });
  toTop.style.display = 'none';

  // nav/demo/order buttons behavior
  $('#demoBtn').addEventListener('click', () => document.getElementById('examples').scrollIntoView({ behavior: 'smooth' }));
  $('#orderBtn').addEventListener('click', () => document.getElementById('createCard').scrollIntoView({ behavior: 'smooth' }));
  $('#topOrder').addEventListener('click', () => document.getElementById('createCard').scrollIntoView({ behavior: 'smooth' }));

  // diagnostics
  $$('img').forEach(img => img.addEventListener('error', () => console.warn('Image load failed:', img.src)));
});

// === TO TOP BUTTON LOGIC ===
const toTopBtn = document.getElementById('toTop');

if (toTopBtn) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      toTopBtn.classList.add('show');
    } else {
      toTopBtn.classList.remove('show');
    }
  });

  toTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// === FORCE TO TOP CLICK ===
(function(){
  const btn = document.getElementById('toTop');
  if (!btn) return;

  btn.style.display = 'flex';

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
