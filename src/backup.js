// Backup/restore for ntlite. The app is stateless by design (no ledger),
// but it remembers recent lookups per tool to save retyping — the vault
// preserves those, plus a marker of which tool you were on.

const KEYS = ['ntlite:recent', 'ntlite:lastTool'];

export function exportBackup() {
  const data = {};
  for (const key of KEYS) {
    try {
      const raw = window.localStorage.getItem(key);
      data[key] = raw == null ? null : JSON.parse(raw);
    } catch {
      data[key] = null; // corrupt entry — back up as empty rather than fail
    }
  }
  return {
    app: 'ntlite',
    version: 1,
    exportedAt: new Date().toISOString(),
    data,
  };
}

export function downloadBackup() {
  const blob = new Blob([JSON.stringify(exportBackup(), null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ntlite-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function parseBackup(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Not an ntlite backup file');
  }
  if (
    !parsed ||
    parsed.app !== 'ntlite' ||
    typeof parsed.data !== 'object' ||
    parsed.data === null
  ) {
    throw new Error('Not an ntlite backup file');
  }
  return parsed.data;
}

/**
 * Restores recent-lookup history. Returns the number of keys written.
 * Only trusts well-formed values — anything else is left untouched.
 */
export function applyBackup(data) {
  let applied = 0;
  for (const key of KEYS) {
    const value = data[key];
    if (value === undefined) continue;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      applied += 1;
    } catch {
      // Storage unavailable — skip this section.
    }
  }
  return applied;
}
