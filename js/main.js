/* ============================================
   407 VOLLEYBALL CLUB — MAIN.JS
   ============================================ */

'use strict';

// ─── 1. IntroCanvas ──────────────────────────────────────
class SeamLine {
  constructor(canvas) {
    this.cx = canvas.width / 2;
    this.cy = canvas.height / 2;
    this.radius = 60 + Math.random() * 90;
    this.angle = Math.random() * Math.PI * 2;
    this.speed = (0.005 + Math.random() * 0.015) * (Math.random() > 0.5 ? 1 : -1);
    this.arcLen = Math.PI * (0.3 + Math.random() * 0.5);
    this.opacity = 0.15 + Math.random() * 0.35;
    this.width = 0.5 + Math.random() * 1.5;
  }

  draw(ctx) {
    ctx.save();
    ctx.strokeStyle = `rgba(255,107,0,${this.opacity})`;
    ctx.lineWidth = this.width;
    ctx.beginPath();
    ctx.arc(this.cx, this.cy, this.radius, this.angle, this.angle + this.arcLen);
    ctx.stroke();
    ctx.restore();
    this.angle += this.speed;
  }
}

class EnergyTrace {
  constructor(canvas) {
    this.reset(canvas);
  }

  reset(canvas) {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 3;
    this.vy = (Math.random() - 0.5) * 3;
    this.life = 0;
    this.maxLife = 60 + Math.random() * 80;
    this.size = 1 + Math.random() * 2;
    this.canvas = canvas;
  }

