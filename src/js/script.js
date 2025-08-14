document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        this.classList.add('active');

        const href = this.getAttribute('href');
        const target = document.querySelector(href);
        target.scrollIntoView({
            behavior: 'smooth'
        });

        // Reflect brand visibility immediately on click (only on desktop)
        const navBrandEl = document.querySelector('.nav-brand');
        if (navBrandEl && window.innerWidth > 768) {
            if (href !== '#home') {
                navBrandEl.classList.add('visible');
            } else {
                navBrandEl.classList.remove('visible');
            }
        }
    });
});

const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.nav-link');
const navBrand = document.querySelector('.nav-brand');
const isMobileViewport = window.innerWidth <= 768;

const revealOptions = {
    root: null,
    threshold: new Array(11).fill(0).map((_, i) => i / 10),
    rootMargin: '-10%'
};

const revealSection = (entries, observer) => {
    entries.forEach(entry => {
        const section = entry.target;
        const sectionContent = Array.from(section.children);

        // Determine if the section's center crosses a comfortable point
        const viewportCenterY = window.innerHeight * 0.4;
        const rect = section.getBoundingClientRect();
        const isCenterInView = rect.top <= viewportCenterY && rect.bottom >= viewportCenterY;

        if (isMobileViewport) {
            // On mobile, ensure content is fully visible once intersecting to avoid half-loaded look
            if (entry.isIntersecting) {
                sectionContent.forEach((element) => {
                    element.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                });
            }
        } else {
            const opacity = Math.min(entry.intersectionRatio * 1.5, 1);
            const translateY = 50 * (1 - entry.intersectionRatio);

            sectionContent.forEach((element, index) => {
                const delay = index * 100;
                element.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                element.style.opacity = opacity;
                element.style.transform = `translateY(${translateY}px)`;
            });
        }

        // Update active nav based on the section position in the viewport (works for tall sections)
        if (isCenterInView) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('section') === section.id) {
                    link.classList.add('active');
                }
            });
            // Toggle navbar brand visibility when not on Home (only on desktop)
            if (navBrand && window.innerWidth > 768) {
                if (section.id !== 'home') {
                    navBrand.classList.add('visible');
                } else {
                    navBrand.classList.remove('visible');
                }
            }
        }
    });
};

const sectionObserver = new IntersectionObserver(revealSection, revealOptions);

sections.forEach(section => {
    if (!section.classList.contains('hero')) {
        Array.from(section.children).forEach(child => {
            if (isMobileViewport) {
                // Start visible on mobile to avoid partial render states
                child.style.opacity = '1';
                child.style.transform = 'translateY(0)';
            } else {
                child.style.opacity = '0';
                child.style.transform = 'translateY(50px)';
            }
        });
    }
    sectionObserver.observe(section);
});

// Helper to robustly update active nav on scroll using viewport center
function updateActiveNav() {
    const viewportCenterY = window.innerHeight * 0.4;
    let activeSectionId = null;
    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= viewportCenterY && rect.bottom >= viewportCenterY) {
            activeSectionId = section.id;
        }
    });
    if (activeSectionId) {
        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('section') === activeSectionId);
        });
        // Only show brand on desktop
        if (navBrand && window.innerWidth > 768) {
            if (activeSectionId !== 'home') {
                navBrand.classList.add('visible');
            } else {
                navBrand.classList.remove('visible');
            }
        }
    }
}

let ticking = false;

const updateParallax = () => {
    const scrolled = window.pageYOffset;
    const scrollDirection = scrolled > lastScrollY ? 'down' : 'up';

    requestAnimationFrame(() => {
        const background = document.querySelector('.background');
        const grid = document.querySelector('.grid');

        const parallaxY = scrolled * 0.05;
        const gridY = scrolled * 0.03;

        background.style.transform = `translateZ(-10px) scale(2) translateY(${parallaxY}px)`;
        grid.style.transform = `translateZ(-5px) scale(1.5) translateY(${gridY}px)`;

        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const sectionCenter = rect.top + rect.height / 2;
            const viewportCenter = viewportHeight / 2;
            const distance = Math.abs(sectionCenter - viewportCenter);
            const maxDistance = viewportHeight;

            const parallaxFactor = Math.max(0, 1 - distance / maxDistance);

            const content = section.querySelector('.section-content');
            if (content && !section.classList.contains('hero')) {
                const translateY = (scrollDirection === 'down' ? 30 : -30) * (1 - parallaxFactor);
                const scale = 0.95 + (0.05 * parallaxFactor);
                const opacity = 0.3 + (0.7 * parallaxFactor);

                content.style.transform = `translateY(${translateY}px) scale(${scale})`;
                content.style.opacity = opacity;
            }
        });

        lastScrollY = scrolled;
        ticking = false;
    });
};

