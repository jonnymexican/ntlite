import { describe, it, expect } from 'vitest';
import netcalc, { ipToInt, intToIp, isIPv4 } from './netcalc.js';
import { dohUrl, RESOLVERS, verdictOf } from './doh.js';

describe('ip helpers', () => {
  it('converts IP to int and back', () => {
    expect(ipToInt('0.0.0.1')).toBe(1);
    expect(ipToInt('255.255.255.255')).toBe(4294967295);
    expect(ipToInt('10.0.0.77')).toBe(167772237); // 10·2²⁴ + 77
    expect(intToIp(1)).toBe('0.0.0.1');
    expect(intToIp(4294967295)).toBe('255.255.255.255');
  });

  it('validates IPv4 strictly', () => {
    expect(isIPv4('192.168.1.1')).toBe(true);
    expect(isIPv4('256.1.1.1')).toBe(false);
    expect(isIPv4('1.2.3')).toBe(false);
    expect(isIPv4('a.b.c.d')).toBe(false);
  });
});

describe('netcalc parity with the server edition', () => {
  it('computes the canonical /26 example', () => {
    const r = netcalc('10.0.0.77/26');
    expect(r.network).toBe('10.0.0.64');
    expect(r.broadcast).toBe('10.0.0.127');
    expect(r.netmask).toBe('255.255.255.192');
    expect(r.firstHost).toBe('10.0.0.65');
    expect(r.lastHost).toBe('10.0.0.126');
    expect(r.totalAddresses).toBe(64);
    expect(r.usableHosts).toBe(62);
    expect(r.type).toBe('Private (RFC 1918)');
    expect(r.isNetworkAddress).toBe(false);
  });

  it('defaults to /24 and marks network addresses', () => {
    const r = netcalc('192.168.1.0');
    expect(r.prefix).toBe(24);
    expect(r.network).toBe('192.168.1.0');
    expect(r.broadcast).toBe('192.168.1.255');
    expect(r.isNetworkAddress).toBe(true);
  });

  it('handles /31 point-to-point and /32 host routes', () => {
    const r31 = netcalc('10.0.0.4/31');
    expect(r31.usableHosts).toBe(2);
    expect(r31.firstHost).toBe('10.0.0.4');
    expect(r31.lastHost).toBe('10.0.0.5');

    const r32 = netcalc('8.8.8.8/32');
    expect(r32.usableHosts).toBe(1);
    expect(r32.firstHost).toBe('8.8.8.8');
    expect(r32.lastHost).toBe('8.8.8.8');
  });

  it('classifies special ranges', () => {
    expect(netcalc('127.0.0.1/8').type).toBe('Loopback');
    expect(netcalc('169.254.9.9/16').type).toBe('Link-local');
    expect(netcalc('100.100.1.1/10').type).toBe('CGNAT (RFC 6598)');
    expect(netcalc('8.8.4.4/22').type).toBe('Public');
  });

  it('rejects garbage like the server does', () => {
    expect(netcalc('not an ip').error).toBeDefined();
    expect(netcalc('300.1.1.1/24').error).toBeDefined();
    expect(netcalc('1.2.3.4/33').error).toBeDefined();
  });

  it('produces binary views', () => {
    const r = netcalc('10.0.0.1/24');
    expect(r.binary.ip).toBe('00001010.00000000.00000000.00000001');
    expect(r.binary.netmask).toBe('11111111.11111111.11111111.00000000');
  });
});

describe('DoH URL builder', () => {
  it('builds a name/type query URL for each resolver', () => {
    const url = dohUrl('cloudflare', 'github.com', 'A');
    expect(url).toBe('https://cloudflare-dns.com/dns-query?name=github.com&type=A');
    const google = dohUrl('google', 'example.com', 'AAAA');
    expect(google).toBe('https://dns.google/resolve?name=example.com&type=AAAA');
  });

  it('exposes three verified CORS-open resolvers', () => {
    expect(Object.keys(RESOLVERS)).toHaveLength(3);
  });

  it('derives visibility-based three-state verdicts', () => {
    const ok = (records) => ({ error: undefined, records });
    const err = () => ({ error: 'fetch failed', records: [] });
    // A records: judged by visibility (round-robin makes exact-match wrong)
    expect(verdictOf([ok(['140.82.113.3']), ok(['140.82.114.4']), ok(['140.82.121.3'])])).toBe('agree');
    expect(verdictOf([ok(['1.2.3.4']), ok([]), ok(['1.2.3.4'])])).toBe('disagree');
    expect(verdictOf([ok(['1.2.3.4']), ok(['1.2.3.4']), err()])).toBe('partial');
    expect(verdictOf([err(), err(), err()])).toBe('disagree');
    // non-address types need exact set equality
    expect(verdictOf([ok(['ns1 x']), ok(['ns1 y'])], 'TXT')).toBe('disagree');
    expect(verdictOf([ok(['ns1 x']), ok(['ns1 x'])], 'TXT')).toBe('agree');
  });
});
