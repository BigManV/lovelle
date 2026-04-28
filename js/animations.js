/* ============================================================
   LOVELLE — GSAP Scroll Animations
   Timeline-driven, scroll-triggered premium animations
   ============================================================ */

class AnimationController {
    constructor() {
        gsap.registerPlugin(ScrollTrigger);
        this.mapWireframe = null;
    }

    /* --- Loading Animation --- */
    playLoadingSequence() {
        return new Promise((resolve) => {
            const tl = gsap.timeline({
                onComplete: resolve
            });

            tl.fromTo('.loader-brand .brand-leaf',
                { opacity: 0, y: 28, scale: 0.82, rotate: -8 },
                { opacity: 1, y: 0, scale: 1, rotate: 0, duration: 1.0, ease: 'power3.out' }
            );

            // Animate progress bar
            tl.to('.loader-progress', {
                width: '100%',
                duration: 1.8,
                ease: 'power2.inOut'
            });

            // Fade out loader
            tl.to('#loader', {
                opacity: 0,
                duration: 0.6,
                ease: 'power2.inOut'
            }, '+=0.3');

            tl.set('#loader', { display: 'none' });

            // Slide in nav header
            tl.to('#nav-header', {
                y: 0,
                duration: 0.8,
                ease: 'power3.out'
            }, '-=0.2');
        });
    }

    /* --- Hero Entrance --- */
    playHeroEntrance() {
        const words = document.querySelectorAll('#page-home .hero-headline .word');
        if (!words.length) return;

        const tl = gsap.timeline({ delay: 0.2 });

        tl.fromTo('#page-home .hero-brand .brand-leaf',
            { opacity: 0, y: 28, scale: 0.86, rotate: -10 },
            { opacity: 1, y: 0, scale: 1, rotate: 0, duration: 0.9, ease: 'power3.out' }
        );

        // Overline fade in
        tl.fromTo('#page-home .hero-overline',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
            '-=0.3'
        );

        // Words slide up — use yPercent for reliable percentage animation
        tl.to(words, {
            yPercent: 0,
            duration: 1.2,
            stagger: 0.15,
            ease: 'power4.out'
        }, '-=0.4');

        // Divider scale
        tl.to('#page-home .hero-divider', {
            scaleX: 1,
            duration: 0.8,
            ease: 'power3.inOut'
        }, '-=0.5');

        // Sub text fade + slide
        tl.to('#page-home .hero-sub', {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power3.out'
        }, '-=0.4');

        // Scroll indicator
        tl.to('#page-home .scroll-indicator', {
            opacity: 1,
            duration: 0.6,
            ease: 'power2.out'
        }, '-=0.3');

        return tl;
    }

    /* --- Photo Scroll Animations (Editorial Experience) --- */
    initPhotoScrollAnimations() {

        /* == Section 1: Full-width photo hero == */
        const ps1 = document.querySelector('#ps-1');
        if (ps1) {
            const img1 = ps1.querySelector('.photo-img');
            const overlay1 = ps1.querySelector('.photo-overlay-text');

            // Text overlay entrance
            gsap.fromTo(overlay1,
                { opacity: 0, y: 60 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: ps1,
                        start: 'top 60%',
                        toggleActions: 'play none none reverse'
                    }
                }
            );
        }

        /* == Section 2: Split text-left / photo-right == */
        const ps2 = document.querySelector('#ps-2');
        if (ps2) {
            const text2 = ps2.querySelector('.about-body');
            const accent2 = ps2.querySelector('.text-line-accent');
            const clip2 = ps2.querySelector('.photo-clip');
            const splitPhoto2 = ps2.querySelector('.split-photo');

            // Text slides in from left
            gsap.fromTo(text2,
                { opacity: 0, x: -50 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: ps2,
                        start: 'top 70%',
                        toggleActions: 'play none none reverse'
                    }
                }
            );

