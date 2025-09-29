// Centralized navigation state management with smooth transitions
function updateNavigationState(targetSectionId) {
    const navLinks = document.querySelectorAll('.nav-link');
    const navBrand = document.querySelector('.nav-brand');

    // Update active nav link with smooth transition
    navLinks.forEach(link => {
        const isTargetLink = link.getAttribute('section') === targetSectionId;

        if (isTargetLink && !link.classList.contains('active')) {
            // Remove active class from all links first
            navLinks.forEach(l => l.classList.remove('active'));

            // Add active class to target link with a slight delay for smooth transition
            requestAnimationFrame(() => {
                link.classList.add('active');
            });
        } else if (!isTargetLink && link.classList.contains('active')) {
            link.classList.remove('active');
        }
    });

    // Update brand visibility (only on desktop)
    if (navBrand && window.innerWidth > 768) {
        if (targetSectionId !== 'home') {
            navBrand.classList.add('visible');
        } else {
            navBrand.classList.remove('visible');
        }
    }
}

// Standard navigation click handlers
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const href = this.getAttribute('href');

        // Only proceed with smooth scrolling if href is a valid selector (not just "#")
        if (href && href !== '#' && href.startsWith('#')) {
            const target = document.querySelector(href);
            if (target) {
                // Update navigation state immediately
                updateNavigationState(target.id);

                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.nav-link');
const navBrand = document.querySelector('.nav-brand');

// Simple intersection observer for scroll animations
const revealOptions = {
    root: null,
    threshold: 0.1,
    rootMargin: '0px'
};

const revealSection = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const section = entry.target;
            const sectionContent = Array.from(section.children);

            sectionContent.forEach((element, index) => {
                const delay = index * 100;
                element.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                element.style.transitionDelay = `${delay}ms`;
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            });
        }
    });
};

const sectionObserver = new IntersectionObserver(revealSection, revealOptions);

// Initialize sections for animation
sections.forEach(section => {
    if (!section.classList.contains('hero')) {
        Array.from(section.children).forEach(child => {
            child.style.opacity = '0';
            child.style.transform = 'translateY(30px)';
        });
    }
    sectionObserver.observe(section);
});

// Enhanced navigation state update using Intersection Observer
let activeSectionId = 'home'; // Default to home section
let navObserver = null;

// Mobile detection function
function isMobile() {
    return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Create intersection observer for navigation with mobile-optimized settings
function createNavObserver() {
    // Destroy existing observer if it exists
    if (navObserver) {
        navObserver.disconnect();
    }

    // Create intersection observer for navigation with optimized thresholds
    const navObserverOptions = {
        root: null,
        rootMargin: isMobile() ? '-10% 0px -10% 0px' : '-25% 0px -25% 0px', // More sensitive on mobile
        threshold: isMobile() ? [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0] : [0, 0.25, 0.5, 0.75, 1.0]
    };

    navObserver = new IntersectionObserver((entries) => {
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

        // Update navigation with mobile-specific thresholds
        const minVisibility = isMobile() ? 0.15 : 0.25;
        if (mostVisibleSection && maxVisibility > minVisibility) {
            if (activeSectionId !== mostVisibleSection) {
                activeSectionId = mostVisibleSection;
                updateNavigationState(activeSectionId);
            }
        }
    }, navObserverOptions);

    // Observe all sections for navigation
    sections.forEach(section => {
        navObserver.observe(section);
    });
}

// Initialize the observer
createNavObserver();

// Enhanced fallback function for scroll-based navigation with mobile optimization
function updateActiveNav() {
    const scrollPosition = window.pageYOffset + window.innerHeight / 2;
    let fallbackSectionId = null;

    // More aggressive detection for mobile devices
    const viewportThreshold = isMobile() ? window.innerHeight * 0.3 : window.innerHeight * 0.5;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;

        // For mobile, use a more sensitive detection
        if (isMobile()) {
            // Check if any part of the section is in the top 30% of viewport
            if (sectionTop <= window.pageYOffset + viewportThreshold &&
                sectionBottom >= window.pageYOffset) {
                fallbackSectionId = section.id;
            }
        } else {
            // Check if the middle of the viewport is within this section
            if (scrollPosition >= sectionTop && scrollPosition <= sectionBottom) {
                fallbackSectionId = section.id;
            }
        }
    });

    // If no section is found, find the closest one
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

