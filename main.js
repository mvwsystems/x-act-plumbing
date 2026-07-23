/* ============================================================
   X-ACT PLUMBING — main.js
   Nav scroll, mobile menu, reveal animations, Retell AI init
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Nav: Scrolled state ── */
  const nav = document.querySelector('.nav');
  function updateNav() {
    if (window.scrollY > 30) {
      nav?.classList.add('scrolled');
    } else {
      nav?.classList.remove('scrolled');
    }
  }
  updateNav();
  window.addEventListener('scroll', updateNav, { passive: true });

  /* ── Mobile Nav ── */
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileNav = document.querySelector('.nav-mobile');

  hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileNav?.classList.toggle('open');
    document.body.style.overflow = mobileNav?.classList.contains('open') ? 'hidden' : '';
  });

  // Close mobile nav on link click
  document.querySelectorAll('.nav-mobile a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger?.classList.remove('open');
      mobileNav?.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* ── Active nav link ── */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .nav-mobile a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ── Scroll Reveal ── */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    reveals.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback for older browsers
    reveals.forEach(el => el.classList.add('visible'));
  }

  /* ── Counter animation ── */
  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(ease * target);
      el.textContent = current.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  const counters = document.querySelectorAll('[data-target]');
  if (counters.length && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => counterObserver.observe(el));
  }

  /* ── Retell AI Web Call Widget ── */
  // Replace YOUR_RETELL_AGENT_ID with your actual Retell agent ID
  // The widget script is loaded from Retell's CDN
  // See: https://docs.retellai.com/make-calls/web-call
  const RETELL_AGENT_ID = 'YOUR_RETELL_AGENT_ID'; // ← Replace this

  // Load Retell SDK dynamically
  function loadRetell() {
    if (typeof RetellWebClient !== 'undefined') {
      initRetell();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.retellai.com/sdk/web-client/retell-web-client.js';
    script.onload = initRetell;
    document.head.appendChild(script);
  }

  function initRetell() {
    if (RETELL_AGENT_ID === 'YOUR_RETELL_AGENT_ID') return; // Don't init if placeholder

    const retellClient = new RetellWebClient();

    const triggerBtn = document.getElementById('retell-trigger');
    if (!triggerBtn) return;

    let isCallActive = false;

    triggerBtn.addEventListener('click', async () => {
      if (isCallActive) {
        retellClient.stopCall();
        return;
      }

      try {
        // Register a web call and get access token from your backend
        // or use Retell's direct approach if you've set it up
        triggerBtn.textContent = 'Connecting...';
        triggerBtn.disabled = true;

        const response = await fetch('/api/create-web-call', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agent_id: RETELL_AGENT_ID })
        });

        const { access_token } = await response.json();

        await retellClient.startCall({ accessToken: access_token });
        isCallActive = true;
        triggerBtn.disabled = false;
        triggerBtn.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
          </svg>
          End Call`;

      } catch (err) {
        console.error('Retell call error:', err);
        triggerBtn.textContent = 'Talk to Chloe';
        triggerBtn.disabled = false;
      }
    });

    retellClient.on('call_ended', () => {
      isCallActive = false;
      triggerBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
        </svg>
        Talk to Chloe`;
    });
  }

  loadRetell();

  /* ── Blog / Guide article enhancements ── */
  const article = document.querySelector('main .dark-panel, main .faq-section');
  if (article) {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Reading-progress bar
    if (!reduceMotion) {
      const progress = document.createElement('div');
      progress.className = 'reading-progress';
      document.body.appendChild(progress);

      const updateProgress = () => {
        const doc = document.documentElement;
        const scrollable = doc.scrollHeight - doc.clientHeight;
        const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
        progress.style.transform = `scaleX(${Math.min(ratio, 1)})`;
      };
      updateProgress();
      window.addEventListener('scroll', updateProgress, { passive: true });
      window.addEventListener('resize', updateProgress, { passive: true });
    }

    // Staggered scroll-reveal for article blocks (reuses the .reveal system)
    const blocks = document.querySelectorAll(
      'main .dark-panel, main .faq-section, main .cta-section'
    );
    if ('IntersectionObserver' in window && !reduceMotion) {
      const blockObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            blockObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

      blocks.forEach((el, i) => {
        el.classList.add('reveal');
        el.classList.add('reveal-delay-' + ((i % 3) + 1));
        blockObserver.observe(el);
      });
    } else {
      blocks.forEach(el => el.classList.add('visible'));
    }

    // FAQ accordion (progressive enhancement — content stays in the DOM)
    document.querySelectorAll('.faq-section').forEach(section => {
      const items = section.querySelectorAll('.faq-item');
      if (!items.length) return;
      section.classList.add('faq-enhanced');

      const setOpen = (item, wrap, heading, open, animate) => {
        item.classList.toggle('open', open);
        heading.setAttribute('aria-expanded', open ? 'true' : 'false');

        if (!animate || reduceMotion) {
          wrap.style.height = open ? 'auto' : '0px';
          return;
        }

        if (open) {
          wrap.style.height = wrap.scrollHeight + 'px';
          wrap.addEventListener('transitionend', function done(e) {
            if (e.propertyName === 'height') {
              wrap.style.height = 'auto'; // let it reflow naturally once open
              wrap.removeEventListener('transitionend', done);
            }
          });
        } else {
          // From auto → fixed px, then to 0 so the browser can animate it
          wrap.style.height = wrap.scrollHeight + 'px';
          requestAnimationFrame(() => { wrap.style.height = '0px'; });
        }
      };

      items.forEach((item, index) => {
        const heading = item.querySelector('h3');
        const answer = item.querySelector('p');
        if (!heading || !answer) return;

        // Wrap the answer so its height can be animated
        const wrap = document.createElement('div');
        wrap.className = 'faq-answer';
        answer.parentNode.insertBefore(wrap, answer);
        wrap.appendChild(answer);

        // Accessibility: expose the heading as a real toggle button
        const answerId = 'faq-a-' + index;
        wrap.id = answerId;
        heading.setAttribute('role', 'button');
        heading.setAttribute('tabindex', '0');
        heading.setAttribute('aria-controls', answerId);

        // First question open by default, the rest collapsed
        setOpen(item, wrap, heading, index === 0, false);

        const toggle = () => setOpen(item, wrap, heading, !item.classList.contains('open'), true);

        heading.addEventListener('click', toggle);
        heading.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
          }
        });
      });
    });
  }

  /* ── Smooth scroll for anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

});
