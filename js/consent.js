/* ============================================================
   LOVELLE — Consent Popup & Policy Modals
   Handles cookie consent, privacy policy, and terms display
   ============================================================ */

(function () {
    'use strict';

    // --- Consent Popup ---
    function initConsentPopup() {
        const overlay = document.getElementById('consent-overlay');
        if (!overlay) return;

        // Check if consent already given this session
        if (sessionStorage.getItem('lovelle-consent') === 'accepted') {
            overlay.classList.add('hidden');
            setTimeout(() => overlay.remove(), 600);
            return;
        }

        // Tab switching
        const tabs = overlay.querySelectorAll('.consent-tab');
        const contents = overlay.querySelectorAll('.consent-tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.dataset.tab;

                tabs.forEach(t => t.classList.remove('active'));
                contents.forEach(c => c.classList.remove('active'));

                tab.classList.add('active');
                const targetContent = document.getElementById('consent-' + target);
                if (targetContent) targetContent.classList.add('active');
            });
        });

        // OK button — accept and continue
        const okBtn = document.getElementById('consent-ok');
        if (okBtn) {
            okBtn.addEventListener('click', () => {
                sessionStorage.setItem('lovelle-consent', 'accepted');
                overlay.classList.add('hidden');
                setTimeout(() => overlay.remove(), 600);
                window.dispatchEvent(new Event('lovelle-consent-accepted'));
            });
        }

        // Cancel button — go back to where they came from
        const cancelBtn = document.getElementById('consent-cancel');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                // Try to go back in history
                if (document.referrer && document.referrer !== window.location.href) {
                    window.location.href = document.referrer;
                } else if (window.history.length > 1) {
                    window.history.back();
                } else {
                    // Fallback: close the tab/window or show a blank page
                    window.close();
                    // If window.close() didn't work (it often doesn't), redirect to a blank page
                    document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:Inter,sans-serif;color:#757575;text-align:center;padding:2rem;"><div><h2 style="margin-bottom:1rem;font-size:1.2rem;color:#212121;">You have declined our policies</h2><p style="font-size:0.85rem;">Please close this tab to continue.</p></div></div>';
                }
            });
        }
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