  draw(ctx) {
    this.life++;
    const progress = this.life / this.maxLife;
    const opacity = progress < 0.3
      ? progress / 0.3 * 0.6
      : (1 - progress) * 0.6;

    ctx.save();
    ctx.fillStyle = `rgba(255,107,0,${opacity})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.98;
    this.vy *= 0.98;

    if (this.life >= this.maxLife ||
        this.x < 0 || this.x > this.canvas.width ||
        this.y < 0 || this.y > this.canvas.height) {
      this.reset(this.canvas);
    }
  }
}

class RadarSweep {
  constructor(canvas) {
    this.cx = canvas.width / 2;
    this.cy = canvas.height / 2;
    this.angle = 0;
    this.speed = 0.02;
    this.radius = Math.min(canvas.width, canvas.height) * 0.42;
  }

  draw(ctx) {
    // Ghost trail arc
    ctx.save();
    const trailGrad = ctx.createLinearGradient(
      this.cx + Math.cos(this.angle - 0.8) * this.radius * 0.5,
      this.cy + Math.sin(this.angle - 0.8) * this.radius * 0.5,
      this.cx + Math.cos(this.angle) * this.radius * 0.5,
      this.cy + Math.sin(this.angle) * this.radius * 0.5
    );
    trailGrad.addColorStop(0, 'rgba(255,107,0,0)');
    trailGrad.addColorStop(1, 'rgba(255,107,0,0.12)');

    ctx.strokeStyle = trailGrad;
    ctx.lineWidth = this.radius;
    ctx.beginPath();
    ctx.arc(this.cx, this.cy, this.radius / 2, this.angle - 0.8, this.angle);
    ctx.stroke();
    ctx.restore();

    // Sweep line
    ctx.save();
    ctx.strokeStyle = 'rgba(255,107,0,0.8)';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(255,107,0,0.5)';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(this.cx, this.cy);
    ctx.lineTo(
      this.cx + Math.cos(this.angle) * this.radius,
      this.cy + Math.sin(this.angle) * this.radius
    );
    ctx.stroke();
    ctx.restore();

    // Center dot
    ctx.save();
    ctx.fillStyle = 'rgba(255,107,0,0.6)';
    ctx.beginPath();
    ctx.arc(this.cx, this.cy, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    this.angle += this.speed;
    if (this.angle > Math.PI * 2) this.angle -= Math.PI * 2;
  }
}

function initIntroCanvas() {
  const canvas = document.getElementById('intro-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let rafId = null;
  let isRunning = false;

  const seams = [];
  const traces = [];
  let sweep = null;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    seams.length = 0;
    traces.length = 0;

    const count = Math.min(12, Math.floor(window.innerWidth / 120));
    for (let i = 0; i < count; i++) seams.push(new SeamLine(canvas));
    for (let i = 0; i < 18; i++) traces.push(new EnergyTrace(canvas));
    sweep = new RadarSweep(canvas);
  }

  function tick() {
    if (!isRunning) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    seams.forEach(s => s.draw(ctx));
    traces.forEach(t => t.draw(ctx));
    if (sweep) sweep.draw(ctx);

    rafId = requestAnimationFrame(tick);
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });

  return {
    start() {
      isRunning = true;
      tick();
    },
    stop() {
      isRunning = false;
      if (rafId) cancelAnimationFrame(rafId);
    }
  };
}

// ─── 2. IntroSequencer ───────────────────────────────────
function initIntroSequencer() {
  const intro = document.getElementById('intro');
  const skipBtn = document.getElementById('intro-skip');
  if (!intro) return;

  // Respect reduced motion preference — skip immediately
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    intro.remove();
    document.body.classList.remove('loading');
    return;
  }

  const canvas = initIntroCanvas();

  function completeIntro() {
    intro.classList.add('phase-exit');
    setTimeout(() => {
      intro.remove();
      document.body.classList.remove('loading');
      canvas && canvas.stop();
    }, 900);
  }

  // Sequence
  const timers = [];

  timers.push(setTimeout(() => {
    canvas && canvas.start();
  }, 0));

  timers.push(setTimeout(() => {
    intro.classList.add('phase-lines');
  }, 300));

  timers.push(setTimeout(() => {
    intro.classList.add('phase-407');
  }, 1500));

  timers.push(setTimeout(() => {
    intro.classList.add('phase-text');
  }, 2800));

  timers.push(setTimeout(() => {
    completeIntro();
  }, 5200));

  // Skip button
  if (skipBtn) {
    skipBtn.addEventListener('click', () => {
      timers.forEach(t => clearTimeout(t));
      completeIntro();
    });
  }
}

// ─── 3. ScrollReveal ─────────────────────────────────────
function initScrollReveal() {
  if (!('IntersectionObserver' in window)) {
    // Fallback: show all elements immediately
    document.querySelectorAll('.reveal-el, .reveal-left, .reveal-right').forEach(el => {
      el.classList.add('revealed');
    });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const delay = parseInt(el.dataset.delay || '0', 10);
      setTimeout(() => {
        el.classList.add('revealed');
      }, delay);
      observer.unobserve(el);
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.reveal-el, .reveal-left, .reveal-right').forEach(el => {
    observer.observe(el);
  });
}

// ─── 4. CountUp ──────────────────────────────────────────
function countUp(el, target, duration) {
  const start = performance.now();
  const ease = t => 1 - Math.pow(1 - t, 3); // easeOutCubic

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    el.textContent = Math.round(ease(progress) * target);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function initCountUp() {
  if (!('IntersectionObserver' in window)) return;

  const targets = document.querySelectorAll('[data-count]');
  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      if (isNaN(target)) return;
      countUp(el, target, 1500);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  targets.forEach(el => observer.observe(el));
}

// ─── 5. HeroParallax ─────────────────────────────────────
function initHeroParallax() {
  const ghost = document.querySelector('.hero-ghost-407');
  if (!ghost) return;

  let ticking = false;

  document.addEventListener('mousemove', (e) => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const x = (e.clientX / window.innerWidth - 0.5) * 40;
      const y = (e.clientY / window.innerHeight - 0.5) * 25;
      ghost.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
      ticking = false;
    });
  });
}

// ─── 6. NavScroll ────────────────────────────────────────
function initNavScroll() {
  const nav = document.getElementById('site-nav');
  if (!nav) return;

  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      nav.classList.toggle('scrolled', window.scrollY > 50);
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ─── 7. MobileMenu ───────────────────────────────────────
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('site-nav');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!hamburger || !nav || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('menu-open');
    hamburger.setAttribute('aria-expanded', isOpen.toString());
    mobileMenu.setAttribute('aria-hidden', (!isOpen).toString());
  });

  // Close on nav link click
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('menu-open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && nav.classList.contains('menu-open')) {
      nav.classList.remove('menu-open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
    }
  });
}

// ─── 8. RecruiterMode ────────────────────────────────────
function initRecruiterMode() {
  const btns = [
    document.getElementById('btn-recruiter'),
    document.getElementById('btn-recruiter-mobile'),
    document.getElementById('btn-path-recruiter')
  ];
  const filterBar = document.getElementById('recruiter-filter-bar');

  function toggle() {
    document.body.classList.toggle('recruiter-mode');
    const isActive = document.body.classList.contains('recruiter-mode');

    document.querySelectorAll('.btn-recruiter').forEach(b => {
      b.setAttribute('aria-pressed', isActive.toString());
      const dot = b.querySelector('.recruiter-dot');
      const dotHTML = dot ? `<span class="recruiter-dot"></span> ` : '';
      b.innerHTML = dotHTML + (isActive ? '✕ EXIT RECRUITER' : 'RECRUITER MODE');
      if (!dot && !isActive) {
        // Re-inject dot element
        b.innerHTML = `<span class="recruiter-dot"></span> RECRUITER MODE`;
      }
    });

    if (filterBar) {
      filterBar.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    }

    if (isActive) {
      setTimeout(() => {
        const athletes = document.getElementById('athletes');
        if (athletes) athletes.scrollIntoView({ behavior: 'smooth' });
      }, 120);
    }
  }

  btns.forEach(btn => {
    if (!btn) return;
    btn.addEventListener('click', toggle);
  });

  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      document.querySelectorAll('.athlete-card').forEach(card => {
        if (filter === 'all' || card.dataset.pos === filter) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// ─── 9. ParentMode ───────────────────────────────────────
function initParentMode() {
  const btns = [
    document.getElementById('btn-parent-view'),
    document.getElementById('btn-parent-view-mobile'),
    document.getElementById('btn-path-parent')
  ];
  const parentSection = document.getElementById('parent-essentials');

  function toggle() {
    document.body.classList.toggle('parent-mode');
    const isActive = document.body.classList.contains('parent-mode');

    document.querySelectorAll('.btn-parent-view').forEach(b => {
      b.setAttribute('aria-pressed', isActive.toString());
      b.innerHTML = `<span class="parent-icon">◎</span> ${isActive ? 'EXIT PARENT VIEW' : 'PARENT VIEW'}`;
    });

    if (parentSection) {
      parentSection.setAttribute('aria-hidden', isActive ? 'false' : 'true');
      if (isActive) {
        parentSection.style.display = 'block';
        setTimeout(() => {
          parentSection.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        parentSection.style.display = '';
      }
    }
  }

  btns.forEach(btn => {
    if (!btn) return;
    btn.addEventListener('click', toggle);
  });
}

// ─── 10. ImpactRipple ────────────────────────────────────
function initImpactRipple() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.impact-btn');
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const size = Math.max(rect.width, rect.height) * 2;

    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${x - size / 2}px;
      top: ${y - size / 2}px;
    `;

    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });
}

