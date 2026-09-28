import { describe, it, expect, beforeEach } from 'vitest';
import { exportBackup, parseBackup, applyBackup } from './backup.js';

beforeEach(() => {
  window.localStorage.clear();
});

describe('vault', () => {
  it('exports app state with metadata', () => {
    window.localStorage.setItem('ntlite:recent', JSON.stringify({ dns: ['github.com'] }));
    const backup = exportBackup();
    expect(backup.app).toBe('ntlite');
    expect(backup.version).toBe(1);
    expect(backup.data['ntlite:recent']).toEqual({ dns: ['github.com'] });
    expect(typeof backup.exportedAt).toBe('string');
  });

  it('parses valid backups and rejects junk', () => {
    const backup = exportBackup();
    expect(parseBackup(JSON.stringify(backup))).toEqual(backup.data);
    expect(() => parseBackup('not json')).toThrow(/not an ntlite backup/i);
    expect(() => parseBackup('{"app":"other","data":{}}')).toThrow(/not an ntlite backup/i);
    expect(() => parseBackup('{"app":"ntlite"}')).toThrow(/not an ntlite backup/i);
  });

  it('applies only known keys and returns the count', () => {
    const applied = applyBackup({
      'ntlite:recent': { dns: ['example.com'] },
      'ntlite:lastTool': 'dns',
      'evil:key': 'nope',
    });
    expect(applied).toBe(2);
    expect(JSON.parse(window.localStorage.getItem('ntlite:recent'))).toEqual({ dns: ['example.com'] });
    expect(JSON.parse(window.localStorage.getItem('ntlite:lastTool'))).toBe('dns');
    expect(window.localStorage.getItem('evil:key')).toBe(null);
  });

  it('round-trips through a real export', () => {
    window.localStorage.setItem('ntlite:recent', JSON.stringify({ netcalc: ['10.0.0.1/24'] }));
    const restored = applyBackup(parseBackup(JSON.stringify(exportBackup())));
    expect(restored).toBeGreaterThan(0);
    expect(JSON.parse(window.localStorage.getItem('ntlite:recent'))).toEqual({ netcalc: ['10.0.0.1/24'] });
  });
});