// Simple and crisp scroll-to-section functionality
let isScrolling = false;

function scrollToSection(sectionIndex) {
    if (isScrolling) return;
    
    const sections = document.querySelectorAll('.section');
    if (sectionIndex < 0 || sectionIndex >= sections.length) return;
    
    isScrolling = true;
    
    const targetSection = sections[sectionIndex];
    
    // Update navigation
    const targetId = targetSection.id;
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('section') === targetId) {
            link.classList.add('active');
        }
    });
    
    // Snap directly to the section
    targetSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
    
    // Reset scrolling flag after animation
    setTimeout(() => {
        isScrolling = false;
    }, 600);
}

// Simple scroll event listener
let lastScrollY = window.pageYOffset;
let scrollThreshold = 30; // Minimum scroll distance to trigger

window.addEventListener('scroll', () => {
    const currentScrollY = window.pageYOffset;
    const scrollDelta = Math.abs(currentScrollY - lastScrollY);
    
    // Only trigger if scroll distance is significant and not already scrolling
    if (scrollDelta > scrollThreshold && !isScrolling) {
        const sections = document.querySelectorAll('.section');
        
        // Find current section
        let currentSection = 0;
        for (let i = 0; i < sections.length; i++) {
            const sectionTop = sections[i].offsetTop;
            const sectionBottom = sectionTop + sections[i].offsetHeight;
            
            if (currentScrollY >= sectionTop && currentScrollY < sectionBottom) {
                currentSection = i;
                break;
            }
        }
        
        // Determine scroll direction and target section
        if (currentScrollY > lastScrollY && currentSection < sections.length - 1) {
            // Scrolling down - go to next section
            scrollToSection(currentSection + 1);
        } else if (currentScrollY < lastScrollY && currentSection > 0) {
            // Scrolling up - go to previous section
            scrollToSection(currentSection - 1);
        }
    }
    
    lastScrollY = currentScrollY;
    
    // Existing scroll functionality
    if (!ticking) {
        requestAnimationFrame(() => {
            updateParallax();
            updateActiveNav();
            ticking = false;
        });
        ticking = true;
    }

    const nav = document.querySelector('nav');
    if (window.pageYOffset > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

// Handle window resize to update mobile detection
window.addEventListener('resize', () => {
    const navBrand = document.querySelector('.nav-brand');
    if (navBrand && window.innerWidth <= 768) {
        // Force hide on mobile
        navBrand.classList.remove('visible');
    }
});

const cardOptions = {
    threshold: 0.2,
    rootMargin: '0px'
};

const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            const card = entry.target;
            const delay = index * 100;

            card.style.transition = `all 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`;
            card.style.transform = 'translateY(0) scale(1)';
            card.style.opacity = '1';
        }
    });
}, cardOptions);

document.querySelectorAll('.project-card, .skill-card').forEach((card) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px) scale(0.95)';
    cardObserver.observe(card);
});


document.getElementById('contactForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    const responseModal = document.getElementById('responseModal');
    const modalMessage = document.getElementById('modalMessage');
    const closeButton = document.querySelector('.close-button');

    function showModal(message) {
        modalMessage.textContent = message;
        responseModal.classList.add('show');
    }

    function hideModal() {
        responseModal.classList.remove('show');
    }

    closeButton.addEventListener('click', hideModal);
    window.addEventListener('click', (event) => {
        if (event.target === responseModal) {
            hideModal();
        }
    });

    try {
        const response = await fetch(form.action, {
            method: form.method,
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            showModal('Thank you for your message! I will get back to you soon.');
            form.reset();
        } else {
            const data = await response.json();
            if (Object.hasOwnProperty.call(data, 'errors')) {
                showModal(data["errors"].map(error => error["message"]).join(", "));
            } else {
                showModal('Oops! There was a problem submitting your form.');
            }
        }
    } catch (error) {
        showModal('Oops! There was a problem submitting your form: ' + error.message);
    }
});

const currentYear = new Date().getFullYear();

const yearSpan = document.getElementById('current-year');
if (yearSpan) {
    yearSpan.textContent = currentYear;
}


