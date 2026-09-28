# network-tools lite 🛠️

Browser-only network utilities. No server, no logs — queries go straight from your browser to public DNS-over-HTTPS resolvers and CORS-open APIs.

**→ Use it live: [jonnymexican.github.io/ntlite](https://jonnymexican.github.io/ntlite/)**

## Tools

| Tool | What it does |
|---|---|
| **DNS Lookup** | A, AAAA, CNAME, MX, NS, TXT, SOA, SRV via Cloudflare DoH |
| **DNS Propagation** | Same query across Cloudflare, Google, and DNS.SB with a visibility-based verdict (round-robin aware) |
| **IP Info** | Geolocation, org, ASN for any IP or your own, via ipapi.co |
| **Subnet Calculator** | Full CIDR math — network, broadcast, mask, wildcard, host range, RFC classification, binary views |
| **Header Probe** | Reads CORS-exposed response headers; for sites that hide them, reports real reachability + latency via opaque fetch |

Only resolvers with verified browser-reachable JSON endpoints are used — Quad9/OpenDNS/AdGuard block cross-origin queries, so they'd silently fail in a browser.

The **full edition** (port scanner, TLS inspector, raw header fetch, security-header grader) needs a Node backend and lives in the [test-network](https://github.com/jonnymexican/test-network) repo.

## Tech

React 19 + Vite, no backend. Subnet logic is a faithful port of the server edition's `netcalc.js`. 13 unit tests (`npm test`).

## Develop

```bash
npm install
npm run dev      # http://localhost:5195/ntlite/
npm test
npm run build
```

Deploys to GitHub Pages automatically on push to `main`.

---

Part of [the apps](https://jonnymexican.github.io/links/). 🤖 Built with Codebuff.
