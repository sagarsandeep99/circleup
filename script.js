// 1. Select all elements that need to be animated
const scrollRevealElements = document.querySelectorAll('.scroll-reveal');

// 2. Define the callback function for the observer
const observerCallback = (entries, observer) => {
    entries.forEach(entry => {
        // When the element intersects (is visible)
        if (entry.isIntersecting) {
            // Add the 'active' class to start the CSS transition, 
            // including the CSS transition-delay for staggering
            entry.target.classList.add('active');
            
            // Stop observing it once it has animated
            observer.unobserve(entry.target);
        }
    });
};

// 3. Define the observer options
const observerOptions = {
    root: null, // Viewport as the root
    rootMargin: '0px',
    // Trigger when 20% of the element is visible
    threshold: 0.2 
};

// 4. Create the Intersection Observer instance
const observer = new IntersectionObserver(observerCallback, observerOptions);

// 5. Start observing every element
scrollRevealElements.forEach(element => {
    observer.observe(element);
});
