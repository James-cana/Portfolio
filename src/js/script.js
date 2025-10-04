function updateNavigationState(targetSectionId) {
    const navLinks = document.querySelectorAll('.nav-link');
    const navBrand = document.querySelector('.nav-brand');
    navLinks.forEach(link => {
        const isTargetLink = link.getAttribute('section') === targetSectionId;
        if (isTargetLink && !link.classList.contains('active')) {
            navLinks.forEach(l => l.classList.remove('active'));
            requestAnimationFrame(() => {
                link.classList.add('active');
            });
        } else if (!isTargetLink && link.classList.contains('active')) {
            link.classList.remove('active');
        }
    });
    if (navBrand && window.innerWidth > 768) {
        if (targetSectionId !== 'home') {
            navBrand.classList.add('visible');
        } else {
            navBrand.classList.remove('visible');
        }
    }
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const href = this.getAttribute('href');
        if (href && href !== '#' && href.startsWith('#')) {
            const target = document.querySelector(href);
            if (target) {
                // Set flags to indicate user is clicking
                isUserClicking = true;
                isUserScrolling = true;
                
                // Update URL hash
                window.location.hash = href;
                // Update navigation state immediately
                activeSectionId = target.id;
                updateNavigationState(target.id);
                
                // Mobile-optimized scrolling
                if (isMobile()) {
                    // Use instant scroll on mobile for better touch response
                    target.scrollIntoView({
                        behavior: 'auto',
                        block: 'start'
                    });
                    // Add smooth scroll after instant positioning
                    setTimeout(() => {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                        // Reset flags after scroll completes
                        setTimeout(() => {
                            isUserClicking = false;
                            isUserScrolling = false;
                        }, 300);
                    }, 50);
                } else {
                    // Desktop smooth scrolling
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    // Reset flags after scroll completes
                    setTimeout(() => {
                        isUserClicking = false;
                        isUserScrolling = false;
                    }, 500);
                }
            }
        }
    });
});

const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.nav-link');
const navBrand = document.querySelector('.nav-brand');
const revealOptions = {
    root: null,
    threshold: 0.1,
    rootMargin: '0px'
};

const revealSection = (entries, observer) => {
    entries.forEach(entry => {
        const section = entry.target;
        const sectionContent = Array.from(section.children);

        if (entry.isIntersecting) {
            sectionContent.forEach((element, index) => {
                const delay = index * 100;
                element.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                element.style.transitionDelay = `${delay}ms`;
                element.style.opacity = '1';
                
                element.style.transform = 'translateY(0)';
            });
        } else {
            sectionContent.forEach((element, index) => {
                const delay = index * 50;
                element.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                element.style.transitionDelay = `${delay}ms`;
                element.style.opacity = '0';
                
                element.style.transform = 'translateY(-30px)';
            });
        }
    });
};

const sectionObserver = new IntersectionObserver(revealSection, revealOptions);
sections.forEach(section => {
    if (!section.classList.contains('hero')) {
        Array.from(section.children).forEach(child => {
            child.style.opacity = '0';
            child.style.transform = 'translateY(30px)';
        });
    }
    sectionObserver.observe(section);
});

let activeSectionId = 'home';
let navObserver = null;
let isUserScrolling = false;
let scrollTimeout = null;
let isUserClicking = false;

function isMobile() {
    return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function createNavObserver() {
    if (navObserver) {
        navObserver.disconnect();
    }
    const navObserverOptions = {
        root: null,
        rootMargin: isMobile() ? '-10% 0px -10% 0px' : '-25% 0px -25% 0px',
        threshold: isMobile() ? [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0] : [0, 0.25, 0.5, 0.75, 1.0]
    };

    navObserver = new IntersectionObserver((entries) => {
        // Don't update if user is actively clicking a nav link
        if (isUserClicking) return;
        
        let mostVisibleSection = null;
        let maxVisibility = 0;

        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const visibility = entry.intersectionRatio;
                if (visibility > maxVisibility) {
                    maxVisibility = visibility;
                    mostVisibleSection = entry.target.id;
                }
            }
        });

        const minVisibility = isMobile() ? 0.1 : 0.25;
        if (mostVisibleSection && maxVisibility > minVisibility) {
            if (activeSectionId !== mostVisibleSection) {
                activeSectionId = mostVisibleSection;
                updateNavigationState(activeSectionId);
                // Update URL hash when scrolling to a new section
                if (window.location.hash !== `#${activeSectionId}`) {
                    window.history.replaceState(null, null, `#${activeSectionId}`);
                }
            }
        }
    }, navObserverOptions);
    sections.forEach(section => {
        navObserver.observe(section);
    });
}