// ─── 11. CommitmentReveal ────────────────────────────────
function initCommitmentReveal() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.commit-card').forEach(card => {
      card.classList.add('stamp-in');
    });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const card = entry.target;
      const delay = parseInt(card.dataset.delay || '0', 10);
      setTimeout(() => {
        card.classList.add('stamp-in');
      }, delay);
      observer.unobserve(card);
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.commit-card').forEach(card => {
    observer.observe(card);
  });
}

// ─── 12. FlightPathFill ──────────────────────────────────
function initFlightPathFill() {
  const track = document.getElementById('flight-path-track');
  if (!track) return;

  if (!('IntersectionObserver' in window)) {
    track.classList.add('fill-active');
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      track.classList.add('fill-active');
      observer.unobserve(track);
    });
  }, { threshold: 0.3 });

  observer.observe(track);
}

// ─── 13. CourtGridReveal ─────────────────────────────────
function initCourtGridReveal() {
  const grid = document.getElementById('court-grid');
  if (!grid) return;

  const blocks = grid.querySelectorAll('.court-block');
  if (!blocks.length) return;

  if (!('IntersectionObserver' in window)) {
    blocks.forEach(b => b.classList.add('animate-in'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      blocks.forEach((block, i) => {
        setTimeout(() => {
          block.classList.add('animate-in');
        }, i * 80);
      });
      observer.unobserve(grid);
    });
  }, { threshold: 0.25 });

  observer.observe(grid);
}

// ─── 14. ClubPulseReveal ─────────────────────────────────
function initClubPulseReveal() {
  const timeline = document.getElementById('pulse-timeline');
  if (!timeline) return;

  if (!('IntersectionObserver' in window)) {
    timeline.classList.add('pulse-active');
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      timeline.classList.add('pulse-active');

      // Animate event bars in sequence
      const events = timeline.querySelectorAll('.pulse-event');
      events.forEach((ev, i) => {
        ev.style.opacity = '0';
        ev.style.transform = 'translateY(8px)';
        ev.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        setTimeout(() => {
          ev.style.opacity = '';
          ev.style.transform = '';
        }, i * 80 + 200);
      });

      observer.unobserve(timeline);
    });
  }, { threshold: 0.2 });

  observer.observe(timeline);
}

// ─── Smooth Anchor Scroll ────────────────────────────────
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

// ─── Active Nav Highlight ────────────────────────────────
function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      navLinks.forEach(link => {
        const isActive = link.getAttribute('href') === `#${id}`;
        link.style.color = isActive ? 'var(--accent)' : '';
      });
    });
  }, {
    rootMargin: '-50% 0px -50% 0px',
    threshold: 0
  });

  sections.forEach(s => observer.observe(s));
}

// ─── Initialize All ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initIntroSequencer();
  initNavScroll();
  initMobileMenu();
  initScrollReveal();
  initCountUp();
  initHeroParallax();
  initRecruiterMode();
  initParentMode();
  initImpactRipple();
  initCommitmentReveal();
  initFlightPathFill();
  initCourtGridReveal();
  initClubPulseReveal();
  initSmoothScroll();
  initActiveNav();
});
