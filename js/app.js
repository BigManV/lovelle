/* ============================================================
   LOVELLE — Main Application Controller
   Navigation, Accordions, Page Transitions, Initialization
   ============================================================ */

(function () {
    'use strict';

    // --- Globals ---
    let webgl, animations;
    let currentPage = 'home';
    const socialRipples = [];
    let activeCard = null;
    let svcTransitioning = false;

    // --- Init ---
    async function init() {
        document.title = 'LOVELLE - Premium Hair Salon';
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

        // Set initial states for animated elements
        gsap.set('#page-home .hero-headline .word', { yPercent: 120 });
        gsap.set('#page-services .services-headline .word', { yPercent: 120 });
        gsap.set('.hero-brand .brand-leaf, .services-brand .brand-leaf', { opacity: 0, y: 28, scale: 0.86, rotate: -10 });

        // Play loading sequence
        await animations.playLoadingSequence();

        // Play hero entrance
        animations.playHeroEntrance();

        // Init scroll-based animations for home page
        initHomeScrollAnimations();
    }

    function initHomeScrollAnimations() {
        animations.initPhotoScrollAnimations();
        animations.initFindUsAnimations();
        animations.initCTAAnimation();
        animations.refresh();
    }

    // --- Navigation ---
    function bindNavigation() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', async (e) => {
                e.preventDefault();
                const target = link.dataset.page;
                if (target === currentPage) return;

                // Update active states
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                // Play zoom-out fade transition
                document.body.classList.add('is-transitioning');
                await animations.playBrandTransition(() => {
                    // At midpoint, swap pages
                    switchPage(target);
                });
                document.body.classList.remove('is-transitioning');
            });
        });
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

        // Scroll to top
        window.scrollTo(0, 0);

        // Init page-specific animations
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
        { img: 'images/body-massage.jpg', tagline: 'TOTAL RENEWAL' },
        { img: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&q=80', tagline: 'GOLDEN GLOW RESTORED' },
        { img: 'images/head-massage.png', tagline: 'DEEP NOURISHMENT' }
    ];

    // Display order: HAIR (featured) first, then the rest
    const DISPLAY_ORDER = [3, 0, 1, 2, 4, 5, 6, 7, 8, 9];

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
