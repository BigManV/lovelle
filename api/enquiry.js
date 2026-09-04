'use strict';

const ALLOWED_COURSES = new Set([
    'Hair Dresser (Unisex/Barber)',
    'Beautician',
    'Nail Artist',
    'Makeup Artist'
]);

const ALLOWED_SOURCES = new Set(['Google', 'Insta', 'FB']);
const MAX_REQUEST_BYTES = 10_000;
const UPSTREAM_TIMEOUT_MS = 20_000;

module.exports = async function handler(request, response) {
    response.setHeader('Cache-Control', 'no-store');

    if (request.method !== 'POST') {
        response.setHeader('Allow', 'POST');
        return sendJson(response, 405, { ok: false, error: 'Method not allowed.' });
    }

    const contentLength = Number(request.headers['content-length'] || 0);
    if (contentLength > MAX_REQUEST_BYTES) {
        return sendJson(response, 413, { ok: false, error: 'Request is too large.' });
    }

    let body;
    try {
        body = await readJsonBody(request);
    } catch (error) {
        return sendJson(response, 400, { ok: false, error: 'Invalid request.' });
    }

    const enquiry = validateEnquiry(body);
    if (!enquiry) {
        return sendJson(response, 400, { ok: false, error: 'Please check the submitted details.' });
    }

    const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
    const formSecret = process.env.FORM_SECRET;

    if (!appsScriptUrl || !formSecret) {
        console.error('Enquiry service is missing GOOGLE_APPS_SCRIPT_URL or FORM_SECRET.');
        return sendJson(response, 500, { ok: false, error: 'The enquiry service is not configured.' });
    }

    if (!isValidAppsScriptUrl(appsScriptUrl)) {
        console.error('GOOGLE_APPS_SCRIPT_URL is not a valid deployed Apps Script URL.');
        return sendJson(response, 500, { ok: false, error: 'The enquiry service is not configured.' });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

    try {
        const appsScriptResponse = await fetch(appsScriptUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...enquiry, secret: formSecret }),
            redirect: 'follow',
            signal: controller.signal
        });

        const responseText = await appsScriptResponse.text();
        let result;

        try {
            result = JSON.parse(responseText);
        } catch (error) {
            throw new Error('Apps Script returned a non-JSON response.');
        }

        if (!appsScriptResponse.ok || !result.ok) {
            throw new Error('Apps Script rejected the enquiry.');
        }

        return sendJson(response, 200, { ok: true });
    } catch (error) {
        const message = error.name === 'AbortError'
            ? 'Apps Script request timed out.'
            : error.message;
        console.error('Enquiry forwarding failed:', message);
        return sendJson(response, 502, { ok: false, error: 'Could not save the enquiry.' });
    } finally {
        clearTimeout(timeout);
    }
};

async function readJsonBody(request) {
    if (request.body && typeof request.body === 'object') {
        return request.body;
    }

    if (typeof request.body === 'string') {
        return JSON.parse(request.body);
    }

    let rawBody = '';
    for await (const chunk of request) {
        rawBody += chunk;
        if (Buffer.byteLength(rawBody, 'utf8') > MAX_REQUEST_BYTES) {
            throw new Error('Request is too large.');
        }
    }

    return JSON.parse(rawBody || '{}');
}

function validateEnquiry(body) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) return null;

    const name = cleanText(body.name, 100);
    const mobile = cleanText(body.mobile, 20);
    const email = cleanText(body.email, 254).toLowerCase();
    const course = cleanText(body.course, 100);
    const source = cleanText(body.source, 50);

    if (!name || !mobile || !email || !course || !source) return null;
    if (!/^[0-9+() -]{7,20}$/.test(mobile)) return null;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
    if (!ALLOWED_COURSES.has(course) || !ALLOWED_SOURCES.has(source)) return null;

    return { name, mobile, email, course, source };
}

function cleanText(value, maxLength) {
    if (typeof value !== 'string') return '';
    const text = value.trim();
    return text && text.length <= maxLength ? text : '';
}

function isValidAppsScriptUrl(value) {
    try {
        const url = new URL(value);
        return url.protocol === 'https:'
            && url.hostname === 'script.google.com'
            && /^\/macros\/s\/[^/]+\/exec$/.test(url.pathname);
    } catch (error) {
        return false;
    }
}

function sendJson(response, statusCode, payload) {
    response.statusCode = statusCode;
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.end(JSON.stringify(payload));
}
