document.addEventListener('DOMContentLoaded', () => {
    // --- PARTICLE BACKGROUND SETUP ---
    const canvas = document.getElementById('background-canvas');
    const ctx = canvas.getContext('2d');
    let particlesArray;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let mouse = { x: null, y: null, radius: (canvas.height / 120) * (canvas.width / 120) };
    const colors = ["#39ff14", "#2eff70", "#00ff8a"];

    const isTouchDevice = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (!isTouchDevice()) {
        window.addEventListener('mousemove', (e) => { mouse.x = e.x; mouse.y = e.y; });
        window.addEventListener('mouseout', () => { mouse.x = undefined; mouse.y = undefined; });
    }

    class Particle {
        constructor(x, y, dX, dY, size, color) { this.x = x; this.y = y; this.directionX = dX; this.directionY = dY; this.size = size; this.color = color; }
        draw() { ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false); ctx.fillStyle = this.color; ctx.fill(); }
        update() {
            if (this.x > canvas.width || this.x < 0) { this.directionX = -this.directionX; }
            if (this.y > canvas.height || this.y < 0) { this.directionY = -this.directionY; }

            if (!isTouchDevice()) {
                let dx = mouse.x - this.x, dy = mouse.y - this.y, distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius + this.size) {
                    if (mouse.x < this.x && this.x < canvas.width - this.size * 10) { this.x += 3; }
                    if (mouse.x > this.x && this.x > this.size * 10) { this.x -= 3; }
                    if (mouse.y < this.y && this.y < canvas.height - this.size * 10) { this.y += 3; }
                    if (mouse.y > this.y && this.y > this.size * 10) { this.y -= 3; }
                }
            }
            this.x += this.directionX; this.y += this.directionY; this.draw();
        }
    }

    function init() {
        particlesArray = [];
        let numParticles = (canvas.height * canvas.width) / 8500;
        for (let i = 0; i < numParticles; i++) {
            let size = (Math.random() * 2) + 1;
            let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
            let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
            let dX = (Math.random() * .4) - .2, dY = (Math.random() * .4) - .2;
            let color = colors[Math.floor(Math.random() * colors.length)];
            particlesArray.push(new Particle(x, y, dX, dY, size, color));
        }
    }

    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, innerWidth, innerHeight);
        for (let i = 0; i < particlesArray.length; i++) { particlesArray[i].update(); }
        connect();
    }

    function connect() {
        let opacityValue = 1;
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a; b < particlesArray.length; b++) {
                let distance = Math.pow(particlesArray[a].x - particlesArray[b].x, 2) + Math.pow(particlesArray[a].y - particlesArray[b].y, 2);
                if (distance < (canvas.width / 7) * (canvas.height / 7)) {
                    opacityValue = 1 - (distance / 20000);
                    ctx.strokeStyle = `rgba(57, 255, 20, ${opacityValue})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath(); ctx.moveTo(particlesArray[a].x, particlesArray[a].y); ctx.lineTo(particlesArray[b].x, particlesArray[b].y); ctx.stroke();
                }
            }
        }
    }

    window.addEventListener('resize', () => {
        canvas.width = innerWidth; canvas.height = innerHeight;
        mouse.radius = (canvas.height / 120) * (canvas.width / 120);
        init();
    });

    init();
    animate();

    // --- SCROLL & NAV OBSERVERS ---
    const sections = document.querySelectorAll('.section-hidden');
    const header = document.querySelector('header');
    const floatingNav = document.getElementById('floating-nav');
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('section-visible'); } });
    }, { threshold: 0.25 });
    sections.forEach(s => sectionObserver.observe(s));
    const headerObserver = new IntersectionObserver((entries) => {
        entries.forEach(e => { floatingNav.classList.toggle('-translate-y-24', e.isIntersecting); });
    }, { rootMargin: "-200px 0px 0px 0px" });
    headerObserver.observe(header);

    // --- INTERACTIVE CHARACTER LOGIC ---
    const character = document.getElementById('catch-me-character');
    const bubble = character.querySelector('.character-bubble');
    const phrases = ["Wanna give up?", "Too slow?", "Don't leave me!", "Try again!", "Almost!"];
    let isFirstClick = true;

    function moveCharacter() {
        const vw = window.innerWidth, vh = window.innerHeight;
        // Keep character at least 50px from the edges
        const padding = 50;
        const maxX = vw - character.offsetWidth - padding, maxY = vh - character.offsetHeight - padding;

        // Random position generation
        const randomX = Math.floor(Math.random() * (maxX - padding)) + padding;
        const randomY = Math.floor(Math.random() * (maxY - padding)) + padding;

        character.style.left = `${randomX}px`; character.style.top = `${randomY}px`;

        if (!isFirstClick) {
            bubble.textContent = phrases[Math.floor(Math.random() * phrases.length)];
        }
    }

    function handleCharacterClick(e) {
        e.preventDefault();
        if (isFirstClick) { isFirstClick = false; }
        moveCharacter();
    }

    character.addEventListener('click', handleCharacterClick);
    character.addEventListener('touchstart', handleCharacterClick);
    bubble.textContent = "Catch me!";
    setTimeout(moveCharacter, 100);

    // --- REVISED GALLERY MODAL LOGIC ---
    const modal = document.getElementById('gallery-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const eventCards = document.querySelectorAll('.event-card');
    const galleryTrack = document.getElementById('gallery-track');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    const images = {
        pictionary: Array.from({ length: 20 }, (_, i) => `https://placehold.co/400x600/3F51B5/fff?text=Pictionary+${i + 1}`),
        karaoke: Array.from({ length: 20 }, (_, i) => `https://placehold.co/400x600/E91E63/fff?text=Karaoke+${i + 1}`),
        painting: Array.from({ length: 20 }, (_, i) => `https://placehold.co/400x600/9C27B0/fff?text=Painting+${i + 1}`),
        cooking: Array.from({ length: 20 }, (_, i) => `https://placehold.co/400x600/4CAF50/fff?text=Cooking+${i + 1}`),
        charades: Array.from({ length: 20 }, (_, i) => `https://placehold.co/400x600/FF9800/fff?text=Charades+${i + 1}`),
    };

    let currentIndex = 0;
    let isDragging = false, startPos = 0, currentX = 0;

    function openModal(event) {
        const eventName = event.currentTarget.dataset.event;
        const eventImages = images[eventName];
        if (!eventImages) return;

        galleryTrack.innerHTML = eventImages.map(src => `<div class="gallery-item"><img src="${src}" alt="Event photo" draggable="false"></div>`).join('');
        modal.classList.remove('hidden');
        setTimeout(() => modal.classList.add('visible'), 10);

        currentIndex = 0;
        updateGalleryPositions();
        addGalleryListeners();
    }

    function closeModal() {
        modal.classList.remove('visible');
        setTimeout(() => modal.classList.add('hidden'), 400);
        removeGalleryListeners();
    }

    function updateGalleryPositions() {
        const items = galleryTrack.querySelectorAll('.gallery-item');
        items.forEach((item, index) => {
            const offset = index - currentIndex;
            const absOffset = Math.abs(offset);

            // 1. Z-index and Opacity for visual layering
            const zIndex = 100 - absOffset;
            const currentOpacity = absOffset > 3 ? 0 : (absOffset === 3 ? 0.3 : 1);

            // 2. Base Transform: Center the item
            let transform = `translateX(-50%) translateY(-50%)`;

            // 3. Spacing, Rotation, and Z-axis for 3D Effect
            if (offset !== 0) {
                // Determine direction and rotation
                const direction = offset > 0 ? 1 : -1;
                const rotation = direction * 10; // Rotate 10 degrees on the Y-axis

                // Spread items out on the X-axis and push them back on the Z-axis
                const translateX = direction * (window.innerWidth < 768 ? 40 : 30) * absOffset;
                const translateZ = -100 * absOffset;

                // Add to the transform string
                transform += ` translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotation}deg) scale(0.9)`;
            }

            // Apply the new styles
            item.style.transform = transform;
            item.style.zIndex = zIndex;
            item.style.opacity = currentOpacity;
        });
    }

    function showNext() { if (currentIndex < galleryTrack.children.length - 1) { currentIndex++; updateGalleryPositions(); } }
    function showPrev() { if (currentIndex > 0) { currentIndex--; updateGalleryPositions(); } }

    function addGalleryListeners() {
        prevBtn.addEventListener('click', showPrev);
        nextBtn.addEventListener('click', showNext);
        galleryTrack.addEventListener('mousedown', dragStart);
        galleryTrack.addEventListener('touchstart', dragStart, { passive: true });
        window.addEventListener('mouseup', dragEnd);
        window.addEventListener('touchend', dragEnd);
        window.addEventListener('mousemove', drag);
        window.addEventListener('touchmove', drag, { passive: true });
        window.addEventListener('mousemove', drag);
        window.addEventListener('touchmove', drag, { passive: false })
    }

    function removeGalleryListeners() {
        // Clean up listeners to prevent memory leaks
        prevBtn.removeEventListener('click', showPrev);
        nextBtn.removeEventListener('click', showNext);
        galleryTrack.removeEventListener('mousedown', dragStart);
        galleryTrack.removeEventListener('touchstart', dragStart);
        window.removeEventListener('mouseup', dragEnd);
        window.removeEventListener('touchend', dragEnd);
        window.removeEventListener('mousemove', drag);
        window.removeEventListener('touchmove', drag);
    }

    function dragStart(e) {
        isDragging = true;
        startPos = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
        galleryTrack.querySelectorAll('.gallery-item').forEach(item => {
            item.style.transition = 'none'; // Disable transition for instant drag
        });
    }

    function drag(e) {
        if (!isDragging) return;

        // --- THE FIX: Prevent browser scrolling on touch devices ---
        if (e.type.includes('touch')) {
            e.preventDefault();
        }

        currentX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
        // The rest of the logic is handled on dragEnd to trigger the animation
    }

    function dragEnd() {
        if (!isDragging) return;
        isDragging = false;

        const movedBy = currentX - startPos;
        const threshold = 100; // How far user needs to swipe

        if (movedBy < -threshold) {
            showNext();
        } else if (movedBy > threshold) {
            showPrev();
        }

        // Re-enable transitions
        galleryTrack.querySelectorAll('.gallery-item').forEach(item => {
            item.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s ease';
        });
    }

    eventCards.forEach(card => card.addEventListener('click', openModal));
    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    window.addEventListener('resize', () => {
        if (modal.classList.contains('visible')) {
            updateGalleryPositions();
        }
    });
});

