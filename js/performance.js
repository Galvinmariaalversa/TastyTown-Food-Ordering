/**
 * TastyTown — Shared Performance & UX Module
 * 
 * Handles:
 *  - Scroll-reveal (IntersectionObserver, fires once, unobserves)
 *  - Stagger children reveal
 *  - Lazy image smooth fade-in
 *  - RAF-throttled navbar auto-hide on scroll down / show on scroll up
 *  - Passive event listeners throughout
 *  - Debounced resize handler
 *  - Reduced-motion awareness
 *  - Touch device tap highlight removal
 *  - Smooth anchor scroll for hash links
 *  - Body scroll-lock width compensation (prevent layout shift on modal open)
 */

// ─────────────────────────────────────────────
// 1. Reduced Motion Detection
// ─────────────────────────────────────────────
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ─────────────────────────────────────────────
// 2. Touch Device Optimisation
// ─────────────────────────────────────────────
if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    // Remove grey flash on tap (iOS/Android)
    document.documentElement.style.setProperty('-webkit-tap-highlight-color', 'transparent');
    // Ensure smooth momentum scrolling on iOS
    document.documentElement.style.setProperty('-webkit-overflow-scrolling', 'touch');
}

// ─────────────────────────────────────────────
// 3. Scroll-Reveal via IntersectionObserver
// ─────────────────────────────────────────────
let revealObserver = null;
let staggerObserver = null;

function initScrollReveal() {
    if (prefersReducedMotion) {
        // Immediately reveal everything if user prefers reduced motion
        document.querySelectorAll('.scroll-reveal').forEach(el => el.classList.add('active'));
        document.querySelectorAll('.stagger-children').forEach(el => el.classList.add('active'));
        return;
    }

    revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Fire only once
            }
        });
    }, {
        threshold: 0.05,
        rootMargin: '0px 0px -30px 0px'
    });

    document.querySelectorAll('.scroll-reveal').forEach(el => {
        revealObserver.observe(el);
    });

    // Stagger children observer
    staggerObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Apply stagger delays to direct children
                const children = entry.target.children;
                Array.from(children).forEach((child, i) => {
                    // Cap delay at 500ms to avoid long waits
                    const delay = Math.min(i * 80, 500);
                    child.style.transitionDelay = `${delay}ms`;
                });
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.05,
        rootMargin: '0px 0px -30px 0px'
    });

    document.querySelectorAll('.stagger-children').forEach(el => {
        staggerObserver.observe(el);
    });
}

// ─────────────────────────────────────────────
// 4. Lazy Image Smooth Fade-In & MutationObserver
// ─────────────────────────────────────────────
function setupImageFadeIn(img) {
    if (img.classList.contains('img-loaded') || img.classList.contains('img-lazy-pending')) return;

    const handleLoad = () => {
        img.classList.remove('img-lazy-pending');
        img.classList.add('img-loaded');
    };

    if (img.complete && img.naturalWidth > 0) {
        img.classList.add('img-loaded');
    } else {
        img.classList.add('img-lazy-pending');
        img.addEventListener('load', handleLoad, { once: true });
        img.addEventListener('error', handleLoad, { once: true });
    }
}

function initImageFadeIn() {
    document.querySelectorAll('img[loading="lazy"]').forEach(img => setupImageFadeIn(img));
}

// Observe dynamically added images and scroll-reveal elements (perfect for menu.html AJAX grid)
function observeDynamicElements() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    // Check for lazy images
                    const imgs = node.tagName === 'IMG' && node.getAttribute('loading') === 'lazy'
                        ? [node]
                        : node.querySelectorAll('img[loading="lazy"]');
                    imgs.forEach(img => setupImageFadeIn(img));

                    // Check for scroll reveals
                    if (revealObserver) {
                        const reveals = node.classList.contains('scroll-reveal')
                            ? [node]
                            : node.querySelectorAll('.scroll-reveal');
                        reveals.forEach(el => revealObserver.observe(el));
                    }

                    // Check for stagger children
                    if (staggerObserver) {
                        const staggers = node.classList.contains('stagger-children')
                            ? [node]
                            : node.querySelectorAll('.stagger-children');
                        staggers.forEach(el => staggerObserver.observe(el));
                    }
                }
            });
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// ─────────────────────────────────────────────
// 5. Navbar Auto-Hide on Scroll Down / Show on Scroll Up
// ─────────────────────────────────────────────
function initNavHide() {
    if (window.innerWidth < 768) return; // Disable on mobile to prevent scroll jank, repaint storms, and layout gaps
    const nav = document.querySelector('nav.sticky');
    if (!nav) return;

    // Ensure GPU layer and smooth transition on the nav element
    nav.style.transition = 'transform 0.38s cubic-bezier(0.16, 1, 0.3, 1)';
    nav.style.willChange = 'transform';

    let lastScrollY = window.scrollY;
    let ticking = false;
    const SCROLL_THRESHOLD = 80; // Only hide after scrolling 80px from top

    const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            const currentScrollY = window.scrollY;
            const delta = currentScrollY - lastScrollY;

            if (currentScrollY > SCROLL_THRESHOLD) {
                if (delta > 4) {
                    // Scrolling down → hide nav
                    nav.style.transform = 'translateY(-110%)';
                } else if (delta < -4) {
                    // Scrolling up → show nav
                    nav.style.transform = 'translateY(0)';
                }
            } else {
                // Near top of page → always show
                nav.style.transform = 'translateY(0)';
            }

            lastScrollY = currentScrollY;
            ticking = false;
        });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
}

