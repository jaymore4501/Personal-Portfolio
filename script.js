/* ═══════════════════════════════════════════════
   JAY MORE — FUTURISTIC PORTFOLIO
   Matrix System, Cursor FX, Scroll Reveals, Tilt
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── Globals ──
  const mouse = { x: -1000, y: -1000, clientX: -1000, clientY: -1000 };
  let rafId;

  // ═══════════════ MATRIX / GLITCH CANVAS ═══════════════
  class MatrixRain {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.columns = [];
      this.charSets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()_+-=[]{}|;:<>?/~`アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
      this.fontSize = 14;
      this.particles = [];
      this.maxParticles = 50;
      this.resize();
      this.init();
      window.addEventListener('resize', () => this.resize());
    }

    resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      const colCount = Math.floor(this.canvas.width / this.fontSize);
      // Preserve existing columns, add new ones if needed
      while (this.columns.length < colCount) {
        this.columns.push({
          y: Math.random() * this.canvas.height,
          speed: 0.3 + Math.random() * 0.8,
          opacity: 0.02 + Math.random() * 0.08,
          hue: Math.random() > 0.85 ? 185 : (Math.random() > 0.5 ? 265 : 280), // 85% violet, 15% cyan accent
          chars: [],
          lastChar: 0
        });
      }
      this.columns.length = colCount;
    }

    init() {
      // Floating particles
      for (let i = 0; i < this.maxParticles; i++) {
        this.particles.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          size: Math.random() * 2 + 0.5,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: (Math.random() - 0.5) * 0.3,
          opacity: Math.random() * 0.3 + 0.05,
          hue: Math.random() > 0.85 ? 185 : (Math.random() > 0.5 ? 265 : 280)
        });
      }
    }

    getChar() {
      return this.charSets[Math.floor(Math.random() * this.charSets.length)];
    }

    draw() {
      // Fade trail
      this.ctx.fillStyle = 'rgba(12, 10, 20, 0.12)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      this.ctx.font = `${this.fontSize}px 'JetBrains Mono', monospace`;

      // Draw columns
      for (let i = 0; i < this.columns.length; i++) {
        const col = this.columns[i];
        const x = i * this.fontSize;

        // Mouse repulsion
        const dx = x - mouse.clientX;
        const dy = col.y - mouse.clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const repelRadius = 180;
        let offsetX = 0;
        let offsetY = 0;
        let extraOpacity = 0;

        if (dist < repelRadius) {
          const force = (1 - dist / repelRadius) * 25;
          offsetX = (dx / dist) * force;
          offsetY = (dy / dist) * force;
          extraOpacity = (1 - dist / repelRadius) * 0.15;
        }

        // Draw character
        const alpha = col.opacity + extraOpacity;
        const hue = col.hue;
        const sat = hue < 200 ? '100%' : '80%';
        const light = hue < 200 ? '50%' : '60%';
        this.ctx.fillStyle = `hsla(${hue}, ${sat}, ${light}, ${alpha})`;

        const char = this.getChar();
        this.ctx.fillText(char, x + offsetX, col.y + offsetY);

        // Occasional brighter "leading" character
        if (Math.random() < 0.015) {
          this.ctx.fillStyle = `hsla(${hue}, 100%, 85%, ${alpha + 0.15})`;
          this.ctx.shadowColor = `hsla(${hue}, 100%, 70%, 0.6)`;
          this.ctx.shadowBlur = 12;
          this.ctx.fillText(char, x + offsetX, col.y + offsetY);
          this.ctx.shadowBlur = 0;
        }

        // Advance
        col.y += col.speed * this.fontSize * 0.15;

        // Reset
        if (col.y > this.canvas.height + 20) {
          col.y = -this.fontSize;
          col.speed = 0.3 + Math.random() * 0.8;
          col.opacity = 0.02 + Math.random() * 0.08;
          col.hue = Math.random() > 0.85 ? 185 : (Math.random() > 0.5 ? 265 : 280);
        }
      }

      // Draw particles
      for (const p of this.particles) {
        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap
        if (p.x < 0) p.x = this.canvas.width;
        if (p.x > this.canvas.width) p.x = 0;
        if (p.y < 0) p.y = this.canvas.height;
        if (p.y > this.canvas.height) p.y = 0;

        // Mouse attraction for particles
        const dx = mouse.clientX - p.x;
        const dy = mouse.clientY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200 && dist > 1) {
          p.x += dx * 0.003;
          p.y += dy * 0.003;
        }

        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = `hsla(${p.hue}, 100%, 70%, ${p.opacity})`;
        this.ctx.fill();
      }
    }
  }

  // ═══════════════ INITIALIZATION ═══════════════
  document.addEventListener('DOMContentLoaded', () => {
    // Matrix
    const matrixCanvas = document.getElementById('matrix-canvas');
    const matrix = new MatrixRain(matrixCanvas);

    // Cursor glow
    const cursorGlow = document.getElementById('cursor-glow');

    // Mouse tracking
    document.addEventListener('mousemove', (e) => {
      mouse.x = e.pageX;
      mouse.y = e.pageY;
      mouse.clientX = e.clientX;
      mouse.clientY = e.clientY;

      // Update cursor glow
      cursorGlow.style.transform = `translate(${e.clientX - 300}px, ${e.clientY - 300}px)`;
    });

    // Main animation loop
    function animate() {
      matrix.draw();
      rafId = requestAnimationFrame(animate);
    }
    animate();

    // ── Hero Animations ──
    const heroElements = document.querySelectorAll('[data-animate]');
    setTimeout(() => {
      heroElements.forEach(el => el.classList.add('visible'));
    }, 200);

    // ── Typing Effect ──
    const typedEl = document.querySelector('.typed-text');
    const phrases = ['Tech Enthusiast !', 'Full-Stack Developer', 'AI Explorer', 'System Designer'];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 80;

    function typeEffect() {
      const currentPhrase = phrases[phraseIndex];

      if (isDeleting) {
        typedEl.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
        typeSpeed = 40;
      } else {
        typedEl.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
        typeSpeed = 80;
      }

      if (!isDeleting && charIndex === currentPhrase.length) {
        typeSpeed = 2000; // Pause at end
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typeSpeed = 400; // Pause before next phrase
      }

      setTimeout(typeEffect, typeSpeed);
    }
    setTimeout(typeEffect, 1500);

    // ── Navigation ──
    const nav = document.getElementById('main-nav');
    const navToggle = document.getElementById('nav-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    const sections = document.querySelectorAll('.section');

    // Scroll state
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;

      // Nav background
      if (scrollY > 50) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }

      // Active link
      let current = 'hero';
      sections.forEach(section => {
        const top = section.offsetTop - 200;
        if (scrollY >= top) {
          current = section.id;
        }
      });
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
      });
    });

    // Mobile menu toggle
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('open');
      mobileMenu.classList.toggle('open');
      document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });

    // Close mobile menu on link click
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // ── System Status Typing Effect ──
    const statusEl = document.getElementById('status-typed');
    if (statusEl) {
      const statusText = 'SYSTEM STATUS: AVAILABLE FOR OPPORTUNITIES';
      let statusIdx = 0;
      const statusObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            function typeStatus() {
              if (statusIdx <= statusText.length) {
                statusEl.textContent = statusText.substring(0, statusIdx);
                statusIdx++;
                setTimeout(typeStatus, 50);
              }
            }
            typeStatus();
            statusObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      statusObserver.observe(statusEl.closest('.system-status-header'));
    }

    // ── Roles Toggle (Expand/Collapse) ──
    const rolesToggle = document.getElementById('roles-toggle');
    const hiddenRoles = document.querySelectorAll('.role-hidden');
    if (rolesToggle) {
      rolesToggle.addEventListener('click', () => {
        const isExpanded = rolesToggle.classList.contains('expanded');
        rolesToggle.classList.toggle('expanded');
        const toggleText = rolesToggle.querySelector('.toggle-text');

        if (!isExpanded) {
          hiddenRoles.forEach((role, i) => {
            setTimeout(() => {
              role.classList.add('role-visible');
            }, i * 80);
          });
          if (toggleText) toggleText.textContent = 'Show Less';
        } else {
          hiddenRoles.forEach(role => {
            role.classList.remove('role-visible');
          });
          if (toggleText) toggleText.textContent = 'View More Roles';
        }
      });
    }

    // ── Selectable Intent System ──
    const rolesGrid = document.getElementById('roles-grid');
    const roleCards = document.querySelectorAll('[data-role]');
    roleCards.forEach(card => {
      card.addEventListener('click', () => {
        if (card.classList.contains('role-active')) {
          card.classList.remove('role-active');
          rolesGrid.classList.remove('has-active');
        } else {
          roleCards.forEach(c => c.classList.remove('role-active'));
          card.classList.add('role-active');
          rolesGrid.classList.add('has-active');
        }
      });

      // Cursor spotlight on role cards
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mx', x + '%');
        card.style.setProperty('--my', y + '%');
      });
    });

    // ── Locations Toggle ──
    const locationsToggle = document.getElementById('locations-toggle');
    const locationsExpanded = document.getElementById('locations-expanded');
    if (locationsToggle && locationsExpanded) {
      locationsToggle.addEventListener('click', () => {
        const isOpen = locationsExpanded.classList.contains('open');
        locationsExpanded.classList.toggle('open');
        locationsToggle.classList.toggle('expanded');
        locationsToggle.setAttribute('aria-expanded', !isOpen);
        const toggleText = locationsToggle.querySelector('.toggle-text');
        if (toggleText) {
          toggleText.textContent = isOpen ? 'View More Locations' : 'Show Less';
        }
      });
    }

    // ── Scroll Reveal ──
    const revealElements = document.querySelectorAll('[data-scroll-reveal]');

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Stagger siblings
          const parent = entry.target.parentElement;
          const siblings = parent.querySelectorAll('[data-scroll-reveal]');
          let delay = 0;
          siblings.forEach((sibling, i) => {
            if (sibling === entry.target) delay = i * 100;
          });

          setTimeout(() => {
            entry.target.classList.add('revealed');
          }, delay);

          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // ── Number Counter Animation ──
    const counters = document.querySelectorAll('[data-count]');
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-count'));
          let current = 0;
          const duration = 1500;
          const step = target / (duration / 16);

          function count() {
            current += step;
            if (current >= target) {
              el.textContent = target;
            } else {
              el.textContent = Math.floor(current);
              requestAnimationFrame(count);
            }
          }
          count();
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => counterObserver.observe(el));

    // ── 3D Tilt Effect on Project Cards ──
    const tiltCards = document.querySelectorAll('[data-tilt]');

    tiltCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -5;
        const rotateY = ((x - centerX) / centerX) * 5;

        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
        card.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
      });

      card.addEventListener('mouseenter', () => {
        card.style.transition = 'transform 0.1s ease-out';
      });
    });

    // ── Skill Tag Level Bars ──
    const skillTags = document.querySelectorAll('.skill-tag');
    const skillObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const level = entry.target.getAttribute('data-level');
          entry.target.style.setProperty('--skill-level', `${level}%`);
          entry.target.classList.add('skill-visible');
          skillObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    skillTags.forEach(tag => skillObserver.observe(tag));

    // ── Smooth Scroll for Anchor Links ──
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
          const offset = 80;
          const top = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });

    // ── Parallax depth on hero content ──
    const heroContent = document.querySelector('.hero-content');
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const heroHeight = document.getElementById('hero').offsetHeight;
      if (scrollY < heroHeight) {
        const parallax = scrollY * 0.3;
        const opacity = 1 - (scrollY / heroHeight) * 1.2;
        heroContent.style.transform = `translateY(${parallax}px)`;
        heroContent.style.opacity = Math.max(opacity, 0);
      }
    });

    // ── Particle connection lines (hero only) ──
    // Light floating geometric shapes
    const addFloatingShapes = () => {
      const hero = document.getElementById('hero');
      for (let i = 0; i < 5; i++) {
        const shape = document.createElement('div');
        shape.className = 'floating-shape';
        shape.style.cssText = `
          position: absolute;
          width: ${20 + Math.random() * 40}px;
          height: ${20 + Math.random() * 40}px;
          border: 1px solid rgba(${Math.random() > 0.5 ? '168, 85, 247' : '124, 58, 237'}, ${0.04 + Math.random() * 0.06});
          border-radius: ${Math.random() > 0.5 ? '50%' : '4px'};
          top: ${10 + Math.random() * 80}%;
          left: ${5 + Math.random() * 90}%;
          z-index: 2;
          pointer-events: none;
          animation: floatShape ${15 + Math.random() * 20}s ease-in-out infinite;
          animation-delay: ${-Math.random() * 10}s;
          transform: rotate(${Math.random() * 360}deg);
        `;
        hero.appendChild(shape);
      }

      // Add keyframes for floating shapes
      const style = document.createElement('style');
      style.textContent = `
        @keyframes floatShape {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.5; }
          25% { transform: translateY(-20px) rotate(90deg); opacity: 1; }
          50% { transform: translateY(-10px) rotate(180deg); opacity: 0.7; }
          75% { transform: translateY(-30px) rotate(270deg); opacity: 0.9; }
        }
      `;
      document.head.appendChild(style);
    };
    addFloatingShapes();

    // ── Performance: Pause matrix when not visible ──
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (!rafId) animate();
        } else {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      });
    }, { threshold: 0 });

    heroObserver.observe(document.getElementById('hero'));

    // ── Theme Toggle (Dark/Light) ──
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const isLight = () => body.classList.contains('light-theme');

    // Apply saved theme on load
    const savedTheme = localStorage.getItem('portfolio-theme');
    if (savedTheme === 'light') {
      body.classList.add('light-theme');
    }

    // Update matrix canvas colors for current theme
    function updateMatrixTheme() {
      if (isLight()) {
        // Light mode: reduce matrix opacity, lighter fade
        matrix.columns.forEach(col => {
          col.opacity = Math.min(col.opacity, 0.04);
        });
        matrix.particles.forEach(p => {
          p.opacity = Math.min(p.opacity, 0.12);
        });
      }
    }
    updateMatrixTheme();

    // Override matrix draw fade for light mode
    const originalDraw = matrix.draw.bind(matrix);
    matrix.draw = function () {
      if (isLight()) {
        this.ctx.fillStyle = 'rgba(240, 236, 246, 0.15)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.font = `${this.fontSize}px 'JetBrains Mono', monospace`;

        for (let i = 0; i < this.columns.length; i++) {
          const col = this.columns[i];
          const x = i * this.fontSize;

          const dx = x - mouse.clientX;
          const dy = col.y - mouse.clientY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const repelRadius = 180;
          let offsetX = 0;
          let offsetY = 0;
          let extraOpacity = 0;

          if (dist < repelRadius) {
            const force = (1 - dist / repelRadius) * 25;
            offsetX = (dx / dist) * force;
            offsetY = (dy / dist) * force;
            extraOpacity = (1 - dist / repelRadius) * 0.06;
          }

          const alpha = Math.min(col.opacity * 0.5, 0.035) + extraOpacity;
          const hue = col.hue;
          const sat = hue < 200 ? '60%' : '50%';
          const light = hue < 200 ? '40%' : '45%';
          this.ctx.fillStyle = `hsla(${hue}, ${sat}, ${light}, ${alpha})`;

          const char = this.getChar();
          this.ctx.fillText(char, x + offsetX, col.y + offsetY);

          col.y += col.speed * this.fontSize * 0.15;

          if (col.y > this.canvas.height + 20) {
            col.y = -this.fontSize;
            col.speed = 0.3 + Math.random() * 0.8;
            col.opacity = 0.01 + Math.random() * 0.04;
            col.hue = Math.random() > 0.85 ? 185 : (Math.random() > 0.5 ? 265 : 280);
          }
        }

        // Particles — reduced in light mode
        for (const p of this.particles) {
          p.x += p.speedX;
          p.y += p.speedY;
          if (p.x < 0) p.x = this.canvas.width;
          if (p.x > this.canvas.width) p.x = 0;
          if (p.y < 0) p.y = this.canvas.height;
          if (p.y > this.canvas.height) p.y = 0;

          const dx = mouse.clientX - p.x;
          const dy = mouse.clientY - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200 && dist > 1) {
            p.x += dx * 0.003;
            p.y += dy * 0.003;
          }

          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          this.ctx.fillStyle = `hsla(${p.hue}, 60%, 50%, ${p.opacity * 0.3})`;
          this.ctx.fill();
        }
      } else {
        originalDraw();
      }
    };

    // Toggle theme
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        // Add smooth transition to body and child elements
        body.classList.add('theme-transitioning');

        body.classList.toggle('light-theme');
        const theme = isLight() ? 'light' : 'dark';
        localStorage.setItem('portfolio-theme', theme);

        // Update matrix
        updateMatrixTheme();

        // Clear canvas on theme switch for clean transition
        const ctx = matrixCanvas.getContext('2d');
        if (isLight()) {
          ctx.fillStyle = 'rgba(240, 236, 246, 1)';
        } else {
          ctx.fillStyle = 'rgba(12, 10, 20, 1)';
        }
        ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

        // Reset column opacities for new theme
        matrix.columns.forEach(col => {
          if (isLight()) {
            col.opacity = 0.01 + Math.random() * 0.04;
          } else {
            col.opacity = 0.02 + Math.random() * 0.08;
          }
        });

        // Remove transition after it completes
        setTimeout(() => {
          body.classList.remove('theme-transitioning');
        }, 600);
      });
    }
  });
})();


