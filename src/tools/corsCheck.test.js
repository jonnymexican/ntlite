import { describe, it, expect } from 'vitest';
import { classify, normalize } from './corsCheck.js';

describe('classify', () => {
  it('labels CORS-open sites as readable', () => {
    expect(classify(true, true)).toBe('readable');
    expect(classify(true, false)).toBe('readable');
  });

  it('labels up-but-hidden sites as shame', () => {
    expect(classify(false, true)).toBe('shame');
  });

  it('labels dead sites as unreachable', () => {
    expect(classify(false, false)).toBe('unreachable');
  });
});

describe('normalize', () => {
  it('adds https and strips trailing slashes', () => {
    expect(normalize('github.com')).toBe('https://github.com');
    expect(normalize('http://example.com/')).toBe('http://example.com');
    expect(normalize('  cdn.jsdelivr.net  ')).toBe('https://cdn.jsdelivr.net');
    expect(normalize('')).toBe(null);
  });
});
