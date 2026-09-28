// Client-side header inspection, in three honest modes:
//
// 1. The target allows cross-origin reads (CDNs, public APIs like
//    api.github.com) → status, timing, and every exposed header.
// 2. The target blocks CORS but is up → opaque no-cors fetch resolves:
//    we prove reachability and measure latency, but the browser hides
//    status and headers. Reported as such.
// 3. The target does not answer (DNS death, refused, offline) → the
//    opaque fetch also throws. Reported as unreachable.

function normalizeTarget(raw) {
  const value = String(raw || '').trim();
  if (!value) return null;
  try {
    return new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
  } catch {
    return null;
  }
}

export async function probeUrl(raw) {
  const target = normalizeTarget(raw);
  if (!target) {
    return { error: 'That is not a valid URL.' };
  }

  const direct = await probeOnce(target.href, { mode: 'cors' });
  if (!direct.error) {
    return direct;
  }

  const opaque = await probeOnce(target.href, { mode: 'no-cors' });
  if (opaque.reachable) {
    return {
      url: target.href,
      opaque: true,
      responseTimeMs: opaque.responseTimeMs,
      headers: {},
      note:
        'This site is up and answered, but hides response headers from browsers (no CORS). ' +
        'Latency is real; full headers need a server-side inspector.',
    };
  }

  return {
    error:
      direct.error === 'Request timed out after 8 seconds.'
        ? 'Timed out after 8 seconds — the site may be very slow or dropping you.'
        : 'Could not reach the site (DNS failure, connection refused, or the host is down).',
  };
}

export async function probeOnce(url, options = {}) {
  const started = performance.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: { accept: '*/*' },
      ...options,
    });
    const responseTimeMs = Math.round(performance.now() - started);
    await res.arrayBuffer(); // drain so timing is realistic

    if (options.mode === 'no-cors') {
      // Opaque response: reachable, but status/headers/body unreadable.
      return { url, reachable: true, responseTimeMs, headers: {} };
    }

    return {
      url,
      finalUrl: res.url || url,
      status: res.status,
      responseTimeMs,
      headers: {
        'content-type': res.headers.get('content-type'),
        'content-length': res.headers.get('content-length'),
        'cache-control': res.headers.get('cache-control'),
        'content-encoding': res.headers.get('content-encoding'),
        server: res.headers.get('server'),
        date: res.headers.get('date'),
        'access-control-allow-origin': res.headers.get('access-control-allow-origin'),
        'access-control-expose-headers': res.headers.get('access-control-expose-headers'),
        'x-powered-by': res.headers.get('x-powered-by'),
        'x-cache': res.headers.get('x-cache'),
        'cf-ray': res.headers.get('cf-ray'),
        via: res.headers.get('via'),
        'last-modified': res.headers.get('last-modified'),
        etag: res.headers.get('etag'),
      },
    };
  } catch (err) {
    if (err.name === 'AbortError') {
      return { error: 'Request timed out after 8 seconds.', reachable: false };
    }
    return { error: err.message || 'Request failed.', reachable: false };
  } finally {
    clearTimeout(timer);
  }
}

export function formatHeaderName(name) {
  if (!name) return '(unavailable)';
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('-');
}
