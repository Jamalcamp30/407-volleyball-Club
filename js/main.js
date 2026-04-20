/* ============================================
   407 VOLLEYBALL CLUB — MAIN.JS
   ============================================ */

'use strict';

// ─── 0. Data ─────────────────────────────────────────────
// Commitment Wall. Each entry renders a card in #commitments-grid.
// Optional per-athlete fields (athleteName, initials, quote, storyUrl)
// render the enriched "recruiting magnet" card; omit them to show the
// original compact card.
const commits = [
  {
    school: 'BAYLOR',
    schoolColor: '#003878',
    division: 'NCAA DI',
    team: '18 Orange',
    story: 'Built in the 407. Headed to Waco, TX.',
    athleteName: 'Jade Williams',
    initials: 'JW',
    position: 'Middle',
    classYear: '2025',
    quote: 'The 407 system built the player I am today. Sic \u2019em.'
  },
  { school: 'COKER',              schoolColor: '#8B0000', division: 'NCAA DII',  team: '17 Orange', story: 'From 407 courts to Hartsville, SC.' },
  { school: 'WASHINGTON & LEE',   schoolColor: '#1A4785', division: 'NCAA DIII', team: '17 Blue',   story: 'The 407 signal reaches Lexington, VA.' },
  { school: 'DENISON',            schoolColor: '#C8102E', division: 'NCAA DIII', team: '16 Orange', story: '407 trained. Denison bound.' },
  { school: 'CUMBERLAND',         schoolColor: '#003C8B', division: 'NAIA',      team: '16 Blue',   story: 'From Ocoee courts to Lebanon, TN.' },
  { school: 'JOHNSON & WALES',    schoolColor: '#006B3F', division: 'NCAA DIII', team: '15 White',  story: 'The 407 frequency. Heard in Providence.' },
  { school: 'PENSACOLA CHRISTIAN', schoolColor: '#5B2D8E', division: 'NCCAA',    team: '15 Orange', story: '407 built. Pensacola bound.' },
  { school: 'BAPTIST UNIVERSITY FL', schoolColor: '#003D7C', division: 'NCCAA', team: '14 White',  story: 'The 407 path reaches Graceville.' }
];

