document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('background-canvas');
    const ctx = canvas.getContext('2d');
    let particlesArray;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let mouse = {
        x: null,
        y: null,
        radius: (canvas.height/120) * (canvas.width/120)
    };
    
    // UPDATED: Brighter neon green colors
    const colors = ["#39ff14", "#2eff70", "#00ff8a"];

    window.addEventListener('mousemove', (event) => {
        mouse.x = event.x;
        mouse.y = event.y;
    });
    window.addEventListener('mouseout', () => {
        mouse.x = undefined;
        mouse.y = undefined;
    });

    class Particle {
        // ... (Particle class remains the same)
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
            if (this.x > canvas.width || this.x < 0) {
                this.directionX = -this.directionX;
            }
            if (this.y > canvas.height || this.y < 0) {
                this.directionY = -this.directionY;
            }

            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx*dx + dy*dy);
            if (distance < mouse.radius + this.size){
                if(mouse.x < this.x && this.x < canvas.width - this.size * 10){
                    this.x += 5;
                }
                if(mouse.x > this.x && this.x > this.size * 10){
                    this.x -= 5;
                }
                if(mouse.y < this.y && this.y < canvas.height - this.size * 10){
                    this.y += 5;
                }
                if(mouse.y > this.y && this.y > this.size * 10){
                    this.y -= 5;
                }
            }
            this.x += this.directionX;
            this.y += this.directionY;
            this.draw();
        }
    }

    function init() {
        // ... (init function remains the same)
        particlesArray = [];
        let numberOfParticles = (canvas.height * canvas.width) / 11000;
        for (let i = 0; i < numberOfParticles; i++) {
            let size = (Math.random() * 2) + 1;
            let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
            let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
            let directionX = (Math.random() * .4) - .2;
            let directionY = (Math.random() * .4) - .2;
            let color = colors[Math.floor(Math.random() * colors.length)];
            particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
        }
    }

    function animate() {
        // ... (animate function remains the same)
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, innerWidth, innerHeight);

        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
        }
        connect();
    }

    function connect() {
        // ... (connect function updated for neon color)
        let opacityValue = 1;
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a; b < particlesArray.length; b++) {
                let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x)) +
                               ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
                
                if (distance < (canvas.width / 7) * (canvas.height / 7)) {
                    opacityValue = 1 - (distance / 20000);
                    ctx.strokeStyle = `rgba(57, 255, 20, ${opacityValue})`; 
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }
    
    window.addEventListener('resize', () => {
        // ... (resize listener remains the same)
        canvas.width = innerWidth;
        canvas.height = innerHeight;
        mouse.radius = (canvas.height/120) * (canvas.width/120);
        init();
    });

    init();
    animate();

    // Re-enabling the full set of features that were removed or commented out.
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (!isTouchDevice) {
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
        
        function renderTrail() {
            if (lastMouseX < 0) return;
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
        window.addEventListener('mousemove', (e) => {
            lastMouseX = e.pageX;
            lastMouseY = e.pageY;
        });
        renderTrail();
    }

    const sections = document.querySelectorAll('.section-hidden');
    const header = document.querySelector('header');
    const floatingNav = document.getElementById('floating-nav');

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('section-visible');
            }
        });
    }, { threshold: 0.25 });

    sections.forEach(section => sectionObserver.observe(section));

    const headerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                floatingNav.classList.remove('-translate-y-24');
            } else {
                floatingNav.classList.add('-translate-y-24');
            }
        });
    }, { rootMargin: "-200px 0px 0px 0px" });

    headerObserver.observe(header);
    
    // --- UPDATED: INTERACTIVE CHARACTER LOGIC ---
    const character = document.getElementById('catch-me-character');
    const bubble = character.querySelector('.character-bubble');
    const phrases = ["Catch me!", "Wanna give up?", "Too slow?", "Don't leave me!", "Try again!"];

    function moveCharacter() {
        const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

        const maxX = vw - character.offsetWidth - 20;
        const maxY = vh - character.offsetHeight - 20;

        const randomX = Math.floor(Math.random() * maxX) + 10;
        const randomY = Math.floor(Math.random() * maxY) + 10;
        
        character.style.left = `${randomX}px`;
        character.style.top = `${randomY}px`;
        
        // Update text randomly
        const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
        bubble.textContent = randomPhrase;
    }

    character.addEventListener('click', moveCharacter);
    character.addEventListener('touchstart', (e) => {
        e.preventDefault();
        moveCharacter();
    });

    moveCharacter(); // Set initial position
});