createNavObserver();
function updateActiveNav() {
    const scrollPosition = window.pageYOffset + window.innerHeight / 2;
    let fallbackSectionId = null;
    const viewportThreshold = isMobile() ? window.innerHeight * 0.2 : window.innerHeight * 0.5;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;

        // Consistent detection for both mobile and desktop
        const sectionCenter = sectionTop + (section.offsetHeight / 2);
        const viewportCenter = window.pageYOffset + (window.innerHeight / 2);
        const distanceFromCenter = Math.abs(sectionCenter - viewportCenter);
        
        if (distanceFromCenter < window.innerHeight * 0.4) {
            fallbackSectionId = section.id;
        }
    });

    if (!fallbackSectionId) {
        let closestDistance = Infinity;
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            const distance = Math.min(
                Math.abs(scrollPosition - sectionTop),
                Math.abs(scrollPosition - sectionBottom)
            );
            if (distance < closestDistance) {
                closestDistance = distance;
                fallbackSectionId = section.id;
            }
        });
    }

    if (fallbackSectionId && fallbackSectionId !== activeSectionId) {
        activeSectionId = fallbackSectionId;
        updateNavigationState(activeSectionId);
        // Update URL hash when fallback navigation is used
        if (window.location.hash !== `#${activeSectionId}`) {
            window.history.replaceState(null, null, `#${activeSectionId}`);
        }
    }
}

let ticking = false;

