# network-tools lite 🛠️

Browser-only network utilities. No server, no logs — queries go straight from your browser to public DNS-over-HTTPS resolvers and CORS-open APIs. Installable as a PWA (works offline for subnet math).

**→ Use it live: [jonnymexican.github.io/ntlite](https://jonnymexican.github.io/ntlite/)**

## The six tools

| Tool | What it does |
|---|---|
| **DNS Lookup** | A, AAAA, CNAME, MX, NS, TXT, SOA, SRV via Cloudflare DoH |
| **DNS Propagation** | Same query across Cloudflare, Google, and DNS.SB with a visibility-based verdict (round-robin aware) |
| **IP Info** | Geolocation, org, ASN for any IP or your own, via ipapi.co |
| **Subnet Calculator** | Full CIDR math — network, broadcast, mask, wildcard, host range, RFC classification, binary views |
| **Header Probe** | Reads CORS-exposed response headers; for sites that hide them, reports real reachability + latency via opaque fetch |
| **CORS Wall of Shame** | Audits 16 popular sites for cross-origin header readability and sorts them into readable / hidden / unreachable |

Only resolvers with verified browser-reachable JSON endpoints are used — Quad9/OpenDNS/AdGuard block cross-origin queries and would silently fail in a browser.

### Live CORS audit findings (Sept 2026)

From a real run of the Wall of Shame, probing from a browser:

- **✅ readable (2/16)**: `api.github.com`, `x.com` — yes, really
- **🧱 hiding headers (13/16)**: github.com, youtube.com, reddit.com, wikipedia, amazon, netflix, instagram, linkedin, HN, example.com — plus cdn.jsdelivr.net and dns.google, which wall their *root* paths while keeping their useful endpoints CORS-open (CORS is per-path)
- **💀 unreachable from a probe (1/16)**: stackoverflow.com

## Data

The app is stateless by design; the **Vault** (footer) exports/imports your recent-lookup history as JSON. Nothing ever leaves your device except the DNS/API queries themselves.

The **full edition** (port scanner, TLS inspector, raw header fetch, security-header grader) needs a Node backend and lives in the [test-network](https://github.com/jonnymexican/test-network) repo.

## Tech

React 19 + Vite, no backend. Subnet logic is a faithful port of the server edition's `netcalc.js`. 21 unit tests (`npm test`).

## Develop

```bash
npm install
npm run dev      # http://localhost:5195/ntlite/
npm test
npm run build    # PWA icons in public/, regenerate via scripts/gen-icons.mjs
```

Deploys to GitHub Pages automatically on push to `main`.

---

Part of [the apps](https://jonnymexican.github.io/links/). 🤖 Built with Codebuff.