// Standard scroll event listener for navigation state and effects
let lastScrollY = window.pageYOffset;

window.addEventListener('scroll', () => {
    // Use fallback navigation update less frequently (throttled)
    if (!ticking) {
        requestAnimationFrame(() => {
            // Use fallback more frequently on mobile for better responsiveness
            if (isMobile() || window.pageYOffset < 100) {
                updateActiveNav();
            }

            updateParallax();
            ticking = false;
        });
        ticking = true;
    }

    // Navigation scroll effect
    const nav = document.querySelector('nav');
    if (window.pageYOffset > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }

    lastScrollY = window.pageYOffset;
});

// Initialize navigation state on page load
document.addEventListener('DOMContentLoaded', () => {
    // Set initial active state
    updateActiveNav();

    // Force navigation update for mobile devices
    if (isMobile()) {
        // Multiple attempts to ensure proper detection on mobile
        setTimeout(() => updateActiveNav(), 50);
        setTimeout(() => updateActiveNav(), 200);
        setTimeout(() => updateActiveNav(), 500);
    }

    // Ensure proper initial state after a short delay
    setTimeout(() => {
        if (window.pageYOffset < 50) {
            updateNavigationState('home');
        }
    }, 100);
});

// Handle window resize and mobile optimization
window.addEventListener('resize', () => {
    const navBrand = document.querySelector('.nav-brand');
    if (navBrand && window.innerWidth <= 768) {
        // Force hide on mobile
        navBrand.classList.remove('visible');
    }

    // Recreate observer with new mobile/desktop settings
    createNavObserver();

    // Recalculate navigation state after resize
    // Use a small delay to ensure layout is complete
    setTimeout(() => {
        updateActiveNav();
    }, 100);
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
    // Skip carousel project cards to avoid fadeup animation
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


// Carousel Implementation
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

    // Dynamically generate indicators based on number of slides
    function generateIndicators() {
        indicatorsContainer.innerHTML = ''; // Clear existing indicators

        slides.forEach((slide, index) => {
            const indicator = document.createElement('button');
            indicator.className = 'carousel-indicator';
            indicator.setAttribute('data-slide', index);
            indicator.setAttribute('aria-label', `Go to slide ${index + 1}`);

            // Set first indicator as active
            if (index === 0) {
                indicator.classList.add('active');
            }

            indicatorsContainer.appendChild(indicator);
        });
    }

    // Generate indicators
    generateIndicators();

    // Get the newly created indicators
    const indicators = carousel.querySelectorAll('.carousel-indicator');

    // Disable native drag thumbnail preview on project images and links
    carousel.querySelectorAll('.project-image img, .project-image a, .carousel-slide img, .carousel-slide a').forEach((el) => {
        el.setAttribute('draggable', 'false');
        el.addEventListener('dragstart', (e) => e.preventDefault());
    });

    let currentSlide = 0;
    const slideCount = slides.length;

    function updateCarousel() {
        const slideWidth = carouselWrapper.offsetWidth;
        track.style.transform = `translateX(-${currentSlide * slideWidth}px)`;

        // Update indicators (get fresh reference since they're dynamically generated)
        const currentIndicators = carousel.querySelectorAll('.carousel-indicator');
        currentIndicators.forEach((indicator, index) => {
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

    // Add event listeners to indicators (they're dynamically generated)
    indicatorsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('carousel-indicator')) {
            const slideIndex = parseInt(e.target.getAttribute('data-slide'));
            goToSlide(slideIndex);
        }
    });

    // Keyboard navigation
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



    // Initialize carousel
    updateCarousel();

    // Handle window resize
    window.addEventListener('resize', updateCarousel);
});