const updateParallax = () => {
    const scrolled = window.pageYOffset;

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
                const translateY = 30 * (1 - parallaxFactor);
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

let lastScrollY = window.pageYOffset;
window.addEventListener('scroll', () => {
    const currentScrollY = window.pageYOffset;
    
    // Set user scrolling flag
    isUserScrolling = true;
    
    // Clear existing timeout
    if (scrollTimeout) {
        clearTimeout(scrollTimeout);
    }
    
    // Set timeout to reset user scrolling flag
    scrollTimeout = setTimeout(() => {
        isUserScrolling = false;
        // Force navigation update after scroll stops
        updateActiveNav();
    }, 100);
    
    if (!ticking) {
        requestAnimationFrame(() => {
            // Always use manual navigation update for better responsiveness
            updateActiveNav();
            updateParallax();
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
    lastScrollY = currentScrollY;
});

// URL Routing functionality
function handleHashChange() {
    const hash = window.location.hash;
    if (hash) {
        const targetSection = hash.substring(1); // Remove the # symbol
        const targetElement = document.getElementById(targetSection);
        if (targetElement) {
            // Update active section ID
            activeSectionId = targetSection;
            // Update navigation state
            updateNavigationState(targetSection);
            // Mobile-optimized scrolling
            if (isMobile()) {
                // Use instant scroll on mobile for better performance
                targetElement.scrollIntoView({
                    behavior: 'auto',
                    block: 'start'
                });
                // Add smooth scroll after instant positioning
                setTimeout(() => {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }, 50);
            } else {
                // Desktop smooth scrolling
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    } else {
        // Only go to home if no hash and we're not already on a specific section
        if (!activeSectionId || activeSectionId === 'home') {
            activeSectionId = 'home';
            updateNavigationState('home');
            if (isMobile()) {
                document.getElementById('home').scrollIntoView({
                    behavior: 'auto',
                    block: 'start'
                });
            } else {
                document.getElementById('home').scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    }
}

// Handle browser back/forward buttons
window.addEventListener('hashchange', handleHashChange);

// Handle page load with hash
window.addEventListener('load', () => {
    const hash = window.location.hash;
    if (hash) {
        const targetSection = hash.substring(1);
        const targetElement = document.getElementById(targetSection);
        if (targetElement) {
            // Set active section ID to prevent override
            activeSectionId = targetSection;
            // Mobile-optimized loading
            if (isMobile()) {
                // Longer delay for mobile to ensure proper rendering
                setTimeout(() => {
                    targetElement.scrollIntoView({
                        behavior: 'auto',
                        block: 'start'
                    });
                    updateNavigationState(targetSection);
                    // Add smooth scroll after positioning
                    setTimeout(() => {
                        targetElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }, 100);
                }, 200);
            } else {
                // Desktop loading
                setTimeout(() => {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    updateNavigationState(targetSection);
                }, 100);
            }
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Check if there's a hash in the URL first
    const hash = window.location.hash;
    
    if (hash) {
        // If there's a hash, don't override it with home
        const targetSection = hash.substring(1);
        const targetElement = document.getElementById(targetSection);
        if (targetElement) {
            // Set the active section to the hash target
            activeSectionId = targetSection;
            updateNavigationState(targetSection);
        }
    } else {
        // Only set to home if there's no hash
        updateActiveNav();
        if (isMobile()) {
            setTimeout(() => updateActiveNav(), 50);
            setTimeout(() => updateActiveNav(), 200);
            setTimeout(() => updateActiveNav(), 500);
        }
        setTimeout(() => {
            if (window.pageYOffset < 50) {
                updateNavigationState('home');
            }
        }, 100);
    }
    
    // Handle initial hash on page load
    handleHashChange();
    
    // Mobile-specific touch handling for better URL routing
    if (isMobile()) {
        // Add touch event listeners for mobile navigation
        let touchStartY = 0;
        let touchEndY = 0;
        let isScrolling = false;
        let touchTimeout = null;
        
        document.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
            isScrolling = false;
            isUserScrolling = true;
            isUserClicking = true;
            
            // Clear any existing touch timeout
            if (touchTimeout) {
                clearTimeout(touchTimeout);
            }
        }, { passive: true });
        
        document.addEventListener('touchmove', (e) => {
            if (!isScrolling) {
                isScrolling = true;
            }
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            if (isScrolling) {
                touchEndY = e.changedTouches[0].clientY;
                const touchDiff = touchStartY - touchEndY;
                
                // Clear any existing timeout
                if (scrollTimeout) {
                    clearTimeout(scrollTimeout);
                }
                if (touchTimeout) {
                    clearTimeout(touchTimeout);
                }
                
                // If significant touch movement, update navigation after scroll settles
                if (Math.abs(touchDiff) > 30) {
                    touchTimeout = setTimeout(() => {
                        isUserScrolling = false;
                        isUserClicking = false;
                        updateActiveNav();
                    }, 100);
                } else {
                    // Reset flags for small movements
                    touchTimeout = setTimeout(() => {
                        isUserScrolling = false;
                        isUserClicking = false;
                        updateActiveNav();
                    }, 50);
                }
            } else {
                // No scrolling, just a tap
                setTimeout(() => {
                    isUserScrolling = false;
                    isUserClicking = false;
                    updateActiveNav();
                }, 50);
            }
        }, { passive: true });
    }
});

window.addEventListener('resize', () => {
    const navBrand = document.querySelector('.nav-brand');
    if (navBrand && window.innerWidth <= 768) {
        navBrand.classList.remove('visible');
    }
    
    // Reset scrolling state on resize
    isUserScrolling = false;
    if (scrollTimeout) {
        clearTimeout(scrollTimeout);
    }
    
    createNavObserver();
    setTimeout(() => {
        updateActiveNav();
        // Mobile-specific: Update URL hash after orientation change
        if (isMobile()) {
            setTimeout(() => {
                const currentSection = document.querySelector('.section[style*="opacity: 1"], .section:not([style*="opacity: 0"])');
                if (currentSection && currentSection.id !== activeSectionId) {
                    activeSectionId = currentSection.id;
                    updateNavigationState(activeSectionId);
                    if (window.location.hash !== `#${activeSectionId}`) {
                        window.history.replaceState(null, null, `#${activeSectionId}`);
                    }
                }
            }, 200);
        }
    }, 100);
});

const cardOptions = {
    threshold: 0.2,
    rootMargin: '0px'
};

const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        const card = entry.target;
        const delay = index * 100;

        if (entry.isIntersecting) {
            card.style.transition = `all 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`;
            card.style.transform = 'translateY(0) scale(1)';
            card.style.opacity = '1';
        } else {
            card.style.transition = `all 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`;
            card.style.opacity = '0';
            
            card.style.transform = 'translateY(-30px) scale(0.95)';
        }
    });
}, cardOptions);

document.querySelectorAll('.project-card, .skill-card').forEach((card) => {
    if (card.closest('.carousel-section')) {
        return;
    }
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
document.addEventListener('DOMContentLoaded', function () {
    const carouselSection = document.querySelector('.carousel-section');
    if (!carouselSection) return;

    const carousel = carouselSection.querySelector('.carousel-container');
    const track = carousel.querySelector('.carousel-track');
    const slides = carousel.querySelectorAll('.carousel-slide');
    const prevBtn = carouselSection.querySelector('.carousel-btn-prev');
    const nextBtn = carouselSection.querySelector('.carousel-btn-next');
    const indicatorsContainer = carousel.querySelector('.carousel-indicators');
    const carouselWrapper = carousel.querySelector('.carousel-wrapper');

    function generateIndicators() {
        indicatorsContainer.innerHTML = '';
        slides.forEach((slide, index) => {
            const indicator = document.createElement('button');
            indicator.className = 'carousel-indicator';
            indicator.setAttribute('data-slide', index);
            indicator.setAttribute('aria-label', `Go to slide ${index + 1}`);
            if (index === 0) {
                indicator.classList.add('active');
            }
            indicatorsContainer.appendChild(indicator);
        });
    }
    generateIndicators();
    const indicators = carousel.querySelectorAll('.carousel-indicator');

    carousel.querySelectorAll('.project-image img, .project-image a, .carousel-slide img, .carousel-slide a').forEach((el) => {
        el.setAttribute('draggable', 'false');
        el.addEventListener('dragstart', (e) => e.preventDefault());
    });

    let currentSlide = 0;
    const slideCount = slides.length;

    function updateCarousel() {
        const slideWidth = carouselWrapper.offsetWidth;
        track.style.transform = `translateX(-${currentSlide * slideWidth}px)`;

        const currentIndicators = carousel.querySelectorAll('.carousel-indicator');
        currentIndicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentSlide);
        });
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

    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);
    indicatorsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('carousel-indicator')) {
            const slideIndex = parseInt(e.target.getAttribute('data-slide'));
            goToSlide(slideIndex);
        }
    });
    document.addEventListener('keydown', (e) => {
        if (document.activeElement.closest('.carousel-section')) {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                prevSlide();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                nextSlide();
            }
        }
    });



    updateCarousel();
    window.addEventListener('resize', updateCarousel);
});
document.addEventListener('DOMContentLoaded', function () {
    const isMobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
        return;
    }

    const TAIL_LENGTH = 20;

    const cursor = document.getElementById('cursor');
    if (!cursor) return;

    let mouseX = 0;
    let mouseY = 0;

    let cursorCircles;
    let cursorHistory = Array(TAIL_LENGTH).fill({ x: 0, y: 0 });

    let cursorTimeout;
    let isCursorHidden = false;
    const INACTIVITY_TIMEOUT = 1000;

    function onMouseMove(event) {
        showCursor();
        clearTimeout(cursorTimeout);
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
                cursorCircles[i].style.transform = `translate(${current.x}px, ${current.y}px) scale(${i / TAIL_LENGTH})`;
            }
        }
        requestAnimationFrame(updateCursor);
    }

    document.addEventListener('mousemove', onMouseMove, false);
    initCursor();
    updateCursor();
    cursorTimeout = setTimeout(hideCursor, INACTIVITY_TIMEOUT);
});
document.addEventListener('DOMContentLoaded', function () {
    const videoModal = document.getElementById('videoModal');
    const projectVideo = document.getElementById('projectVideo');
    const videoCloseButton = document.querySelector('.video-close-button');
    const videoTriggers = document.querySelectorAll('.video-trigger');
    const progressFill = document.getElementById('progressFill');
    const progressTrack = document.querySelector('.progress-track');
    const videoPlayPauseIndicator = document.getElementById('videoPlayPauseIndicator');

    function showPlayPauseIndicator(isPaused) {
        if (!videoPlayPauseIndicator) return;
        videoPlayPauseIndicator.classList.remove('show', 'hide', 'show-play');
        if (isPaused) {
            videoPlayPauseIndicator.classList.add('show', 'show-play');
        } else {
            videoPlayPauseIndicator.classList.add('show');
            setTimeout(() => {
                hidePlayPauseIndicator();
            }, 500);
        }
    }
    function hidePlayPauseIndicator() {
        if (!videoPlayPauseIndicator) return;
        videoPlayPauseIndicator.classList.remove('show');
        videoPlayPauseIndicator.classList.add('hide');
        setTimeout(() => {
            videoPlayPauseIndicator.classList.remove('hide', 'show-pause');
        }, 300);
    }

    function updateProgress() {
        if (projectVideo.duration) {
            const progress = (projectVideo.currentTime / projectVideo.duration) * 100;
            progressFill.style.width = progress + '%';
        }
    }
    let progressAnimationId;
    function animateProgress() {
        updateProgress();
        if (!projectVideo.paused) {
            progressAnimationId = requestAnimationFrame(animateProgress);
        }
    }

    function showVideoModal(videoSrc) {
        projectVideo.src = videoSrc;
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(() => {
            videoModal.classList.add('show');
        });
        projectVideo.addEventListener('play', function () {
            animateProgress();
            showPlayPauseIndicator(false);
        });
        projectVideo.addEventListener('pause', function () {
            if (progressAnimationId) {
                cancelAnimationFrame(progressAnimationId);
            }
            showPlayPauseIndicator(true);
        });
    }

    function hideVideoModal() {
        videoModal.classList.remove('show');
        document.body.style.overflow = 'auto';
        projectVideo.pause();
        projectVideo.currentTime = 0;
        progressFill.style.width = '0%';
        if (progressAnimationId) {
            cancelAnimationFrame(progressAnimationId);
        }
        hidePlayPauseIndicator();
    }

    videoTriggers.forEach(trigger => {
        trigger.addEventListener('click', function (e) {
            e.preventDefault();
            const videoSrc = this.getAttribute('data-video');
            if (videoSrc) {
                showVideoModal(videoSrc);
            }
        });
    });
    if (videoCloseButton) {
        videoCloseButton.addEventListener('click', hideVideoModal);
    }
    videoModal.addEventListener('click', function (e) {
        if (e.target === videoModal) {
            hideVideoModal();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (videoModal.classList.contains('show')) {
            if (e.key === 'Escape') {
                hideVideoModal();
            } else if (e.key === ' ' || e.key === 'Spacebar') {
                e.preventDefault();
                if (projectVideo.paused) {
                    projectVideo.play();
                } else {
                    projectVideo.pause();
                }
            }
        }
    });
    projectVideo.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (projectVideo.paused) {
            projectVideo.play();
        } else {
            projectVideo.pause();
        }
    });

    let isDragging = false;
    let dragStartX = 0;
    let dragStartTime = 0;
    let wasPlaying = false;
    if (progressTrack) {
        progressTrack.addEventListener('click', function (e) {
            if (!isDragging) {
                e.preventDefault();
                e.stopPropagation();
                if (projectVideo.duration) {
                    const rect = progressTrack.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
                    const newTime = percentage * projectVideo.duration;
                    projectVideo.currentTime = newTime;
                }
            }
        });

        progressTrack.addEventListener('mousedown', function (e) {
            e.preventDefault();
            e.stopPropagation();
            isDragging = true;
            dragStartX = e.clientX;
            wasPlaying = !projectVideo.paused;
            progressTrack.classList.add('dragging');
            projectVideo.pause();
            if (projectVideo.duration) {
                const rect = progressTrack.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const percentage = Math.max(0, Math.min(1, clickX / rect.width));
                const newTime = percentage * projectVideo.duration;
                projectVideo.currentTime = newTime;
                dragStartTime = newTime;
                const progress = (newTime / projectVideo.duration) * 100;
                progressFill.style.width = progress + '%';
            }
        });

        function handleMouseMove(e) {
            if (isDragging && projectVideo.duration) {
                const rect = progressTrack.getBoundingClientRect();
                const deltaX = e.clientX - dragStartX;
                const deltaPercentage = deltaX / rect.width;
                const newTime = Math.max(0, Math.min(projectVideo.duration, dragStartTime + (deltaPercentage * projectVideo.duration)));
                projectVideo.currentTime = newTime;
                const progress = (newTime / projectVideo.duration) * 100;
                progressFill.style.width = progress + '%';
            }
        }
        function handleMouseUp(e) {
            if (isDragging) {
                isDragging = false;
                progressTrack.classList.remove('dragging');
                if (wasPlaying) {
                    projectVideo.play();
                }
            }
        }

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        progressTrack.addEventListener('touchstart', function (e) {
            e.preventDefault();
            e.stopPropagation();
            isDragging = true;
            dragStartX = e.touches[0].clientX;
            wasPlaying = !projectVideo.paused;
            progressTrack.classList.add('dragging');
            projectVideo.pause();
            if (projectVideo.duration) {
                const rect = progressTrack.getBoundingClientRect();
                const touchX = e.touches[0].clientX - rect.left;
                const percentage = Math.max(0, Math.min(1, touchX / rect.width));
                const newTime = percentage * projectVideo.duration;
                projectVideo.currentTime = newTime;
                dragStartTime = newTime;
                const progress = (newTime / projectVideo.duration) * 100;
                progressFill.style.width = progress + '%';
            }
        }, { passive: false });

        function handleTouchMove(e) {
            if (isDragging && projectVideo.duration) {
                e.preventDefault();
                const rect = progressTrack.getBoundingClientRect();
                const deltaX = e.touches[0].clientX - dragStartX;
                const deltaPercentage = deltaX / rect.width;
                const newTime = Math.max(0, Math.min(projectVideo.duration, dragStartTime + (deltaPercentage * projectVideo.duration)));

                projectVideo.currentTime = newTime;

                const progress = (newTime / projectVideo.duration) * 100;
                progressFill.style.width = progress + '%';
            }
        }

        function handleTouchEnd(e) {
            if (isDragging) {
                isDragging = false;
                progressTrack.classList.remove('dragging');

                if (wasPlaying) {
                    projectVideo.play();
                }
            }
        }

        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd);
    }
    videoModal.addEventListener('transitionend', function (e) {
        if (e.target === videoModal && !videoModal.classList.contains('show')) {
            projectVideo.pause();
            projectVideo.currentTime = 0;
        }
    });
});
document.addEventListener('DOMContentLoaded', function () {
    const statBars = document.querySelectorAll('.stat-fill');
    const statBarObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statFill = entry.target;
                const targetWidth = statFill.getAttribute('data-width');
                statFill.style.setProperty('--target-width', targetWidth);
                setTimeout(() => {
                    statFill.classList.add('animate');
                }, 100);
                statBarObserver.unobserve(statFill);
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: '0px 0px -20% 0px'
    });
    statBars.forEach(statBar => {
        statBarObserver.observe(statBar);
    });
});