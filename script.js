document.addEventListener('DOMContentLoaded', () => {
    // --- BACKGROUND CANVAS ANIMATION ---
    const canvas = document.getElementById('background-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: null, y: null, radius: 100 };

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', (event) => {
        mouse.x = event.x;
        mouse.y = event.y;
    });

    class Particle {
        constructor(x, y, directionX, directionY, size, color) {
            this.x = x;
            this.y = y;
            this.directionX = directionX;
            this.directionY = directionY;
            this.size = size;
            this.color = color;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        update() {
            if (this.x > canvas.width || this.x < 0) { this.directionX = -this.directionX; }
            if (this.y > canvas.height || this.y < 0) { this.directionY = -this.directionY; }

            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < mouse.radius + this.size) {
                if (mouse.x < this.x && this.x < canvas.width - this.size * 10) { this.x += 3; }
                if (mouse.x > this.x && this.x > this.size * 10) { this.x -= 3; }
                if (mouse.y < this.y && this.y < canvas.height - this.size * 10) { this.y += 3; }
                if (mouse.y > this.y && this.y > this.size * 10) { this.y -= 3; }
            }

            this.x += this.directionX;
            this.y += this.directionY;
            this.draw();
        }
    }

    function initParticles() {
        particles = [];
        let numberOfParticles = (canvas.height * canvas.width) / 9000;
        for (let i = 0; i < numberOfParticles; i++) {
            let size = Math.random() * 2 + 1;
            let x = Math.random() * (innerWidth - size * 2) + size;
            let y = Math.random() * (innerHeight - size * 2) + size;
            let directionX = (Math.random() * 0.4) - 0.2;
            let directionY = (Math.random() * 0.4) - 0.2;
            let color = 'rgba(76, 175, 80, 0.8)';
            particles.push(new Particle(x, y, directionX, directionY, size, color));
        }
    }
    initParticles();

    function connectParticles() {
        let opacityValue = 1;
        for (let a = 0; a < particles.length; a++) {
            for (let b = a; b < particles.length; b++) {
                let distance = ((particles[a].x - particles[b].x) * (particles[a].x - particles[b].x)) +
                             ((particles[a].y - particles[b].y) * (particles[a].y - particles[b].y));
                if (distance < (canvas.width / 7) * (canvas.height / 7)) {
                    opacityValue = 1 - (distance / 20000);
                    ctx.strokeStyle = `rgba(76, 175, 80, ${opacityValue})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    }
    
    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, innerWidth, innerHeight);
        particles.forEach(p => p.update());
        connectParticles();
    }
    animate();
    
    window.addEventListener('resize', () => {
        resizeCanvas();
        initParticles();
    });

    // --- MOUSE TRAIL EFFECT ---
    const trailCount = 15;
    const trailElements = [];
    for (let i = 0; i < trailCount; i++) {
        const el = document.createElement('div');
        el.classList.add('trail');
        document.body.appendChild(el);
        trailElements.push(el);
    }
    let lastMouseX = -100, lastMouseY = -100;
    let currentTrailIndex = 0;
    window.addEventListener('mousemove', (e) => {
        lastMouseX = e.pageX;
        lastMouseY = e.pageY;
    });
    function renderTrail() {
        if(lastMouseX < 0) return;
        const trail = trailElements[currentTrailIndex];
        trail.style.left = `${lastMouseX}px`;
        trail.style.top = `${lastMouseY}px`;
        const size = 15 - currentTrailIndex * 0.8;
        trail.style.width = `${size}px`;
        trail.style.height = `${size}px`;
        trail.style.animation = 'none';
        trail.offsetHeight; // Trigger reflow
        trail.style.animation = 'fadeOut 0.5s forwards';
        currentTrailIndex = (currentTrailIndex + 1) % trailCount;
        requestAnimationFrame(renderTrail);
    }
    renderTrail();

    // --- AMAZING SCROLL ANIMATIONS & NAV (INTERSECTION OBSERVER) ---
    const sections = document.querySelectorAll('.section-hidden');
    const header = document.querySelector('header');
    const floatingNav = document.getElementById('floating-nav');

    // This observer is for the main content sections.
    // It watches each section and adds a 'section-visible' class when it scrolls into view,
    // which triggers our CSS fade-in animation.
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('section-visible');
            }
        });
    }, {
        threshold: 0.25 // Animation triggers when 25% of the section is visible
    });

    sections.forEach(section => sectionObserver.observe(section));

    // This second observer is just for the header.
    // It's used to show or hide the floating navigation bar.
    const headerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // If the header is NOT on screen, show the nav
            if (!entry.isIntersecting) {
                floatingNav.classList.remove('-translate-y-24');
            } else { // Otherwise, hide it
                floatingNav.classList.add('-translate-y-24');
            }
        });
    }, {
        rootMargin: "-200px 0px 0px 0px" // Trigger when header is 200px off-screen
    });

    headerObserver.observe(header);
});
