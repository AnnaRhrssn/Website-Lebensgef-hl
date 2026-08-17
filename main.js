/* =============================================
   LEBENSGEFÜHL – main.js
   GSAP + ScrollTrigger + Lenis + Particles
   ============================================= */

/* ── Preloader ── */
function initPreloader() {
  const preloader = document.getElementById('preloader');
  const logo      = document.querySelector('.preloader-logo');
  if (!preloader) return;

  gsap.to(logo, { opacity: 1, y: 0, duration: 0.6, delay: 0.1, ease: 'power2.out' });

  window.addEventListener('load', () => {
    gsap.timeline({ delay: 0.3 })
      .to(preloader, { opacity: 0, duration: 0.4, ease: 'power2.inOut', onComplete() { preloader.remove(); } });
  });
}

/* ── Lenis Smooth Scroll ── */
function initLenis() {
  if (typeof Lenis === 'undefined') return;
  const lenis = new Lenis({ lerp: 0.08, smoothWheel: true, syncTouch: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(time => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  window.lenis = lenis;
}

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
      document.body.style.overflow = 'hidden'; // Body-Scroll sperren
      if (window.lenis) window.lenis.stop();    // Lenis pausieren → Menü scrollt frei
    };
    const closeMenu = () => {
      menu.classList.remove('open');
      document.body.style.overflow = '';        // Body-Scroll freigeben
      if (window.lenis) window.lenis.start();   // Lenis wieder aktivieren
    };
    burger.addEventListener('click', () => menu.classList.contains('open') ? closeMenu() : openMenu());
    close && close.addEventListener('click', closeMenu);
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  }
}

/* ── Hero Animation ── */
function initHero() {
  const lines   = document.querySelectorAll('.hero-line-inner');
  const eyebrow = document.querySelector('.hero-eyebrow');
  const sub     = document.querySelector('.hero-sub');
  const actions = document.querySelector('.hero-actions');
  if (!lines.length) return;

  // Sofort sichtbar – kein Delay, keine Animation
  gsap.set(eyebrow, { opacity: 1, y: 0 });
  gsap.set(lines,   { y: '0%' });
  gsap.set(sub,     { opacity: 1, y: 0 });
  gsap.set(actions, { opacity: 1, y: 0 });
}

/* ── Magnetic Buttons – deactivated (buttons should not move) ── */
function initMagnetic() {
  // Intentionally empty – CTAs use CSS-only hover (background color change)
}

/* ── Scroll Reveal ── */
function initScrollReveal() {
  // Generic reveals
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

  // Staggered card reveals
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

  // Process steps
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

  // Hero parallax – element starts 120px above the section (see CSS top: -120px)
  // animate y from 0 to +120px so it drifts down as user scrolls (parallax effect)
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

/* ── Split Text (manual line split for section titles) ── */
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

/* ── Smooth Anchor Scroll ── */
function initAnchorScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      if (window.lenis) {
        window.lenis.scrollTo(target, { offset: -80, duration: 1.4 });
      } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
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

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  initPreloader();
  initLenis();
  initParticles();
  initNav();
  initHero();
  initMagnetic();
  initScrollReveal();
  initParallax();
  initCounters();
  initTextReveal();
  initAnchorScroll();
  initWhatsAppScroll();
});
