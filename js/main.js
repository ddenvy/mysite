// ============================================================
//  PARTICLES — Ghibli-style floating spores
// ============================================================
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let W, H;
let particles = [];
let mouseX = -1000, mouseY = -1000;

function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
window.addEventListener('resize', resize);
resize();

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * W; this.y = Math.random() * H;
    this.vx = (Math.random() - 0.5) * 0.3; this.vy = (Math.random() - 0.5) * 0.3 - 0.15;
    this.size = Math.random() * 2.5 + 0.5; this.opacity = Math.random() * 0.5 + 0.1;
    this.pulse = Math.random() * Math.PI * 2; this.pulseSpeed = Math.random() * 0.02 + 0.005;
  }
  update() {
    const dx = this.x - mouseX, dy = this.y - mouseY, dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < 150) { const f = (150 - dist) / 150 * 0.8; this.vx += (dx/dist) * f; this.vy += (dy/dist) * f; }
    this.vx *= 0.98; this.vy *= 0.98;
    this.vx += (Math.random() - 0.5) * 0.02; this.vy += (Math.random() - 0.5) * 0.02 - 0.005;
    this.x += this.vx; this.y += this.vy; this.pulse += this.pulseSpeed;
    if (this.x < -10) this.x = W + 10; if (this.x > W + 10) this.x = -10;
    if (this.y < -10) this.y = H + 10; if (this.y > H + 10) this.y = -10;
  }
  draw() {
    const o = this.opacity * (0.6 + 0.4 * Math.sin(this.pulse));
    const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 3);
    g.addColorStop(0, `rgba(212,167,106,${o})`); g.addColorStop(0.3, `rgba(212,167,106,${o*0.3})`); g.addColorStop(1, 'rgba(212,167,106,0)');
    ctx.beginPath(); ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
    ctx.beginPath(); ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2); ctx.fillStyle = `rgba(255,235,200,${o*0.8})`; ctx.fill();
  }
}
for (let i = 0; i < 60; i++) particles.push(new Particle());
(function animate() { ctx.clearRect(0,0,W,H); for (const p of particles) { p.update(); p.draw(); } requestAnimationFrame(animate); })();
document.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });

// ============================================================
//  CUSTOM CURSOR
// ============================================================
const cursorGlow = document.getElementById('cursorGlow');
const cursorDot = document.getElementById('cursorDot');
let cursorX = 0, cursorY = 0, glowX = 0, glowY = 0;
(function animateCursor() {
  glowX += (cursorX - glowX) * 0.08; glowY += (cursorY - glowY) * 0.08;
  cursorGlow.style.left = glowX + 'px'; cursorGlow.style.top = glowY + 'px';
  cursorDot.style.left = cursorX + 'px'; cursorDot.style.top = cursorY + 'px';
  requestAnimationFrame(animateCursor);
})();
document.addEventListener('mousemove', (e) => { cursorX = e.clientX; cursorY = e.clientY; });

document.querySelectorAll('button, a, [data-magnetic]').forEach(el => {
  el.addEventListener('mouseenter', () => { cursorGlow.classList.add('hover'); cursorDot.classList.add('hover'); });
  el.addEventListener('mouseleave', () => { cursorGlow.classList.remove('hover'); cursorDot.classList.remove('hover'); });
});

// ============================================================
//  MAGNETIC BUTTONS
// ============================================================
document.querySelectorAll('[data-magnetic]').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x*0.3}px, ${y*0.3}px)`;
    btn.style.setProperty('--mx', `${(e.clientX - rect.left) / rect.width * 100}%`);
    btn.style.setProperty('--my', `${(e.clientY - rect.top) / rect.height * 100}%`);
  });
  btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
});

// ============================================================
//  CENTER MODALS
// ============================================================
const modals = document.querySelectorAll('.modal');
// Auto-open resume modal when clicking hero resume link
document.querySelectorAll('.h-contact[data-panel]').forEach(el => {
  el.addEventListener('click', () => openModal(el.dataset.panel));
});
const backdrop = document.getElementById('modalBackdrop');
const hero = document.getElementById('mainHero');
const navBtns = document.querySelectorAll('.nav-btn');

function openModal(id) {
  // close any open
  closeAllModals();
  const modal = document.getElementById('modal-' + id);
  if (!modal) return;
  modal.classList.add('active');
  backdrop.classList.add('active');
  hero.style.filter = 'blur(4px)';
  // highlight active nav button
  navBtns.forEach(btn => { if (btn.dataset.panel === id) btn.classList.add('active'); else btn.classList.remove('active'); });
  // scramble text
  modal.querySelectorAll('[data-scramble]').forEach(el => scrambleText(el));
}

function closeAllModals() {
  modals.forEach(m => m.classList.remove('active'));
  backdrop.classList.remove('active');
  hero.style.filter = 'none';
  navBtns.forEach(btn => btn.classList.remove('active'));
}

// Nav button click
document.querySelectorAll('[data-panel]').forEach(btn => {
  btn.addEventListener('click', () => openModal(btn.dataset.panel));
});

// Close buttons
document.querySelectorAll('[data-close]').forEach(btn => {
  btn.addEventListener('click', closeAllModals);
});

// Backdrop click
backdrop.addEventListener('click', closeAllModals);

// Escape key
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAllModals(); });

// ============================================================
//  TEXT SCRAMBLE
// ============================================================
const SCRAMBLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
function scrambleText(el) {
  const final = el._finalText || el.textContent;
  el._finalText = final;
  if (el.classList.contains('scrambled')) return;
  el.classList.add('scrambled');
  let iter = 0;
  const iv = setInterval(() => {
    el.textContent = final.split('').map((c, i) => {
      if (c === ' ' || c === '\u00b7' || c === '–' || c === '·') return c;
      if (i < iter) return final[i];
      return SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)];
    }).join('');
    iter++;
    if (iter > final.length) { clearInterval(iv); el.textContent = final; }
  }, 25);
}

window.addEventListener('load', () => {
  setTimeout(() => { document.querySelectorAll('[data-scramble]').forEach(el => scrambleText(el)); }, 500);
});

// ============================================================
//  PARALLAX BACKGROUND
// ============================================================
const bgFixed = document.getElementById('bgFixed');
let tX = 0, tY = 0, cX = 0, cY = 0;
document.addEventListener('mousemove', (e) => { tX = (e.clientX/W - 0.5) * 15; tY = (e.clientY/H - 0.5) * 15; });
(function animateParallax() { cX += (tX - cX) * 0.05; cY += (tY - cY) * 0.05; bgFixed.style.transform = `scale(1.05) translate(${cX}px,${cY}px)`; requestAnimationFrame(animateParallax); })();

// ============================================================
//  EDUCATION CORNER ANIMATION
// ============================================================
const eduCard = document.getElementById('eduCard');
if (eduCard) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        eduCard.querySelectorAll('path').forEach((path, i) => {
          path.style.transition = `stroke-dashoffset 0.8s ${i*0.15}s ease`; path.style.strokeDashoffset = '0';
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  observer.observe(eduCard);
}
