/* =============================================
   LEBENSGEFÜHL – main.js
   GSAP + ScrollTrigger + Particles
   (Lenis entfernt – CSS scroll-behavior: smooth reicht)
   ============================================= */

/* ── Hero Particle Canvas ── */
function initParticles() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  const colors = ['rgba(107,155,122,', 'rgba(196,151,90,', 'rgba(168,197,173,'];

  function Particle() {
    this.reset = function() {
      this.x    = Math.random() * W;
      this.y    = Math.random() * H;
      this.r    = Math.random() * 2.5 + 0.5;
      this.vx   = (Math.random() - 0.5) * 0.3;
      this.vy   = (Math.random() - 0.5) * 0.3 - 0.15;
      this.alpha = Math.random() * 0.5 + 0.1;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.life  = 0;
      this.maxLife = Math.random() * 300 + 150;
    };
    this.reset();
    this.life = Math.random() * this.maxLife;
  }

  for (let i = 0; i < 80; i++) particles.push(new Particle());

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.life++;
      if (p.life > p.maxLife) p.reset();
      const progress = p.life / p.maxLife;
      const a = p.alpha * Math.sin(Math.PI * progress);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + a + ')';
      ctx.fill();
      p.x += p.vx;
      p.y += p.vy;
    });
    requestAnimationFrame(draw);
  }
  draw();
}

/* ── Navigation ── */
function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  ScrollTrigger.create({
    start: 80,
    onEnter:     () => nav.classList.add('scrolled'),
    onLeaveBack: () => nav.classList.remove('scrolled'),
  });

  const burger = document.querySelector('.nav-burger');
  const menu   = document.querySelector('.mobile-menu');
  const close  = document.querySelector('.mobile-close');
  if (burger && menu) {
    const openMenu = () => {
      menu.classList.add('open');
      document.body.style.overflow = 'hidden';
    };
    const closeMenu = () => {
      menu.classList.remove('open');
      document.body.style.overflow = '';
    };
    burger.addEventListener('click', () => menu.classList.contains('open') ? closeMenu() : openMenu());
    close && close.addEventListener('click', closeMenu);
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  }
}

/* ── Magnetic Buttons – deactivated ── */
function initMagnetic() {}

/* ── Scroll Reveal ── */
function initScrollReveal() {
  gsap.utils.toArray('.reveal-up').forEach(el => {
    gsap.to(el, {
      opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
    });
  });
  gsap.utils.toArray('.reveal-left').forEach(el => {
    gsap.to(el, {
      opacity: 1, x: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
    });
  });
  gsap.utils.toArray('.reveal-right').forEach(el => {
    gsap.to(el, {
      opacity: 1, x: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
    });
  });
  gsap.utils.toArray('.reveal-fade').forEach(el => {
    gsap.to(el, {
      opacity: 1, duration: 0.9, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
    });
  });

  gsap.utils.toArray('.angebote-grid').forEach(grid => {
    gsap.from(grid.querySelectorAll('.angebot-card'), {
      opacity: 0, y: 50, duration: 0.8, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: grid, start: 'top 82%' }
    });
  });

  gsap.utils.toArray('.testimonials-grid').forEach(grid => {
    gsap.from(grid.querySelectorAll('.testimonial-card'), {
      opacity: 0, y: 40, duration: 0.7, stagger: 0.1, ease: 'power2.out',
      scrollTrigger: { trigger: grid, start: 'top 82%' }
    });
  });

  gsap.utils.toArray('.process-grid').forEach(grid => {
    gsap.from(grid.querySelectorAll('.process-step'), {
      opacity: 0, y: 30, duration: 0.7, stagger: 0.1, ease: 'power2.out',
      scrollTrigger: { trigger: grid, start: 'top 82%' }
    });
  });
}

/* ── Parallax ── */
function initParallax() {
  gsap.utils.toArray('[data-parallax]').forEach(el => {
    const speed = parseFloat(el.dataset.parallax) || 0.3;
    gsap.to(el, {
      y: () => -ScrollTrigger.maxScroll(window) * speed * 0.1,
      ease: 'none',
      scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });

  const heroBg = document.querySelector('.hero-bg-image');
  if (heroBg) {
    gsap.fromTo(heroBg,
      { y: 0 },
      {
        y: 120,
        ease: 'none',
        scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true }
      }
    );
  }
}

/* ── Counter Animation ── */
function initCounters() {
  document.querySelectorAll('.about-stat strong[data-count]').forEach(el => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      onEnter() {
        gsap.to({ val: 0 }, {
          val: target,
          duration: 1.8,
          ease: 'power2.out',
          onUpdate() {
            el.textContent = Math.round(this.targets()[0].val) + suffix;
          }
        });
      }
    });
  });
}

/* ── Split Text ── */
function initTextReveal() {
  document.querySelectorAll('.split-reveal').forEach(el => {
    const html = el.innerHTML;
    el.innerHTML = `<span class="split-inner" style="display:block;overflow:hidden"><span style="display:block;transform:translateY(100%)">${html}</span></span>`;
    gsap.to(el.querySelector('span > span'), {
      y: '0%', duration: 1, ease: 'power4.out',
      scrollTrigger: { trigger: el, start: 'top 88%' }
    });
  });
}

/* ── Smooth Anchor Scroll (CSS scroll-behavior, kein Lenis nötig) ── */
function initAnchorScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ── WhatsApp Button: erst beim Scrollen einblenden ── */
function initWhatsAppScroll() {
  var btn = document.querySelector('.whatsapp-btn');
  if (!btn) return;
  var threshold = 200;
  function toggle() {
    if (window.scrollY > threshold) {
      btn.classList.add('is-visible');
    } else {
      btn.classList.remove('is-visible');
    }
  }
  window.addEventListener('scroll', toggle, { passive: true });
  toggle();
}

/* ── Init ──
 * Kritisch (Nav): sofort → damit Hero-Bild gemalt werden kann.
 * Alles andere: erst nach zwei Animation-Frames, damit der Browser
 * den LCP-Kandidaten malen kann, BEVOR GSAP den Main-Thread belegt.
 */
document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  // Sofort: nur Navigation (kein Layout-Thrashing)
  initNav();
  initAnchorScroll();
  initWhatsAppScroll();

  // Nach zwei rAF-Frames: Browser hat LCP gemalt, jetzt schwere Inits
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      initScrollReveal();
      initParallax();
      initCounters();
      initTextReveal();
      initParticles();
    });
  });
});