// Carousel Implementation
document.addEventListener('DOMContentLoaded', function() {
    const carousel = document.querySelector('.carousel-container');
    if (!carousel) return;

    const track = carousel.querySelector('.carousel-track');
    const slides = carousel.querySelectorAll('.carousel-slide');
    const prevBtn = carousel.querySelector('.carousel-btn-prev');
    const nextBtn = carousel.querySelector('.carousel-btn-next');
    const indicators = carousel.querySelectorAll('.carousel-indicator');

    // Disable native drag thumbnail preview on project images and links
    carousel.querySelectorAll('.project-image img, .project-image a, .carousel-slide img, .carousel-slide a').forEach((el) => {
        el.setAttribute('draggable', 'false');
        el.addEventListener('dragstart', (e) => e.preventDefault());
    });
    track.addEventListener('dragstart', (e) => e.preventDefault());

    let currentSlide = 0;
    const slideCount = slides.length;

    function updateCarousel() {
        const slideWidth = carousel.offsetWidth;
        track.style.transform = `translateX(-${currentSlide * slideWidth}px)`;
        
        // Update indicators
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentSlide);
        });
        
        // Update button states
        prevBtn.style.opacity = currentSlide === 0 ? '0.5' : '1';
        nextBtn.style.opacity = currentSlide === slideCount - 1 ? '0.5' : '1';
    }

    function goToSlide(slideIndex) {
        currentSlide = Math.max(0, Math.min(slideIndex, slideCount - 1));
        updateCarousel();
    }

    function nextSlide() {
        if (currentSlide < slideCount - 1) {
            goToSlide(currentSlide + 1);
        }
    }

    function prevSlide() {
        if (currentSlide > 0) {
            goToSlide(currentSlide - 1);
        }
    }

    // Event listeners
    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);

    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => goToSlide(index));
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (document.activeElement.closest('.carousel-container')) {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                prevSlide();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                nextSlide();
            }
        }
    });

    // Touch/swipe support
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    let touchStartedOnAnchor = false;
    let touchMoved = false;

    track.addEventListener('touchstart', (e) => {
        // Don't start dragging if touching buttons or indicators
        if (e.target.closest('.carousel-btn') || e.target.closest('.carousel-indicator')) {
            return;
        }
        startX = e.touches[0].clientX;
        currentX = startX;
        isDragging = true;
        touchStartedOnAnchor = !!e.target.closest('a');
        touchMoved = false;
        track.style.transition = 'none';
    }, { passive: true });

    track.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        currentX = e.touches[0].clientX;
        let diff = startX - currentX; // positive when swiping left (to next slide)

        if (!touchMoved && Math.abs(diff) > 5) {
            touchMoved = true;
        }

        // Add gentle resistance at edges
        if (currentSlide === 0 && diff < 0) {
            diff *= 0.3;
        } else if (currentSlide === slideCount - 1 && diff > 0) {
            diff *= 0.3;
        }

        // Move track with correct sign so swiping left reveals next slide
        track.style.transform = `translateX(-${currentSlide * carousel.offsetWidth + diff}px)`;
        // Prevent accidental page scroll while dragging
        e.preventDefault();
    }, { passive: false });

    track.addEventListener('touchend', () => {
        if (!isDragging) return;
        isDragging = false;
        track.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        const diff = startX - currentX;
        const threshold = carousel.offsetWidth * 0.3;

        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        } else {
            updateCarousel();
        }

        // If swipe started on an anchor and moved, suppress the follow-up click
        if (touchStartedOnAnchor && touchMoved) {
            const preventNextClick = (e) => {
                e.preventDefault();
                e.stopImmediatePropagation();
                document.removeEventListener('click', preventNextClick, true);
            };
            document.addEventListener('click', preventNextClick, true);
        }
    });

    // Mouse drag support
    let mouseStartX = 0;
    let mouseCurrentX = 0;
    let isMouseDragging = false;
    let dragOffset = 0;
    let dragStartedOnAnchor = false;
    let hasMouseMoved = false;

    track.addEventListener('mousedown', (e) => {
        // Don't start dragging if clicking on buttons, links, or indicators
        if (e.target.closest('.carousel-btn') || 
            e.target.closest('.carousel-indicator') || 
            e.target.closest('button')) {
            return;
        }
        
        mouseStartX = e.clientX;
        isMouseDragging = true;
        track.style.cursor = 'grabbing';
        track.style.userSelect = 'none';
        track.style.transition = 'none';
        dragStartedOnAnchor = !!e.target.closest('a');
        hasMouseMoved = false;
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isMouseDragging) return;
        mouseCurrentX = e.clientX;
        dragOffset = mouseStartX - mouseCurrentX;
        if (!hasMouseMoved && Math.abs(dragOffset) > 3) {
            hasMouseMoved = true;
        }
        
        // Add resistance at edges
        const maxDrag = carousel.offsetWidth * 0.5;
        if (currentSlide === 0 && dragOffset < 0) {
            dragOffset *= 0.3;
        } else if (currentSlide === slideCount - 1 && dragOffset > 0) {
            dragOffset *= 0.3;
        }
        
        // Use the same sign convention as touch: positive dragOffset (drag left) moves track left
        track.style.transform = `translateX(-${currentSlide * carousel.offsetWidth + dragOffset}px)`;
    });

    document.addEventListener('mouseup', () => {
        if (!isMouseDragging) return;
        isMouseDragging = false;
        track.style.cursor = 'grab';
        track.style.userSelect = 'auto';
        track.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        
        const threshold = carousel.offsetWidth * 0.2;
        
        if (Math.abs(dragOffset) > threshold) {
            if (dragOffset > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        } else {
            updateCarousel();
        }
        
        dragOffset = 0;

        // If drag started on a link and moved, cancel the subsequent click
        if (dragStartedOnAnchor && hasMouseMoved) {
            const preventNextClick = (e) => {
                e.preventDefault();
                e.stopImmediatePropagation();
                document.removeEventListener('click', preventNextClick, true);
            };
            document.addEventListener('click', preventNextClick, true);
        }
    });

    // Prevent text selection while dragging
    track.addEventListener('selectstart', (e) => {
        if (isMouseDragging) {
            e.preventDefault();
        }
    });

    // Initialize carousel
    updateCarousel();

    // Handle window resize
    window.addEventListener('resize', updateCarousel);
});