// Tournament schedule. Populate with real events to fill #tournaments-grid.
// Shape: { name, date (ISO yyyy-mm-dd or 'yyyy-mm-dd/yyyy-mm-dd'), location, teams: [string], division, link? }
// When empty, a graceful empty state is rendered instead of fabricated dates.
const tournaments = [
  // Example:
  // { name: 'AAU Sunshine Regional', date: '2026-02-14/2026-02-15', location: 'Orlando, FL',
  //   teams: ['17 Orange', '16 Orange'], division: 'Club', link: 'https://example.com' }
];

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

  function fireIntroDone() {
    document.dispatchEvent(new CustomEvent('407:intro-done'));
  }

  if (!intro) {
    // No overlay in DOM — treat as already done.
    document.body.classList.remove('loading');
    fireIntroDone();
    return;
  }

  // Respect reduced motion preference — skip immediately
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    intro.remove();
    document.body.classList.remove('loading');
    fireIntroDone();
    return;
  }

  const canvas = initIntroCanvas();
  let introDone = false;

  function completeIntro() {
    if (introDone) return;
    introDone = true;
    intro.classList.add('phase-exit');
    setTimeout(() => {
      intro.remove();
      document.body.classList.remove('loading');
      canvas && canvas.stop();
      fireIntroDone();
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
  if (!('IntersectionObserver' in window)) {
    // Fallback: just render final values so they aren't stuck at "0".
    document.querySelectorAll('[data-count]').forEach(el => {
      const target = parseInt(el.dataset.count, 10);
      if (!isNaN(target)) el.textContent = target;
    });
    return;
  }

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
  }, { threshold: 0.1 });

  // Defer observation until the intro overlay is out of the way so the
  // tween is visible to the user rather than completing behind the
  // overlay. If the intro is already done (no overlay / reduced motion),
  // observe immediately.
  function observeAll() {
    targets.forEach(el => observer.observe(el));
  }
  // If the intro overlay is still on the page, defer the tween until it
  // exits so users actually see the count-up. Otherwise (reduced motion
  // path already removed the overlay synchronously, or it never existed),
  // start immediately.
  if (document.getElementById('intro')) {
    document.addEventListener('407:intro-done', observeAll, { once: true });
    // Safety net: if for some reason the event never fires, start after a
    // generous timeout so counters never stay stuck at 0.
    setTimeout(observeAll, 7000);
  } else {
    observeAll();
  }
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

// ─── 15. Commitments (data-driven) ───────────────────────
function escapeHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function initCommitments() {
  const grid = document.getElementById('commitments-grid');
  if (!grid || !Array.isArray(commits)) return;

  grid.innerHTML = commits.map((c, i) => {
    const delay = i * 80;
    const schoolColor = c.schoolColor || '#FF6B00';
    const enriched = c.athleteName || c.quote || c.storyUrl || c.initials;

    const photo = c.initials
      ? `<div class="commit-photo" aria-hidden="true"><span>${escapeHtml(c.initials)}</span></div>`
      : '';

    const athlete = c.athleteName
      ? `<div class="commit-athlete">
           <div class="commit-athlete-name">${escapeHtml(c.athleteName)}</div>
           <div class="commit-athlete-meta">${escapeHtml([c.position, c.classYear && `Class ${c.classYear}`].filter(Boolean).join(' \u00b7 '))}</div>
         </div>`
      : '';

    const quote = c.quote
      ? `<blockquote class="commit-quote">${escapeHtml(c.quote)}</blockquote>`
      : '';

    const storyLink = c.storyUrl
      ? `<a class="commit-story-link" href="${escapeHtml(c.storyUrl)}">Read her story →</a>`
      : '';

    return `
      <div class="commit-card reveal-el${enriched ? ' commit-card-enriched' : ''}" data-delay="${delay}" style="--school-color:${escapeHtml(schoolColor)}">
        <div class="commit-stamp">COMMITTED</div>
        ${photo}
        <div class="commit-school">${escapeHtml(c.school || '')}</div>
        <div class="commit-div">${escapeHtml(c.division || '')}</div>
        <div class="commit-team">${escapeHtml(c.team || '')}</div>
        ${athlete}
        ${quote}
        ${c.story ? `<div class="commit-story">${escapeHtml(c.story)}</div>` : ''}
        ${storyLink}
      </div>
    `;
  }).join('');

  // Update total counter data-count to reflect actual list length.
  const total = document.querySelector('.total-num[data-count]');
  if (total) total.setAttribute('data-count', String(commits.length));
}

// ─── 16. Tournament Schedule (data-driven) ───────────────
const MONTHS_SHORT = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

function parseTournamentDate(dateStr) {
  if (!dateStr) return null;
  const [startStr, endStr] = String(dateStr).split('/');
  const start = new Date(startStr + 'T00:00:00');
  if (isNaN(start.getTime())) return null;
  const end = endStr ? new Date(endStr + 'T00:00:00') : null;
  return { start, end: end && !isNaN(end.getTime()) ? end : null };
}

function formatTournamentDate(parsed) {
  if (!parsed) return '';
  const { start, end } = parsed;
  const sMonth = MONTHS_SHORT[start.getMonth()];
  const sDay = start.getDate();
  const year = start.getFullYear();
  if (!end) return `${sMonth} ${sDay}, ${year}`;
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${sMonth} ${sDay}\u2013${end.getDate()}, ${year}`;
  }
  return `${sMonth} ${sDay} \u2013 ${MONTHS_SHORT[end.getMonth()]} ${end.getDate()}, ${year}`;
}

function initTournaments() {
  const grid = document.getElementById('tournaments-grid');
  if (!grid || !Array.isArray(tournaments)) return;

  if (tournaments.length === 0) {
    grid.innerHTML = `
      <div class="tournaments-empty">
        <div class="tournaments-empty-eyebrow">SCHEDULE DROPS SOON</div>
        <p>The 407 tournament schedule is being finalized. Check back shortly \u2014 or <a href="#contact">get on the tryout list</a> and we'll send it straight to you.</p>
      </div>
    `;
    return;
  }

  // Sort chronologically; undated entries sink to the bottom.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const rows = tournaments
    .map(t => ({ t, parsed: parseTournamentDate(t.date) }))
    .sort((a, b) => {
      if (!a.parsed) return 1;
      if (!b.parsed) return -1;
      return a.parsed.start - b.parsed.start;
    });

  grid.innerHTML = rows.map(({ t, parsed }, i) => {
    const delay = i * 80;
    const dateLabel = escapeHtml(formatTournamentDate(parsed) || t.date || 'TBD');
    const isPast = parsed && parsed.start < today && (!parsed.end || parsed.end < today);
    const teams = Array.isArray(t.teams) && t.teams.length
      ? `<div class="tournament-teams">${t.teams.map(team => `<span class="tournament-team-tag">${escapeHtml(team)}</span>`).join('')}</div>`
      : '';
    const name = t.link
      ? `<a class="tournament-name" href="${escapeHtml(t.link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t.name || '')}</a>`
      : `<div class="tournament-name">${escapeHtml(t.name || '')}</div>`;

    return `
      <div class="tournament-card reveal-el${isPast ? ' tournament-past' : ''}" data-delay="${delay}">
        <div class="tournament-date">${dateLabel}</div>
        ${name}
        <div class="tournament-meta">
          ${t.location ? `<span class="tournament-location">${escapeHtml(t.location)}</span>` : ''}
          ${t.division ? `<span class="tournament-division">${escapeHtml(t.division)}</span>` : ''}
        </div>
        ${teams}
      </div>
    `;
  }).join('');
}

// ─── Initialize All ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Render data-driven sections first so the scroll/reveal/count observers
  // pick up the freshly inserted nodes.
  initCommitments();
  initTournaments();

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
