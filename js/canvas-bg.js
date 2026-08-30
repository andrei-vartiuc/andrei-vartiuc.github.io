/* ==========================================================================
   MINIMALIST GEOMETRIC CANVAS BACKGROUND
   Fine mathematical nodes & links, subtle mouse interaction, zero blur/sun blobs
   ========================================================================== */

(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];

  const CONFIG = {
    particleCount: window.innerWidth < 768 ? 25 : 55,
    maxDistance: 125,
    mouseRadius: 140,
    speed: 0.35,
    nodeColor: '148, 163, 184',
    activeColor: '96, 165, 250'
  };

  const mouse = {
    x: null,
    y: null,
    radius: CONFIG.mouseRadius
  };

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * CONFIG.speed;
      this.vy = (Math.random() - 0.5) * CONFIG.speed;
      this.radius = Math.random() * 1.2 + 0.8;
      this.alpha = Math.random() * 0.25 + 0.15;
      this.baseAlpha = this.alpha;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          this.x -= Math.cos(angle) * force * 1.0;
          this.y -= Math.sin(angle) * force * 1.0;
          this.alpha = Math.min(0.6, this.baseAlpha + force * 0.35);
        } else {
          this.alpha = this.baseAlpha;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${CONFIG.nodeColor}, ${this.alpha})`;
      ctx.fill();
    }
  }

  function init() {
    resize();
    particles = [];
    for (let i = 0; i < CONFIG.particleCount; i++) {
      particles.push(new Particle());
    }
  }

  function connect() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONFIG.maxDistance) {
          const opacity = (1 - dist / CONFIG.maxDistance) * 0.12;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(${CONFIG.nodeColor}, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      if (mouse.x !== null && mouse.y !== null) {
        const p = particles[i];
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONFIG.mouseRadius) {
          const opacity = (1 - dist / CONFIG.mouseRadius) * 0.2;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(${CONFIG.activeColor}, ${opacity})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }

    connect();
    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', () => {
    resize();
    init();
  });

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
    }
  });

  window.addEventListener('touchend', () => {
    mouse.x = null;
    mouse.y = null;
  });

  init();
  animate();
})();
