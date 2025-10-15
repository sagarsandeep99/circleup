document.addEventListener('DOMContentLoaded', () => {
    // --- NEW: MATRIX RAIN BACKGROUND ANIMATION ---
    const canvas = document.getElementById('background-canvas');
    const ctx = canvas.getContext('2d');

    let animationInterval;

    const setupMatrix = () => {
        // Clear any previous animation interval
        if (animationInterval) clearInterval(animationInterval);

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Characters used for the rain
        const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
        const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const nums = '0123456789';
        const alphabet = katakana + latin + nums;

        const fontSize = 16;
        const columns = canvas.width / fontSize;
        const rainDrops = [];

        // Initialize rain drops position
        for (let x = 0; x < columns; x++) {
            rainDrops[x] = 1;
        }

        const draw = () => {
            // Set a semi-transparent background to create the fading trail effect
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#4CAF50'; // Green color for the text
            ctx.font = fontSize + 'px monospace';

            for (let i = 0; i < rainDrops.length; i++) {
                // Get a random character from the alphabet
                const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
                // Draw the character
                ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);

                // Reset the drop to the top if it reaches the bottom of the screen
                if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    rainDrops[i] = 0;
                }
                // Move the drop down
                rainDrops[i]++;
            }
        };
        
        // Start the animation loop
        animationInterval = setInterval(draw, 33);
    };
    
    // Initial setup
    setupMatrix();
    // Reset on window resize
    window.addEventListener('resize', setupMatrix);

    // --- DESKTOP-ONLY MOUSE TRAIL EFFECT ---
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

    // --- SCROLL ANIMATIONS & NAV (INTERSECTION OBSERVER) ---
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
});