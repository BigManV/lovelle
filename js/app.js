/* ============================================================
   LOVELLE — Main Application Controller
   Navigation, Accordions, Page Transitions, Initialization
   ============================================================ */

(function () {
    'use strict';

    // --- Globals ---
    let webgl, animations;
    let currentPage = 'home';
    let pageTransitioning = false;
    const socialRipples = [];
    let activeCard = null;
    let svcTransitioning = false;

    const PAGE_ROUTES = Object.freeze({
        home: '/',
        services: '/services',
        courses: '/courses',
        enquiry: '/enquire'
    });

    const PAGE_TITLES = Object.freeze({
        home: 'LOVELLE - Premium Hair Salon',
        services: 'Services | LOVELLE',
        courses: 'Academy Courses | LOVELLE',
        enquiry: 'Course Enquiry | LOVELLE'
    });

    // --- Init ---
    async function init() {
        setInitialPageFromLocation();
        document.querySelectorAll('.site-footer p').forEach((el) => {
            el.textContent = '© 2026 LOVELLE. ALL RIGHTS RESERVED.';
        });

        // Initialize WebGL background
        webgl = new WebGLEngine();

        // Initialize animation controller
        animations = new AnimationController();



        // Initialize social button ripple effects
        document.querySelectorAll('.social-ripple-canvas').forEach(c => {
            socialRipples.push(new SocialRippleEffect(c));
        });

        // Build services card grid
        buildServicesGrid();

        // Bind navigation
        bindNavigation();

        // Bind the academy enquiry form
        bindEnquiryForm();

        // Set initial states for animated elements
        gsap.set('#page-home .hero-headline .word', { yPercent: 120 });
        gsap.set('#page-services .services-headline .word', { yPercent: 120 });
        gsap.set('.hero-brand .brand-leaf, .services-brand .brand-leaf', { opacity: 0, y: 28, scale: 0.86, rotate: -10 });

        const startAnimations = async () => {
            // Play loading sequence
            await animations.playLoadingSequence();

            // Animate whichever route was opened directly
            animatePage(currentPage);
        };

        if (sessionStorage.getItem('lovelle-consent') === 'accepted') {
            startAnimations();
        } else {
            window.addEventListener('lovelle-consent-accepted', startAnimations, { once: true });
        }
    }

    function initHomeScrollAnimations() {
        animations.initPhotoScrollAnimations();
        animations.initFindUsAnimations();
        animations.initCTAAnimation();
        animations.refresh();
    }

    // --- Navigation ---
    function bindNavigation() {
        document.querySelectorAll('[data-page]').forEach(link => {
            link.addEventListener('click', async (e) => {
                if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

                e.preventDefault();
                const target = link.dataset.page;
                if (!PAGE_ROUTES[target] || target === currentPage || pageTransitioning) return;

                // Carry a selected course from its course card into the enquiry form
                if (target === 'enquiry' && link.dataset.course) {
                    const courseSelect = document.getElementById('enquiry-course');
                    if (courseSelect) courseSelect.value = link.dataset.course;
                }

                await navigateToPage(target, true);
            });
        });

        window.addEventListener('popstate', async () => {
            const target = getPageFromPath(window.location.pathname);
            if (target !== currentPage) await navigateToPage(target, false);
        });
    }

    async function navigateToPage(targetPage, updateHistory) {
        if (pageTransitioning || targetPage === currentPage) return;

        pageTransitioning = true;
        document.body.classList.add('is-transitioning');

        try {
            await animations.playBrandTransition(() => {
                if (updateHistory) {
                    window.history.pushState({ page: targetPage }, '', PAGE_ROUTES[targetPage]);
                }
                switchPage(targetPage);
            });
        } finally {
            document.body.classList.remove('is-transitioning');
            pageTransitioning = false;

            // Keep the visible page aligned if history changed during an animation.
            const locationPage = getPageFromPath(window.location.pathname);
            if (locationPage !== currentPage) navigateToPage(locationPage, false);
        }
    }

    function switchPage(targetPage) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

        // Kill existing ScrollTriggers
        animations.killHomeAnimations();

        // Show target page
        const pageEl = document.getElementById('page-' + targetPage);
        pageEl.classList.add('active');
        currentPage = targetPage;
        updateNavigationState(targetPage);
        document.title = PAGE_TITLES[targetPage];

        // Scroll to top
        window.scrollTo(0, 0);

        animatePage(targetPage);
    }

    function animatePage(targetPage) {
        if (targetPage === 'home') {
            // Reset hero words for re-animation
            gsap.set('#page-home .hero-headline .word', { yPercent: 120 });
            gsap.set('#page-home .hero-divider', { scaleX: 0 });
            gsap.set('#page-home .hero-sub', { opacity: 0, y: 10 });
            gsap.set('#page-home .scroll-indicator', { opacity: 0 });
            gsap.set('#page-home .hero-brand .brand-leaf', { opacity: 0, y: 28, scale: 0.86, rotate: -10 });

            animations.playHeroEntrance();
            // Re-init scroll animations after a tick
            requestAnimationFrame(() => {
                initHomeScrollAnimations();
            });
        } else if (targetPage === 'services') {
            // Reset service headline words
            gsap.set('#page-services .services-headline .word', { yPercent: 120 });
            gsap.set('#page-services .hero-divider', { scaleX: 0 });
            gsap.set('#page-services .services-sub', { opacity: 0 });
            gsap.set('#page-services .services-brand .brand-leaf', { opacity: 0, y: 28, scale: 0.86, rotate: -10 });

            // Close any open detail panel
            closeServiceDetail();

            animations.playServicesEntrance();
            requestAnimationFrame(() => {
                animations.initServicesScrollAnimations();
            });
        } else if (targetPage === 'courses') {
            animateCoursesPage();
        } else if (targetPage === 'enquiry') {
            animateEnquiryPage();
        }
    }

    function setInitialPageFromLocation() {
        const targetPage = getPageFromPath(window.location.pathname);

        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        const pageEl = document.getElementById('page-' + targetPage);
        if (pageEl) pageEl.classList.add('active');

        currentPage = targetPage;
        updateNavigationState(targetPage);
        document.title = PAGE_TITLES[targetPage];
    }

    function getPageFromPath(pathname) {
        const normalizedPath = pathname.replace(/\/+$/, '') || '/';
        const matchedPage = Object.keys(PAGE_ROUTES).find(page => PAGE_ROUTES[page] === normalizedPath);
        return matchedPage || 'home';
    }

    function updateNavigationState(targetPage) {
        document.querySelectorAll('.nav-link[data-page]').forEach(link => {
            const isActive = link.dataset.page === targetPage;
            link.classList.toggle('active', isActive);
            if (isActive) link.setAttribute('aria-current', 'page');
            else link.removeAttribute('aria-current');
        });
    }

    function animateCoursesPage() {
        gsap.fromTo('.academy-hero-content > *',
            { opacity: 0, y: 28 },
            { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' }
        );

        document.querySelectorAll('.course-card').forEach(card => {
            gsap.fromTo(card,
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.85,
                    ease: 'power3.out',
                    scrollTrigger: { trigger: card, start: 'top 84%', toggleActions: 'play none none reverse' }
                }
            );
        });

        ScrollTrigger.refresh();
    }

    function animateEnquiryPage() {
        gsap.fromTo('.enquiry-aside-copy > *',
            { opacity: 0, y: 24 },
            { opacity: 1, y: 0, duration: 0.75, stagger: 0.1, ease: 'power3.out' }
        );
        gsap.fromTo('#enquiry-form-wrap',
            { opacity: 0, y: 24 },
            { opacity: 1, y: 0, duration: 0.8, delay: 0.15, ease: 'power3.out' }
        );
    }

    function bindEnquiryForm() {
        const form = document.getElementById('enquiry-form');
        const formWrap = document.getElementById('enquiry-form-wrap');
        const success = document.getElementById('enquiry-success');
        const againButton = document.getElementById('enquiry-again');
        const submitButton = form ? form.querySelector('.enquiry-submit') : null;
        const submitLabel = submitButton ? submitButton.querySelector('span') : null;
        const status = document.getElementById('enquiry-form-status');

        if (!form || !formWrap || !success || !submitButton || !submitLabel || !status) return;

        const idleStatus = status.textContent;
        const idleButtonLabel = submitLabel.textContent;

        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            if (form.dataset.submitting === 'true') return;

            form.dataset.submitting = 'true';
            submitButton.disabled = true;
            submitButton.setAttribute('aria-busy', 'true');
            submitLabel.textContent = 'SENDING...';
            status.classList.remove('is-error');
            status.textContent = 'Sending your enquiry...';

            try {
                const payload = Object.fromEntries(new FormData(form).entries());
                const response = await fetch('/api/enquiry', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const result = await response.json().catch(() => null);
                if (!response.ok || !result || !result.ok) {
                    throw new Error('The enquiry service did not accept the submission.');
                }

                form.reset();
                status.textContent = idleStatus;
                formWrap.hidden = true;
                success.hidden = false;
                success.focus();
                gsap.fromTo(success, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' });
            } catch (error) {
                console.error('Enquiry submission failed:', error.message);
                status.classList.add('is-error');
                status.textContent = 'We could not send your enquiry. Please try again in a moment.';
            } finally {
                delete form.dataset.submitting;
                submitButton.disabled = false;
                submitButton.removeAttribute('aria-busy');
                submitLabel.textContent = idleButtonLabel;
            }
        });

        if (againButton) {
            againButton.addEventListener('click', () => {
                form.reset();
                status.classList.remove('is-error');
                status.textContent = idleStatus;
                success.hidden = true;
                formWrap.hidden = false;
                document.getElementById('enquiry-name').focus();
            });
        }
    }

    // --- Category Images & Display Config ---
    const CATEGORY_VISUALS = [
        { img: 'images/nails.jpg', tagline: 'ARTISTRY AT YOUR FINGERTIPS' },
        { img: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80', tagline: 'RADIANCE REDEFINED' },
        { img: 'images/skin.jpg', tagline: 'LUMINOUS CLARITY' },
        { img: 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=800&q=80', tagline: 'PRECISION CUTS & COLOR', wide: true },
        { img: 'images/Eyebrow-threading.webp', tagline: 'DEFINED ELEGANCE' },
        { img: 'images/waxing.jpg', tagline: 'SILKEN SMOOTH' },
        { img: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=80', tagline: 'BEAUTY AMPLIFIED', wide: true },

        { img: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&q=80', tagline: 'GOLDEN GLOW RESTORED' },
        { img: 'images/head-massage.png', tagline: 'DEEP NOURISHMENT' }
    ];

    // Display order: HAIR (featured) first, then the rest
    const DISPLAY_ORDER = [3, 0, 1, 2, 4, 5, 6, 7, 8];

    // --- Build Services Card Grid ---
    function buildServicesGrid() {
        const container = document.getElementById('svc-cards');
        if (!container || typeof SERVICES_DATA === 'undefined') return;

        const dirs = ['left', 'right', 'bottom'];
        let html = '';

        DISPLAY_ORDER.forEach((dataIdx, i) => {
            const cat = SERVICES_DATA[dataIdx];
            const vis = CATEGORY_VISUALS[dataIdx];
            const wideClass = vis.wide ? ' svc-card-wide' : '';
            const dir = dirs[i % 3];

            html += `<div class="svc-card${wideClass}" data-index="${dataIdx}" data-dir="${dir}">`;
            html += `<img class="svc-card-img" src="${vis.img}" alt="${escapeHtml(cat.category)}" loading="lazy">`;
            html += `<div class="svc-card-overlay"></div>`;
            html += `<div class="svc-card-content">`;
            html += `<span class="svc-card-tagline">${escapeHtml(vis.tagline)}</span>`;
            html += `<h3 class="svc-card-name">${escapeHtml(cat.category)}</h3>`;
            html += `<span class="svc-card-cta">EXPLORE</span>`;
            html += `</div>`;
            html += `</div>`;
        });

        // Inline detail panel (lives inside the grid, repositioned dynamically)
        html += `<div class="svc-detail" id="svc-detail">`;
        html += `<div class="svc-detail-inner">`;
        html += `<div class="svc-detail-header">`;
        html += `<h3 class="svc-detail-title" id="svc-detail-title"></h3>`;
        html += `<button class="svc-detail-close" id="svc-detail-close" aria-label="Close">&#10005;</button>`;
        html += `</div>`;
        html += `<div class="svc-detail-body" id="svc-detail-body"></div>`;
        html += `</div></div>`;

        container.innerHTML = html;

        // Bind card clicks
        container.querySelectorAll('.svc-card').forEach(card => {
            card.addEventListener('click', () => {
                const idx = parseInt(card.dataset.index);
                openServiceDetail(idx, card);
            });
        });

        // Bind close button
        document.getElementById('svc-detail-close').addEventListener('click', closeServiceDetail);
    }

    // --- Open Service Detail Panel (inline below card) ---
    function openServiceDetail(catIndex, cardEl) {
        if (svcTransitioning) return;

        const detail = document.getElementById('svc-detail');
        const cat = SERVICES_DATA[catIndex];

        // Toggle if same card
        if (activeCard === cardEl) {
            closeServiceDetail();
            return;
        }

        // If another card is open, close first then reopen after delay
        if (activeCard) {
            svcTransitioning = true;
            detail.classList.remove('open');
            activeCard.classList.remove('active');
            activeCard = null;

            setTimeout(() => {
                populateAndShowDetail(catIndex, cardEl, detail, cat);
                svcTransitioning = false;
            }, 400);
        } else {
            populateAndShowDetail(catIndex, cardEl, detail, cat);
        }
    }

    function populateAndShowDetail(catIndex, cardEl, detail, cat) {
        const title = document.getElementById('svc-detail-title');
        const body = document.getElementById('svc-detail-body');

        // Move detail panel after the LAST card in the same visual grid row
        // so that the full-width panel doesn't split the row and push siblings down
        const allCards = Array.from(document.getElementById('svc-cards').querySelectorAll('.svc-card'));
        const clickedTop = cardEl.offsetTop;
        let lastCardInRow = cardEl;
        for (const card of allCards) {
            if (card.offsetTop === clickedTop) {
                lastCardInRow = card;
            }
        }
        lastCardInRow.after(detail);

        // Build pricing content
        let html = '';
        cat.subcategories.forEach(sub => {
            html += `<div class="svc-subcategory">`;
            html += `<div class="svc-sub-title">${escapeHtml(sub.title)}</div>`;
            sub.items.forEach(item => {
                html += `<div class="svc-item">`;
                html += `<span class="svc-item-name">${escapeHtml(item.name)}</span>`;
                html += `<span class="svc-item-meta">`;
                html += `<span class="svc-item-gender">${escapeHtml(item.gender)}</span>`;

                html += `</span>`;
                html += `</div>`;
            });
            html += `</div>`;
        });

        title.textContent = cat.category;
        body.innerHTML = html;

        // Update active card
        cardEl.classList.add('active');
        activeCard = cardEl;

        // Open with double-rAF so max-height transition fires reliably
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                detail.classList.add('open');
                // Scroll the detail into view
                setTimeout(() => {
                    detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 200);
            });
        });
    }

    // --- Close Service Detail Panel ---
    function closeServiceDetail() {
        const detail = document.getElementById('svc-detail');
        if (detail) detail.classList.remove('open');
        if (activeCard) {
            activeCard.classList.remove('active');
            activeCard = null;
        }
    }

    // --- Utility: Escape HTML ---
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // --- Track scroll for WebGL ---
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const normalized = maxScroll > 0 ? scrollY / maxScroll : 0;
        if (webgl) webgl.updateScroll(normalized);
    });

    // --- Start ---
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