// Gooey Cursor Implementation
document.addEventListener('DOMContentLoaded', function() {
    // Check if device is mobile
    const isMobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Skip cursor initialization on mobile devices
    if (isMobile) {
        return;
    }
    
    const TAIL_LENGTH = 20;
    
    const cursor = document.getElementById('cursor');
    if (!cursor) return;
    
    let mouseX = 0;
    let mouseY = 0;
    
    let cursorCircles;
    let cursorHistory = Array(TAIL_LENGTH).fill({x: 0, y: 0});
    
    let cursorTimeout;
    let isCursorHidden = false;
    const INACTIVITY_TIMEOUT = 1000;
    
    function onMouseMove(event) {
        // Show cursor if hidden
        showCursor();

        // Clear any existing timeout
        clearTimeout(cursorTimeout);

        // Set a new timeout to hide the cursor after INACTIVITY_TIMEOUT
        cursorTimeout = setTimeout(hideCursor, INACTIVITY_TIMEOUT);

        mouseX = event.clientX;
        mouseY = event.clientY;
    }
    
    function hideCursor() {
        if (!isCursorHidden) {
            cursor.style.transition = 'opacity 0.5s ease-out';
            cursor.style.opacity = '0';
            isCursorHidden = true;
        }
    }

    function showCursor() {
        if (isCursorHidden) {
            cursor.style.transition = 'opacity 0.2s ease-in';
            cursor.style.opacity = '1';
            isCursorHidden = false;
        }
    }

    function initCursor() {
        // Clear any existing circles
        cursor.innerHTML = '';
        
        for (let i = 0; i < TAIL_LENGTH; i++) {
            let div = document.createElement('div');
            div.classList.add('cursor-circle');
            cursor.appendChild(div);
        }
        cursorCircles = Array.from(document.querySelectorAll('.cursor-circle'));
    }
    
    function updateCursor() {  
        if (!cursorCircles || cursorCircles.length === 0) return;
        
        cursorHistory.shift();
        cursorHistory.push({ x: mouseX, y: mouseY });
        
        for (let i = 0; i < TAIL_LENGTH; i++) {
            let current = cursorHistory[i];
            let next = cursorHistory[i + 1] || cursorHistory[TAIL_LENGTH - 1];
            
            let xDiff = next.x - current.x;
            let yDiff = next.y - current.y;
            
            current.x += xDiff * 0.35;
            current.y += yDiff * 0.35;
            
            if (cursorCircles[i]) {
                cursorCircles[i].style.transform = `translate(${current.x}px, ${current.y}px) scale(${i/TAIL_LENGTH})`;  
            }
        }
        requestAnimationFrame(updateCursor);
    }
    
    document.addEventListener('mousemove', onMouseMove, false);
    
    initCursor();
    updateCursor();
    
    // Initial hide of cursor after INACTIVITY_TIMEOUT
    cursorTimeout = setTimeout(hideCursor, INACTIVITY_TIMEOUT);
});