// ─────────────────────────────────────────────
// 6. Smooth Anchor Scroll for Hash Links
// ─────────────────────────────────────────────
function initAnchorScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (href === '#' || href === '#!') return;

            const target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();

            const nav = document.querySelector('nav.sticky');
            const navHeight = nav ? nav.offsetHeight : 0;
            const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight - 8;

            window.scrollTo({
                top: targetTop,
                behavior: prefersReducedMotion ? 'auto' : 'smooth'
            });

            // Show nav when navigating via anchor
            if (nav) nav.style.transform = 'translateY(0)';
        });
    });
}

// ─────────────────────────────────────────────
// 7. Body Scroll-Lock Width Compensation
//    Prevents layout shift when overflow:hidden is added
// ─────────────────────────────────────────────
function initScrollbarWidthCompensation() {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
}

// ─────────────────────────────────────────────
// 8. Debounced Resize Handler
// ─────────────────────────────────────────────
function initResizeHandler() {
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            initScrollbarWidthCompensation();
        }, 150);
    }, { passive: true });
}

// ─────────────────────────────────────────────
// 9. Premium Micro-interaction: Button Press Feedback
//    Ensures touch devices feel as responsive as desktop
// ─────────────────────────────────────────────
function initButtonFeedback() {
    if (prefersReducedMotion) return;

    // Add active:scale feedback to interactive elements on touch devices
    const interactiveSelectors = [
        'button', 'a.bg-primary', '[class*="hover-lift"]',
        '.add-btn', '.filter-btn', '.chef-reply-btn', '.product-card'
    ];

    document.querySelectorAll(interactiveSelectors.join(',')).forEach(el => {
        el.addEventListener('touchstart', () => {
            el.style.transition = 'transform 0.1s ease';
            el.style.transform = 'scale(0.97)';
        }, { passive: true });

        el.addEventListener('touchend', () => {
            setTimeout(() => {
                el.style.transform = '';
            }, 100);
        }, { passive: true });

        el.addEventListener('touchcancel', () => {
            el.style.transform = '';
        }, { passive: true });
    });
}

// ─────────────────────────────────────────────
// 10. Intersection Observer for Section Count Animation
//     Animate number counters when they enter viewport
// ─────────────────────────────────────────────
function initCounterAnimation() {
    if (prefersReducedMotion) return;

    const counters = document.querySelectorAll('[data-count-up]');
    if (!counters.length) return;

    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseFloat(el.dataset.countUp);
                const duration = 1200;
                const start = performance.now();
                const suffix = el.dataset.suffix || '';

                const tick = (now) => {
                    const elapsed = now - start;
                    const progress = Math.min(elapsed / duration, 1);
                    // Ease-out cubic
                    const eased = 1 - Math.pow(1 - progress, 3);
                    el.textContent = Math.round(eased * target) + suffix;
                    if (progress < 1) requestAnimationFrame(tick);
                };

                requestAnimationFrame(tick);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(el => counterObserver.observe(el));
}

// ─────────────────────────────────────────────
// 11. Image Error Fallback (graceful degradation)
// ─────────────────────────────────────────────
function initImageErrorHandling() {
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', () => {
            img.style.backgroundColor = '#f3f4f6';
            img.style.minHeight = '40px';
        }, { once: true });
    });
}

// ─────────────────────────────────────────────
// 12. Focus Visible Polyfill Helper
//     Adds keyboard-nav class to body for enhanced focus rings
// ─────────────────────────────────────────────
function initFocusVisibility() {
    let usingMouse = false;

    document.addEventListener('mousedown', () => { usingMouse = true; }, { passive: true });
    document.addEventListener('keydown', () => { usingMouse = false; }, { passive: true });

    document.addEventListener('focusin', (e) => {
        if (!usingMouse) {
            e.target.setAttribute('data-keyboard-focus', 'true');
        }
    });

    document.addEventListener('focusout', (e) => {
        e.target.removeAttribute('data-keyboard-focus');
    });
}

// ─────────────────────────────────────────────
// Bootstrap — Run all initialisers
// ─────────────────────────────────────────────
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

function init() {
    initScrollReveal();
    initImageFadeIn();
    observeDynamicElements(); // Start MutationObserver for dynamically loaded images and scroll reveal items
    initNavHide();
    initAnchorScroll();
    initScrollbarWidthCompensation();
    initResizeHandler();
    initButtonFeedback();
    initCounterAnimation();
    initImageErrorHandling();
    initFocusVisibility();
}
