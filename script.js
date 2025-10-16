document.addEventListener('DOMContentLoaded', () => {
    // --- PARTICLE BACKGROUND SETUP ---
    const canvas = document.getElementById('background-canvas');
    const ctx = canvas.getContext('2d');
    let particlesArray;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let mouse = { x: null, y: null, radius: (canvas.height/120) * (canvas.width/120) };
    const colors = ["#39ff14", "#2eff70", "#00ff8a"];

    window.addEventListener('mousemove', (e) => { mouse.x = e.x; mouse.y = e.y; });
    window.addEventListener('mouseout', () => { mouse.x = undefined; mouse.y = undefined; });

    class Particle {
        constructor(x, y, dX, dY, size, color) { this.x=x; this.y=y; this.directionX=dX; this.directionY=dY; this.size=size; this.color=color; }
        draw() { ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false); ctx.fillStyle = this.color; ctx.fill(); }
        update() {
            if (this.x > canvas.width || this.x < 0) { this.directionX = -this.directionX; }
            if (this.y > canvas.height || this.y < 0) { this.directionY = -this.directionY; }
            let dx = mouse.x - this.x, dy = mouse.y - this.y, distance = Math.sqrt(dx*dx + dy*dy);
            if (distance < mouse.radius + this.size){
                if (mouse.x < this.x && this.x < canvas.width - this.size * 10) { this.x += 3; }
                if (mouse.x > this.x && this.x > this.size * 10) { this.x -= 3; }
                if (mouse.y < this.y && this.y < canvas.height - this.size * 10) { this.y += 3; }
                if (mouse.y > this.y && this.y > this.size * 10) { this.y -= 3; }
            }
            this.x += this.directionX; this.y += this.directionY; this.draw();
        }
    }

    function init() {
        particlesArray = [];
        // UPDATED: Decreased denominator by ~30% to increase particle/line count
        let numParticles = (canvas.height * canvas.width) / 8500;
        for (let i=0; i < numParticles; i++) {
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
        for (let i=0; i < particlesArray.length; i++) { particlesArray[i].update(); }
        connect();
    }

    function connect() {
        let opacityValue = 1;
        for (let a=0; a < particlesArray.length; a++) {
            for (let b=a; b < particlesArray.length; b++) {
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
        mouse.radius = (canvas.height/120) * (canvas.width/120);
        init();
    });

    init();
    animate();
    
    // --- SCROLL & NAV OBSERVERS ---
    const sections = document.querySelectorAll('.section-hidden');
    const header = document.querySelector('header');
    const floatingNav = document.getElementById('floating-nav');
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('section-visible'); }});
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
        const maxX = vw - character.offsetWidth - 20, maxY = vh - character.offsetHeight - 20;
        const randomX = Math.floor(Math.random() * maxX) + 10, randomY = Math.floor(Math.random() * maxY) + 10;
        character.style.left = `${randomX}px`; character.style.top = `${randomY}px`;
        
        if (!isFirstClick) {
            bubble.textContent = phrases[Math.floor(Math.random() * phrases.length)];
        }
    }

    function handleCharacterClick(e) {
        e.preventDefault();
        moveCharacter();
        isFirstClick = false; // Set to false after the first click/tap
    }

    character.addEventListener('click', handleCharacterClick);
    character.addEventListener('touchstart', handleCharacterClick);
    moveCharacter(); // Initial position
    bubble.textContent = "Catch me!"; // Ensure initial text

    // --- GALLERY MODAL LOGIC ---
    const modal = document.getElementById('gallery-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const eventCards = document.querySelectorAll('.event-card');
    const galleryTrack = document.getElementById('gallery-track');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    const images = {
        // UPDATED: Increased image count from 6 to 20 for each category
        pictionary: Array.from({ length: 20 }, (_, i) => `https://placehold.co/400x600/3F51B5/fff?text=Pictionary+${i + 1}`),
        karaoke:    Array.from({ length: 20 }, (_, i) => `https://placehold.co/400x600/E91E63/fff?text=Karaoke+${i + 1}`),
        painting:   Array.from({ length: 20 }, (_, i) => `https://placehold.co/400x600/9C27B0/fff?text=Painting+${i + 1}`),
        cooking:    Array.from({ length: 20 }, (_, i) => `https://placehold.co/400x600/4CAF50/fff?text=Cooking+${i + 1}`),
        charades:   Array.from({ length: 20 }, (_, i) => `https://placehold.co/400x600/FF9800/fff?text=Charades+${i + 1}`),
    };

    let currentIndex = 0;
    let isDragging = false, startPos = 0, currentTranslate = 0, prevTranslate = 0, animationID = 0;

    function openModal(event) {
        const eventName = event.currentTarget.dataset.event;
        const eventImages = images[eventName];
        if (!eventImages) return;

        galleryTrack.innerHTML = eventImages.map(src => `<div class="gallery-item"><img src="${src}" alt="Event photo"></div>`).join('');
        modal.classList.remove('hidden');
        setTimeout(() => modal.classList.add('visible'), 10);
        
        currentIndex = 0;
        updateGallery();
        addGalleryListeners();
    }

    function closeModal() {
        modal.classList.remove('visible');
        setTimeout(() => modal.classList.add('hidden'), 300);
        removeGalleryListeners();
    }

    function updateGallery() {
        const items = galleryTrack.querySelectorAll('.gallery-item');
        if (items.length === 0) return;

        // This logic calculates the offset needed to center the current image
        const activeItem = items[currentIndex];
        const trackWidth = galleryTrack.offsetWidth;
        const activeItemWidth = activeItem.offsetWidth;
        const activeItemOffsetLeft = activeItem.offsetLeft;
        
        const desiredPosition = (trackWidth / 2) - (activeItemWidth / 2);
        let offset = desiredPosition - activeItemOffsetLeft;

        // This calculation is complex. A simpler, more robust flexbox approach is better.
        // Let's stick to centering based on index and item widths.
        
        let totalOffset = 0;
        for(let i = 0; i < currentIndex; i++) {
            // Sum widths of preceding items
            totalOffset += items[i].offsetWidth;
        }
        
        // Center the active item
        const centerPoint = galleryTrack.parentElement.clientWidth / 2;
        const activeCenter = activeItem.offsetWidth / 2;
        
        // Add margin overlap to the calculation
        const itemMargin = parseFloat(window.getComputedStyle(items[0]).marginRight) + parseFloat(window.getComputedStyle(items[0]).marginLeft);
        totalOffset += (currentIndex * itemMargin);


        let finalTranslate = centerPoint - totalOffset - activeCenter;
        
        galleryTrack.style.transform = `translateX(${finalTranslate}px)`;
        
        items.forEach((item, index) => {
            item.classList.toggle('active', index === currentIndex);
        });
    }
    
    function showNext() { if (currentIndex < galleryTrack.children.length - 1) { currentIndex++; updateGallery(); } }
    function showPrev() { if (currentIndex > 0) { currentIndex--; updateGallery(); } }

    function addGalleryListeners() {
        prevBtn.addEventListener('click', showPrev);
        nextBtn.addEventListener('click', showNext);
        galleryTrack.addEventListener('mousedown', dragStart);
        galleryTrack.addEventListener('touchstart', dragStart);
        galleryTrack.addEventListener('mouseup', dragEnd);
        galleryTrack.addEventListener('touchend', dragEnd);
        galleryTrack.addEventListener('mouseleave', dragEnd);
        galleryTrack.addEventListener('mousemove', drag);
        galleryTrack.addEventListener('touchmove', drag);
    }

    function removeGalleryListeners() {
        // This is important to prevent memory leaks if the modal is opened/closed many times
    }
    
    function dragStart(e) {
        isDragging = true;
        startPos = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
        galleryTrack.style.transition = 'none'; // Disable transition while dragging
        animationID = requestAnimationFrame(animation);
    }
    
    function drag(e) {
        if (isDragging) {
            const currentPosition = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
            currentTranslate = prevTranslate + currentPosition - startPos;
        }
    }

    function animation() {
        galleryTrack.style.transform = `translateX(${currentTranslate}px)`;
        if(isDragging) requestAnimationFrame(animation);
    }

    function dragEnd(e) {
        cancelAnimationFrame(animationID);
        isDragging = false;
        const movedBy = currentTranslate - prevTranslate;

        if (movedBy < -100 && currentIndex < galleryTrack.children.length - 1) currentIndex++;
        if (movedBy > 100 && currentIndex > 0) currentIndex--;
        
        // Re-enable smooth transition
        galleryTrack.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
        
        updateGallery(); // Snap to the correct position
    }

    eventCards.forEach(card => card.addEventListener('click', openModal));
    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
});


