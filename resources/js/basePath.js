/**
 * Sub-folder deployment support (e.g. https://jobbycart.com/fieldy).
 *
 * The app code uses root-relative URLs such as "/admin/login". When the app is
 * hosted inside a sub-folder those requests escape the folder and 404.
 * The base path is injected by Laravel in app.blade.php (window.__APP_BASE__),
 * or automatically inferred from window.location.pathname if running under /fieldy.
 * Every same-origin request made via XHR (Inertia) or fetch is rewritten
 * to live under it. When hosted at the domain root, BASE is "" and nothing changes.
 */

const pathname = (typeof window !== 'undefined' && window.location && window.location.pathname) ? window.location.pathname : '';
const autoDetected = pathname.startsWith('/fieldy') ? '/fieldy' : '';
export const BASE = String((typeof window !== 'undefined' && window.__APP_BASE__) || autoDetected || '').replace(/\/+$/, '');

const isUnderBase = (path) => path === BASE || path.startsWith(BASE + '/');

/** Prefix a root-relative or same-origin absolute URL with the base path. */
export function withBase(url) {
    if (!BASE || url == null) return url;
    const raw = url instanceof URL ? url.href : String(url);
    if (raw.startsWith('//')) return url;

    let parsed;
    try {
        parsed = new URL(raw, window.location.href);
    } catch {
        return url;
    }
    if (parsed.origin !== window.location.origin) return url;
    // Relative paths like "foo" (no leading slash) are already resolved against current folder
    if (!raw.startsWith('/') && !/^https?:/i.test(raw)) return url;
    if (isUnderBase(parsed.pathname)) return url;

    parsed.pathname = BASE + parsed.pathname;
    return raw.startsWith('/') ? parsed.pathname + parsed.search + parsed.hash : parsed.href;
}

/** Helper for static files in /public, e.g. asset('/images/logo.png'). */
export const asset = (path) => withBase(path.startsWith('/') ? path : '/' + path);

if (BASE) {
    // Inertia uses XMLHttpRequest for page visits and form submissions.
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url, ...rest) {
        return originalOpen.call(this, method, withBase(url), ...rest);
    };

    // Plain fetch() calls.
    const originalFetch = window.fetch.bind(window);
    window.fetch = (input, init) => {
        if (input instanceof Request) {
            const fixed = withBase(input.url);
            return originalFetch(fixed === input.url ? input : new Request(fixed, input), init);
        }
        return originalFetch(withBase(input), init);
    };

    // Keep address bar inside the sub-folder.
    for (const fn of ['pushState', 'replaceState']) {
        const original = window.history[fn].bind(window.history);
        window.history[fn] = (state, title, url) => original(state, title, url == null ? url : withBase(url));
    }
}
