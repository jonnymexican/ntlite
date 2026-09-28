import * as React from 'react';
import { SHAME_PRESET, auditAll } from './corsCheck.js';

const ORDER = { readable: 0, shame: 1, unreachable: 2 };

const LABELS = {
  readable: { icon: '✅', text: 'Headers readable' },
  shame: { icon: '🧱', text: 'Hides headers (CORS wall)' },
  unreachable: { icon: '💀', text: 'Unreachable / blocked' },
};

export default function CorsShame() {
  const [results, setResults] = React.useState(null);
  const [running, setRunning] = React.useState(false);

  const run = async (e) => {
    e.preventDefault();
    setRunning(true);
    setResults(null);
    const all = await auditAll(SHAME_PRESET, 4);
    all.sort((a, b) => ORDER[a.verdict] - ORDER[b.verdict] || a.url.localeCompare(b.url));
    setResults(all);
    setRunning(false);
  };

  const counts = results
    ? results.reduce((acc, r) => ({ ...acc, [r.verdict]: (acc[r.verdict] || 0) + 1 }), {})
    : null;

  return (
    <section aria-label="CORS wall of shame">
      <form className="tool-form" onSubmit={run}>
        <button type="submit" className="btn-primary" disabled={running}>
          {running ? 'Probing 16 sites…' : 'Run the CORS audit'}
        </button>
      </form>

      <p className="hint-line">
        Probes {SHAME_PRESET.length} popular sites from your browser: can we read their
        response headers? A ✅ means CORS-open, 🧱 means the site is up but builds a
        wall against cross-origin reads, 💀 means it didn't answer at all. CORS is
        set per-path — some 🧱 sites expose specific endpoints (like CDN file paths)
        while walling their root.
      </p>

      {counts && (
        <p className="shame-summary">
          ✅ {counts.readable || 0} readable · 🧱 {counts.shame || 0} hiding · 💀 {counts.unreachable || 0} unreachable
        </p>
      )}

      {results && (
        <ul className="record-list">
          {results.map((r) => (
            <li key={r.url} className="record-row shame-row">
              <span className={`shame-badge shame-${r.verdict}`}>{LABELS[r.verdict].icon}</span>
              <span className="shame-url">{r.url}</span>
              <span className="shame-note">
                {LABELS[r.verdict].text}
                {r.latencyMs != null ? ` · ${r.latencyMs} ms` : ''}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
