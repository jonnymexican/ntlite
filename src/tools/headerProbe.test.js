import { describe, it, expect } from 'vitest';
import { formatHeaderName } from './headerProbe.js';

describe('formatHeaderName', () => {
  it('prettifies lowercase header keys', () => {
    expect(formatHeaderName('content-type')).toBe('Content-Type');
    expect(formatHeaderName('access-control-allow-origin')).toBe('Access-Control-Allow-Origin');
    expect(formatHeaderName('x-powered-by')).toBe('X-Powered-By');
  });

  it('labels missing headers', () => {
    expect(formatHeaderName(null)).toBe('(unavailable)');
  });
});
