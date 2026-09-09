from playwright.sync_api import sync_playwright
import json, pathlib
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True, channel='msedge')
    context=browser.new_context()
    requests=[]
    context.route('https://www.clarity.ms/**', lambda route: (requests.append(route.request.url),route.fulfill(status=200,body='')))
    context.route('https://www.google.com/maps/embed**',lambda route: route.fulfill(status=200,body='<html>Map test</html>'))
    page=context.new_page(); errors=[]; page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto('http://127.0.0.1:8765',wait_until='networkidle')
    assert page.locator('#consent-overlay').is_visible()
    assert not requests
    assert page.locator('iframe[data-consent-src]').get_attribute('src') is None
    page.locator('#consent-cancel').click()
    assert page.locator('#consent-overlay').is_hidden()
    page.reload(wait_until='networkidle'); assert page.locator('#consent-overlay').is_hidden(); assert not requests
    page.evaluate('LovelleConsent.open()')
    page.locator('#consent-analytics').check(); page.locator('#consent-save').click()
    page.wait_for_timeout(200)
    assert len(requests)==1
    assert page.locator('iframe[data-consent-src]').get_attribute('src') is None
    page.reload(wait_until='networkidle'); assert len(requests)==2
    page.evaluate('LovelleConsent.open()')
    with page.expect_navigation(): page.locator('#consent-cancel').click()
    page.wait_for_load_state('networkidle'); assert len(requests)==2
    assert page.locator('#consent-overlay').is_hidden()
    page.evaluate('LovelleConsent.open()'); page.locator('#consent-maps').check(); page.locator('#consent-save').click()
    assert page.locator('iframe[data-consent-src]').get_attribute('src').startswith('https:')
    assert len(requests)==2
    page.evaluate('LovelleConsent.open()'); page.locator('#consent-cancel').click()
    assert page.locator('iframe[data-consent-src]').get_attribute('src') is None
    # Footer policies survive closing and reopening preferences.
    page.locator('#page-home .footer-policy-link[data-policy="cookies"]').click(force=True)
    assert page.locator('#policy-modal').get_attribute('aria-hidden')=='false'
    page.keyboard.press('Escape')
    page.evaluate("localStorage.setItem('lovelle-cookie-consent', '{broken')")
    page.reload(wait_until='networkidle'); assert page.locator('#consent-overlay').is_visible()
    page.locator('#consent-ok').focus(); page.keyboard.press('Tab')
    assert page.locator('.consent-tab').first.evaluate('(e)=>e===document.activeElement')
    page.keyboard.press('Escape'); assert page.locator('#consent-overlay').is_hidden()
    # A choice changed in another tab synchronizes.
    second=context.new_page(); second.goto('http://127.0.0.1:8765',wait_until='networkidle')
    second.evaluate('LovelleConsent.open()'); second.locator('#consent-maps').check(); second.locator('#consent-save').click()
    page.wait_for_timeout(100); assert page.locator('iframe[data-consent-src]').get_attribute('src')
    second.close()
    page.evaluate("let x=JSON.parse(localStorage.getItem('lovelle-cookie-consent')); x.expiresAt=Date.now()-1; localStorage.setItem('lovelle-cookie-consent',JSON.stringify(x))")
    page.reload(wait_until='networkidle'); assert page.locator('#consent-overlay').is_visible()
    # Mobile layout and screenshot.
    page.set_viewport_size({'width':390,'height':844})
    import tempfile
    page.screenshot(path=str(pathlib.Path(tempfile.gettempdir())/'lovelle-cookie-mobile.png'))
    for id in ['consent-cancel','consent-ok','consent-save']:
        page.locator('#'+id).scroll_into_view_if_needed()
        box=page.locator('#'+id).bounding_box(); assert box['x']>=0 and box['x']+box['width']<=390
    blocked=browser.new_context()
    blocked.add_init_script("Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked')}}); Object.defineProperty(window,'sessionStorage',{get(){throw new Error('blocked')}})")
    bp=blocked.new_page(); bp.goto('http://127.0.0.1:8765',wait_until='networkidle')
    bp.locator('#consent-cancel').click(); assert bp.locator('#consent-overlay').is_hidden()
    assert not errors, errors
    print('PASS: default blocking, rejection, persistence, granular consent, withdrawal reload, map removal, policy reopening, corrupt/expired storage, keyboard trap, cross-tab sync, mobile controls, blocked storage; no page errors.')
    browser.close()