            gsap.fromTo(accent2,
                { scaleX: 0 },
                {
                    scaleX: 1,
                    duration: 0.8,
                    ease: 'power3.inOut',
                    scrollTrigger: {
                        trigger: ps2,
                        start: 'top 60%',
                        toggleActions: 'play none none reverse'
                    }
                }
            );

            // Photo slides in from right
            gsap.fromTo(splitPhoto2,
                { opacity: 0, x: 60 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: ps2,
                        start: 'top 75%',
                        toggleActions: 'play none none reverse'
                    }
                }
            );

            // Clip-path reveal
            gsap.fromTo(clip2,
                { clipPath: 'inset(12% 12% 12% 12%)' },
                {
                    clipPath: 'inset(0% 0% 0% 0%)',
                    ease: 'none',
                    scrollTrigger: {
                        trigger: ps2,
                        start: 'top 75%',
                        end: 'center center',
                        scrub: true
                    }
                }
            );

        }

        /* == Section 3: Horizontal gallery strip == */
        const ps3 = document.querySelector('#ps-3');
        if (ps3) {
            const track = ps3.querySelector('.gallery-track');
            const items = ps3.querySelectorAll('.gallery-item');

            if (track && items.length) {
                // Calculate horizontal scroll distance
                const scrollDist = () => track.scrollWidth - ps3.offsetWidth;

                gsap.to(track, {
                    x: () => -scrollDist(),
                    ease: 'none',
                    scrollTrigger: {
                        trigger: ps3,
                        start: 'top top',
                        end: () => '+=' + scrollDist(),
                        scrub: 1,
                        pin: true,
                        anticipatePin: 1,
                        invalidateOnRefresh: true
                    }
                });

            }
        }

        /* == Section 4: Split reversed — photo-left / text-right == */
        const ps4 = document.querySelector('#ps-4');
        if (ps4) {
            const text4 = ps4.querySelector('.about-body');
            const accent4 = ps4.querySelector('.text-line-accent');
            const clip4 = ps4.querySelector('.photo-clip');
            const splitPhoto4 = ps4.querySelector('.split-photo');

            // Photo slides in from left
            gsap.fromTo(splitPhoto4,
                { opacity: 0, x: -60 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: ps4,
                        start: 'top 75%',
                        toggleActions: 'play none none reverse'
                    }
                }
            );

            // Text slides in from right
            gsap.fromTo(text4,
                { opacity: 0, x: 50 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: ps4,
                        start: 'top 70%',
                        toggleActions: 'play none none reverse'
                    }
                }
            );

            gsap.fromTo(accent4,
                { scaleX: 0 },
                {
                    scaleX: 1,
                    duration: 0.8,
                    ease: 'power3.inOut',
                    scrollTrigger: {
                        trigger: ps4,
                        start: 'top 60%',
                        toggleActions: 'play none none reverse'
                    }
                }
            );

            gsap.fromTo(clip4,
                { clipPath: 'inset(12% 12% 12% 12%)' },
                {
                    clipPath: 'inset(0% 0% 0% 0%)',
                    ease: 'none',
                    scrollTrigger: {
                        trigger: ps4,
                        start: 'top 75%',
                        end: 'center center',
                        scrub: true
                    }
                }
            );

        }

        /* == Section 5: Big quote with background photo == */
        const ps5 = document.querySelector('#ps-5');
        if (ps5) {
            const img5 = ps5.querySelector('.photo-img');
            const quote = ps5.querySelector('.big-quote');

            // Quote text entrance
            gsap.fromTo(quote,
                { opacity: 0, y: 40, scale: 0.95 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 1.2,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: ps5,
                        start: 'top 55%',
                        toggleActions: 'play none none reverse'
                    }
                }
            );
        }
    }

    /* --- Find Us Section --- */
    initFindUsAnimations() {
        gsap.from('.find-us-header', {
            opacity: 0,
            y: 40,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '#find-us',
                start: 'top 70%',
                toggleActions: 'play none none reverse'
            }
        });

        gsap.from('.find-us-details .detail-col', {
            opacity: 0,
            y: 30,
            stagger: 0.2,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.find-us-details',
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            }
        });
    }

    /* --- CTA Button --- */
    initCTAAnimation() {
        gsap.from('.cta-container', {
            opacity: 0,
            y: 30,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.cta-container',
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            }
        });
    }

    /* --- Services Page Entrance --- */
    playServicesEntrance() {
        const words = document.querySelectorAll('#page-services .services-headline .word');
        const tl = gsap.timeline({ delay: 0.1 });

        tl.fromTo('#page-services .services-brand .brand-leaf',
            { opacity: 0, y: 28, scale: 0.86, rotate: -10 },
            { opacity: 1, y: 0, scale: 1, rotate: 0, duration: 0.8, ease: 'power3.out' }
        );

        tl.to(words, {
            yPercent: 0,
            duration: 1,
            stagger: 0.12,
            ease: 'power4.out'
        });

        tl.to('#page-services .hero-divider', {
            scaleX: 1,
            duration: 0.7,
            ease: 'power3.inOut'
        }, '-=0.4');

        tl.to('.services-sub', {
            opacity: 1,
            duration: 0.5,
            ease: 'power2.out'
        }, '-=0.2');

        return tl;
    }

    /* --- Brand Transition Overlay (Zoom-Out Fade — White) --- */
    playBrandTransition(onMidpoint) {
        return new Promise((resolve) => {
            const overlay = document.getElementById('brand-transition');
            const lockup = overlay.querySelector('.brand-transition-lockup');

            const tl = gsap.timeline({ onComplete: resolve });

            // Setup — logo starts large (zoomed in), overlay transparent
            tl.set(overlay, { opacity: 1, backgroundColor: 'transparent' });
            tl.set(lockup, { opacity: 0, scale: 2.0, y: 0 });

            // Phase 1: White bg fades in
            tl.to(overlay, {
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                duration: 0.45,
                ease: 'power2.inOut'
            });

            // Logo zooms from large → normal (zoom-out entrance)
            tl.to(lockup, {
                opacity: 1,
                scale: 1,
                duration: 0.55,
                ease: 'power2.out'
            }, '-=0.30');

            // Midpoint: swap pages
            tl.call(() => { if (onMidpoint) onMidpoint(); });

            // Brief hold — let the logo breathe
            tl.to({}, { duration: 0.25 });

            // Phase 2: Logo shrinks + fades (zoom-out exit)
            tl.to(lockup, {
                scale: 0.75,
                opacity: 0,
                duration: 0.5,
                ease: 'power2.inOut'
            });

            // Fade out white background
            tl.to(overlay, {
                backgroundColor: 'transparent',
                duration: 0.4,
                ease: 'power2.out'
            }, '-=0.30');

            // Cleanup
            tl.set(overlay, { opacity: 0, backgroundColor: 'transparent' });
        });
    }

    /* --- Services Card Scroll Animations --- */
    initServicesScrollAnimations() {
        const cards = document.querySelectorAll('.svc-card');

        cards.forEach((card, i) => {
            const dir = card.dataset.dir || 'bottom';
            let fromVars = { opacity: 0 };

            if (dir === 'left') fromVars.x = -50;
            else if (dir === 'right') fromVars.x = 50;
            else fromVars.y = 40;

            gsap.fromTo(card, fromVars, {
                opacity: 1,
                x: 0,
                y: 0,
                duration: 0.7,
                delay: (i % 3) * 0.08,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: card,
                    start: 'top 88%',
                    toggleActions: 'play none none reverse'
                }
            });
        });

        ScrollTrigger.refresh();
    }

    /* --- Refresh ScrollTrigger --- */
    refresh() {
        ScrollTrigger.refresh();
    }

    /* --- Kill all for page transition --- */
    killHomeAnimations() {
        ScrollTrigger.getAll().forEach(st => st.kill());
    }
}
