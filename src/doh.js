// DNS-over-HTTPS helpers. Uses RFC 8484 JSON APIs served with CORS headers,
// so the browser can query them directly — no backend needed.
//
// Only resolvers with verified browser-reachable (CORS) JSON endpoints are
// listed; Quad9/OpenDNS/AdGuard/NextDNS block cross-origin JSON queries.

export const RESOLVERS = {
  cloudflare: {
    label: 'Cloudflare (1.1.1.1)',
    endpoint: 'https://cloudflare-dns.com/dns-query',
  },
  google: {
    label: 'Google (8.8.8.8)',
    endpoint: 'https://dns.google/resolve',
  },
  dnssb: {
    label: 'DNS.SB (185.222.222.222)',
    endpoint: 'https://dns.sb/dns-query',
  },
};

export function isValidDomain(value) {
  return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i.test(value) && value.length <= 253;
}

export function dohUrl(resolverId, domain, type) {
  const endpoint = RESOLVERS[resolverId].endpoint;
  const sep = endpoint.includes('?') ? '&' : '?';
  return `${endpoint}${sep}name=${encodeURIComponent(domain)}&type=${encodeURIComponent(type)}`;
}

/**
 * Query one resolver via DoH JSON. Returns a normalized result:
 * { resolver, records: string[], error?, status }
 */
export async function queryResolver(resolverId, domain, type) {
  const url = dohUrl(resolverId, domain, type);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    const res = await fetch(url, { headers: { accept: 'application/dns-json' }, signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.Status !== 0) {
      return { resolver: resolverId, records: [], status: data.Status, error: `DNS status ${data.Status}` };
    }
    const records = (data.Answer || []).map((a) =>
      typeof a.data === 'string' ? a.data.replace(/^"|"$/g, '') : String(a.data)
    );
    return { resolver: resolverId, records, status: 0 };
  } catch (err) {
    return { resolver: resolverId, records: [], error: err.message || 'query failed' };
  } finally {
    clearTimeout(timer);
  }
}

/** Run the same query across every resolver. */
export async function checkPropagation(domain, type = 'A') {
  const ids = Object.keys(RESOLVERS);
  const results = await Promise.all(ids.map((id) => queryResolver(id, domain, type)));
  return { domain, type, results };
}

/**
 * Three-state verdict from raw results: agree | partial | disagree.
 *
 * Propagation is judged by visibility, not byte-equality: round-robin DNS
 * means each resolver may honestly return a different address, so for
 * A/AAAA records the question is "does every resolver see at least one
 * record?". A split result (some resolvers see records, others see none)
 * is real disagreement. Non-address record types (TXT/NS/MX/…) compare
 * exact answer sets, since those should be identical everywhere.
 */
export function verdictOf(results, type = 'A') {
  const ok = results.filter((r) => !r.error);
  const failed = results.length - ok.length;
  if (ok.length === 0) return 'disagree';

  const isAddress = type === 'A' || type === 'AAAA';
  let consistent;

  if (isAddress) {
    const seeing = ok.filter((r) => r.records.length > 0);
    consistent = seeing.length === ok.length;
  } else {
    const sig = (set) => [...set].sort().join('|');
    consistent = ok.every((r) => sig(r.records) === sig(ok[0].records));
  }

  if (consistent && failed === 0) return 'agree';
  if (consistent) return 'partial';
  return 'disagree';
}
