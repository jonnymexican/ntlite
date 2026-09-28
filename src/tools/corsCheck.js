// CORS wall-of-shame probe.
//
// For each site we ask two questions the browser CAN answer:
//   1. Does a normal (cors-mode) fetch succeed?  → headers are readable.
//   2. Does an opaque (no-cors) fetch resolve?   → site is up, but hides headers.
// If both fail, the site is unreachable (or blocks us outright).

export const SHAME_PRESET = [
  'github.com',
  'en.wikipedia.org',
  'reddit.com',
  'x.com',
  'youtube.com',
  'amazon.com',
  'netflix.com',
  'instagram.com',
  'linkedin.com',
  'stackoverflow.com',
  'news.ycombinator.com',
  'api.github.com',
  'cdn.jsdelivr.net',
  'dns.google',
  'cloudflare-dns.com',
  'example.com',
];

/**
 * Pure classification from the two probe outcomes.
 * readable: cors-mode fetch resolved. up: opaque fetch resolved.
 */
export function classify(readable, up) {
  if (readable) return 'readable';
  if (up) return 'shame';
  return 'unreachable';
}

export async function probeCors(url, timeoutMs = 4000) {
  // 1) Direct read attempt.
  const direct = await attempt(url, { mode: 'cors' }, timeoutMs);
  if (direct.ok) {
    return { url, verdict: classify(true, true), latencyMs: direct.latencyMs, headers: direct.headers };
  }

  // 2) Opaque reachability attempt.
  const opaque = await attempt(url, { mode: 'no-cors' }, timeoutMs);
  return {
    url,
    verdict: classify(false, opaque.ok),
    latencyMs: opaque.ok ? opaque.latencyMs : null,
    headers: {},
    detail: opaque.ok ? null : direct.detail,
  };
}

async function attempt(url, options, timeoutMs) {
  const started = performance.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { method: 'GET', headers: { accept: '*/*' }, signal: controller.signal, ...options });
    const latencyMs = Math.round(performance.now() - started);
    await res.arrayBuffer(); // drain
    const readable = options.mode !== 'no-cors';
    return {
      ok: true,
      latencyMs,
      headers: readable
        ? {
            'content-type': res.headers.get('content-type'),
            'cache-control': res.headers.get('cache-control'),
            server: res.headers.get('server'),
          }
        : {},
    };
  } catch (err) {
    return { ok: false, detail: err.name === 'AbortError' ? 'timeout' : 'blocked-or-down' };
  } finally {
    clearTimeout(timer);
  }
}

/** Run the audit over a list with limited concurrency. */
export async function auditAll(urls, concurrency = 4, onResult = () => {}) {
  const results = [];
  let index = 0;
  async function worker() {
    while (index < urls.length) {
      const i = index++;
      const result = await probeCors(normalize(urls[i]));
      results[i] = result;
      onResult(result, i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, urls.length) }, worker));
  return results;
}

export function normalize(raw) {
  const value = String(raw || '').trim().replace(/\/+$/, '');
  if (!value) return null;
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}
