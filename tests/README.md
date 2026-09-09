# Cookie consent browser checks

Requirements: Python, `pip install playwright`, and Microsoft Edge installed.

From the repository root, serve the site with `python -m http.server 8765 --bind 127.0.0.1`, then run `python tests/consent_browser.py` in another terminal.

The test intercepts Microsoft Clarity and Google Maps requests so it verifies when the website loads those services without sending test browsing data to them. It covers default denial, persistent rejection, granular choices, analytics withdrawal and reload, map removal, policy links, corrupt and expired storage, keyboard focus, cross-tab updates, mobile controls, and unavailable browser storage. It does not verify the Clarity dashboard or a production deployment.

Consent lives in `lovelle-cookie-consent` local storage for 180 days. Increase `VERSION` in `js/consent.js` when adding optional purposes requiring a fresh choice. Load any new optional integration through this controller; do not insert an unconditional tracker in the HTML head. Advertising storage remains denied through Clarity's consentv2 API:
https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-consent-api-v2

Deploy the changed static files through the project's normal Vercel deployment. No new environment variables, database, or Vercel configuration are required. Consent is scoped to the browser and origin, so a Vercel preview and the production domain have separate choices.
