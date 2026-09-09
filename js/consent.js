/* ============================================================
   LOVELLE — Consent Popup & Policy Modals
   Handles cookie consent, privacy policy, and terms display
   ============================================================ */

(function () {
    'use strict';

    const KEY = 'lovelle-cookie-consent';
    const VERSION = 1;
    const LIFETIME = 180 * 24 * 60 * 60 * 1000;
    let choice = null;
    let analyticsLoaded = false;
    let expiryTimer;

    function readChoice() {
        try {
            const value = JSON.parse(localStorage.getItem(KEY));
            if (value && value.version === VERSION && typeof value.analytics === 'boolean' &&
                typeof value.maps === 'boolean' && Number.isFinite(value.savedAt) &&
                Number.isFinite(value.expiresAt) && value.savedAt <= Date.now() &&
                value.expiresAt > Date.now() && value.expiresAt <= value.savedAt + LIFETIME) return value;
        } catch (_) { /* Blocked or corrupt storage means no consent. */ }
        return null;
    }

    function clearAnalyticsCookies() {
        const parts = location.hostname.split('.');
        const domains = ['', ...parts.map((_, i) => parts.slice(i).join('.'))];
        const paths = ['/', ...location.pathname.split('/').map((_, i, all) => all.slice(0, i + 1).join('/') || '/')];
        ['_clck', '_clsk'].forEach(name => domains.forEach(domain => paths.forEach(path => {
            document.cookie = `${name}=; Max-Age=0; path=${path};${domain ? ` domain=${domain};` : ''} SameSite=Lax`;
        })));
    }

    function applyChoice() {
        if (choice?.analytics && !analyticsLoaded) {
            analyticsLoaded = true;
            window.clarity = window.clarity || function () { (window.clarity.q = window.clarity.q || []).push(arguments); };
            window.clarity('consentv2', { analytics_Storage: 'granted', ad_Storage: 'denied' });
            const script = document.createElement('script');
            script.src = 'https://www.clarity.ms/tag/w9ciqh86hg';
            script.async = true;
            document.head.appendChild(script);
        } else if (!choice?.analytics) {
            clearAnalyticsCookies();
            if (analyticsLoaded) {
                window.clarity('consentv2', { analytics_Storage: 'denied', ad_Storage: 'denied' });
                // Reload unloads the tracker completely, including cookieless collection.
                location.reload();
                return;
            }
        }
        document.querySelectorAll('iframe[data-consent-src]').forEach(frame => {
            if (choice?.maps) {
                if (!frame.hasAttribute('src')) frame.src = frame.dataset.consentSrc;
            } else frame.removeAttribute('src');
            frame.hidden = !choice?.maps;
            frame.previousElementSibling.hidden = !!choice?.maps;
        });
        clearTimeout(expiryTimer);
        if (choice) expiryTimer = setTimeout(checkExpiry, Math.min(choice.expiresAt - Date.now(), 2147483647));
    }

    function checkExpiry() {
        if (choice && choice.expiresAt <= Date.now()) {
            choice = null;
            try { localStorage.removeItem(KEY); } catch (_) {}
            applyChoice();
            window.LovelleConsent.open();
        } else if (choice) {
            clearTimeout(expiryTimer);
            expiryTimer = setTimeout(checkExpiry, Math.min(choice.expiresAt - Date.now(), 2147483647));
        }
    }

    function initConsentPopup() {
        const overlay = document.getElementById('consent-overlay');
        if (!overlay) return;
        const analytics = document.getElementById('consent-analytics');
        const maps = document.getElementById('consent-maps');
        let returnFocus;
        let previousOverflow;
        const background = [...document.body.children].filter(el => el !== overlay && !['SCRIPT', 'STYLE'].includes(el.tagName));
        const inertBefore = new Map();

        function open() {
            if (!overlay.hidden) return;
            returnFocus = document.activeElement;
            analytics.checked = !!choice?.analytics;
            maps.checked = !!choice?.maps;
            overlay.hidden = false;
            previousOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            background.forEach(el => { inertBefore.set(el, el.inert); el.inert = true; });
            document.getElementById('consent-cancel').focus();
        }

        function close() {
            overlay.hidden = true;
            document.body.style.overflow = previousOverflow || '';
            background.forEach(el => { el.inert = inertBefore.get(el) || false; });
            if (returnFocus?.isConnected) returnFocus.focus();
        }

        function save(allowAnalytics, allowMaps) {
            const now = Date.now();
            choice = { version: VERSION, analytics: allowAnalytics, maps: allowMaps, savedAt: now, expiresAt: now + LIFETIME };
            try { localStorage.setItem(KEY, JSON.stringify(choice)); } catch (_) {}
            close();
            applyChoice();
            window.dispatchEvent(new CustomEvent('lovelle-consent-changed', { detail: { ...choice } }));
        }

        window.LovelleConsent = Object.freeze({ open });
        document.getElementById('consent-ok').addEventListener('click', () => save(true, true));
        document.getElementById('consent-cancel').addEventListener('click', () => save(false, false));
        document.getElementById('consent-save').addEventListener('click', () => save(analytics.checked, maps.checked));
        document.querySelectorAll('[data-cookie-settings]').forEach(link => link.addEventListener('click', e => { e.preventDefault(); open(); }));

        overlay.querySelectorAll('.consent-tab').forEach(tab => {
            tab.setAttribute('aria-pressed', String(tab.classList.contains('active')));
            tab.addEventListener('click', () => {
                overlay.querySelectorAll('.consent-tab').forEach(t => { t.classList.toggle('active', t === tab); t.setAttribute('aria-pressed', String(t === tab)); });
                overlay.querySelectorAll('.consent-tab-content').forEach(c => c.classList.toggle('active', c.id === 'consent-' + tab.dataset.tab));
            });
        });
        overlay.addEventListener('keydown', e => {
            if (e.key === 'Escape') { e.preventDefault(); choice ? close() : save(false, false); }
            if (e.key === 'Tab') {
                const items = [...overlay.querySelectorAll('button, a[href], input')].filter(el => el.getClientRects().length);
                const first = items[0], last = items[items.length - 1];
                if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
                else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        });
        window.addEventListener('storage', e => {
            if (e.key !== KEY && e.key !== null) return;
            choice = readChoice();
            analytics.checked = !!choice?.analytics;
            maps.checked = !!choice?.maps;
            applyChoice();
            if (!choice) open();
            else if (!overlay.hidden) close();
        });
        document.addEventListener('visibilitychange', checkExpiry);
        window.addEventListener('pageshow', checkExpiry);
        // The old acceptance bundled policies and is not granular cookie consent.
        try { sessionStorage.removeItem('lovelle-consent'); } catch (_) {}
        choice = readChoice();
        applyChoice();
        if (!choice) open();
    }

    // --- Policy Modal (triggered from footer links) ---
    function initPolicyModal() {
        const modalOverlay = document.getElementById('policy-modal');
        if (!modalOverlay) return;

        const modalTitle = document.getElementById('policy-modal-title');
        const modalBody = document.getElementById('policy-modal-body');
        const closeBtn = document.getElementById('policy-modal-close');

        // Policy content map — clone from consent tabs
        const policyContent = {};
        const consentContents = document.querySelectorAll('.consent-tab-content');
        consentContents.forEach(el => {
            const id = el.id.replace('consent-', '');
            policyContent[id] = el.innerHTML;
        });

        const policyTitles = {
            cookies: 'COOKIE POLICY',
            privacy: 'PRIVACY POLICY',
            terms: 'TERMS & CONDITIONS'
        };

        // Bind footer links
        document.querySelectorAll('.footer-policy-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const policy = link.dataset.policy;
                if (!policy || !policyContent[policy]) return;

                modalTitle.textContent = policyTitles[policy] || policy.toUpperCase();
                modalBody.innerHTML = policyContent[policy];
                modalOverlay.classList.add('visible');
                modalOverlay.setAttribute('aria-hidden', 'false');
                document.body.style.overflow = 'hidden';
            });
        });

        // Close modal
        function closeModal() {
            modalOverlay.classList.remove('visible');
            modalOverlay.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }

        // Close on overlay click
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modalOverlay.classList.contains('visible')) {
                closeModal();
            }
        });
    }

    // --- Initialize ---
    function init() {
        initConsentPopup();
        initPolicyModal();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