// Gooey Cursor Implementation
document.addEventListener('DOMContentLoaded', function () {
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
    let cursorHistory = Array(TAIL_LENGTH).fill({ x: 0, y: 0 });

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
                cursorCircles[i].style.transform = `translate(${current.x}px, ${current.y}px) scale(${i / TAIL_LENGTH})`;
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

// Video Modal Implementation
document.addEventListener('DOMContentLoaded', function () {
    const videoModal = document.getElementById('videoModal');
    const projectVideo = document.getElementById('projectVideo');
    const videoCloseButton = document.querySelector('.video-close-button');
    const videoTriggers = document.querySelectorAll('.video-trigger');
    const progressFill = document.getElementById('progressFill');
    const progressTrack = document.querySelector('.progress-track');
    const videoPlayPauseIndicator = document.getElementById('videoPlayPauseIndicator');

    // Function to show play/pause indicator
    function showPlayPauseIndicator(isPaused) {
        if (!videoPlayPauseIndicator) return;

        // Remove existing classes
        videoPlayPauseIndicator.classList.remove('show', 'hide', 'show-pause');

        // Add appropriate classes
        if (isPaused) {
            videoPlayPauseIndicator.classList.add('show', 'show-pause');
            // Don't auto-hide pause indicator - keep it visible
        } else {
            videoPlayPauseIndicator.classList.add('show');
            // Auto-hide play indicator after 0.5 seconds
            setTimeout(() => {
                hidePlayPauseIndicator();
            }, 500);
        }
    }

    // Function to hide play/pause indicator
    function hidePlayPauseIndicator() {
        if (!videoPlayPauseIndicator) return;

        videoPlayPauseIndicator.classList.remove('show');
        videoPlayPauseIndicator.classList.add('hide');

        // Remove hide class after transition
        setTimeout(() => {
            videoPlayPauseIndicator.classList.remove('hide', 'show-pause');
        }, 300);
    }

    // Function to update progress bar with smooth animation
    function updateProgress() {
        if (projectVideo.duration) {
            const progress = (projectVideo.currentTime / projectVideo.duration) * 100;
            progressFill.style.width = progress + '%';
        }
    }

    // Smooth progress bar animation using requestAnimationFrame
    let progressAnimationId;
    function animateProgress() {
        updateProgress();
        if (!projectVideo.paused) {
            progressAnimationId = requestAnimationFrame(animateProgress);
        }
    }

    // Function to show video modal
    function showVideoModal(videoSrc) {
        projectVideo.src = videoSrc;
        document.body.style.overflow = 'hidden'; // Prevent background scrolling

        // Small delay to ensure proper initialization
        requestAnimationFrame(() => {
            videoModal.classList.add('show');
        });

        // Start smooth progress tracking when video starts playing
        projectVideo.addEventListener('play', function () {
            animateProgress();
            showPlayPauseIndicator(false); // Show play indicator
        });

        projectVideo.addEventListener('pause', function () {
            if (progressAnimationId) {
                cancelAnimationFrame(progressAnimationId);
            }
            showPlayPauseIndicator(true); // Show pause indicator
        });
    }

    // Function to hide video modal
    function hideVideoModal() {
        videoModal.classList.remove('show');
        document.body.style.overflow = 'auto'; // Restore scrolling
        // Pause video when modal is closed
        projectVideo.pause();
        projectVideo.currentTime = 0;
        progressFill.style.width = '0%';

        // Stop progress animation
        if (progressAnimationId) {
            cancelAnimationFrame(progressAnimationId);
        }

        // Hide play/pause indicator
        hidePlayPauseIndicator();
    }

    // Add click event listeners to video triggers
    videoTriggers.forEach(trigger => {
        trigger.addEventListener('click', function (e) {
            e.preventDefault();
            const videoSrc = this.getAttribute('data-video');
            if (videoSrc) {
                showVideoModal(videoSrc);
            }
        });
    });

    // Close modal when close button is clicked
    if (videoCloseButton) {
        videoCloseButton.addEventListener('click', hideVideoModal);
    }

    // Close modal when clicking outside the video
    videoModal.addEventListener('click', function (e) {
        if (e.target === videoModal) {
            hideVideoModal();
        }
    });

    // Close modal with Escape key and play/pause with Spacebar
    document.addEventListener('keydown', function (e) {
        if (videoModal.classList.contains('show')) {
            if (e.key === 'Escape') {
                hideVideoModal();
            } else if (e.key === ' ' || e.key === 'Spacebar') {
                e.preventDefault(); // Prevent page scroll
                if (projectVideo.paused) {
                    projectVideo.play();
                } else {
                    projectVideo.pause();
                }
            }
        }
    });

    // Video click to play/pause
    projectVideo.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        if (projectVideo.paused) {
            projectVideo.play();
        } else {
            projectVideo.pause();
        }
    });

    // Progress bar click to seek and drag functionality
    let isDragging = false;
    let dragStartX = 0;
    let dragStartTime = 0;
    let wasPlaying = false;

    if (progressTrack) {
        // Click to seek (only if not dragging)
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

        // Mouse drag functionality
        progressTrack.addEventListener('mousedown', function (e) {
            e.preventDefault();
            e.stopPropagation();

            isDragging = true;
            dragStartX = e.clientX;
            wasPlaying = !projectVideo.paused;

            // Add dragging class for visual feedback
            progressTrack.classList.add('dragging');

            // Pause video while dragging
            projectVideo.pause();

            // Immediately update position on mousedown and set as drag start time
            if (projectVideo.duration) {
                const rect = progressTrack.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const percentage = Math.max(0, Math.min(1, clickX / rect.width));
                const newTime = percentage * projectVideo.duration;
                projectVideo.currentTime = newTime;
                dragStartTime = newTime; // Set drag start time to clicked position

                // Immediately update the progress bar visual
                const progress = (newTime / projectVideo.duration) * 100;
                progressFill.style.width = progress + '%';
            }
        });

        // Mouse move during drag
        function handleMouseMove(e) {
            if (isDragging && projectVideo.duration) {
                const rect = progressTrack.getBoundingClientRect();
                const deltaX = e.clientX - dragStartX;
                const deltaPercentage = deltaX / rect.width;
                const newTime = Math.max(0, Math.min(projectVideo.duration, dragStartTime + (deltaPercentage * projectVideo.duration)));

                projectVideo.currentTime = newTime;

                // Immediately update the progress bar visual
                const progress = (newTime / projectVideo.duration) * 100;
                progressFill.style.width = progress + '%';
            }
        }

        // Mouse up to end drag
        function handleMouseUp(e) {
            if (isDragging) {
                isDragging = false;
                progressTrack.classList.remove('dragging');

                // Resume video if it was playing before drag
                if (wasPlaying) {
                    projectVideo.play();
                }
            }
        }

        // Add event listeners
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        // Touch support for mobile
        progressTrack.addEventListener('touchstart', function (e) {
            e.preventDefault();
            e.stopPropagation();

            isDragging = true;
            dragStartX = e.touches[0].clientX;
            wasPlaying = !projectVideo.paused;

            progressTrack.classList.add('dragging');
            projectVideo.pause();

            // Immediately update position on touchstart and set as drag start time
            if (projectVideo.duration) {
                const rect = progressTrack.getBoundingClientRect();
                const touchX = e.touches[0].clientX - rect.left;
                const percentage = Math.max(0, Math.min(1, touchX / rect.width));
                const newTime = percentage * projectVideo.duration;
                projectVideo.currentTime = newTime;
                dragStartTime = newTime; // Set drag start time to touched position

                // Immediately update the progress bar visual
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

                // Immediately update the progress bar visual
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

    // Pause video when modal is hidden (for better performance)
    videoModal.addEventListener('transitionend', function (e) {
        if (e.target === videoModal && !videoModal.classList.contains('show')) {
            projectVideo.pause();
            projectVideo.currentTime = 0;
        }
    });
});