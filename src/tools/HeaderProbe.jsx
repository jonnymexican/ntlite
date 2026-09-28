import * as React from 'react';
import { probeUrl, formatHeaderName } from './headerProbe.js';

export default function HeaderProbe() {
  const [url, setUrl] = React.useState('');
  const [result, setResult] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const run = async (e) => {
    e.preventDefault();
    const value = url.trim();
    if (!value) return;
    setLoading(true);
    setResult(await probeUrl(value));
    setLoading(false);
  };

  return (
    <section aria-label="Header probe">
      <form className="tool-form" onSubmit={run}>
        <input
          className="form-input"
          type="text"
          placeholder="example.com or api.github.com"
          aria-label="URL to probe"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button type="submit" className="btn-primary" disabled={!url.trim() || loading}>
          {loading ? 'Probing…' : 'Probe'}
        </button>
      </form>

      <p className="hint-line">
        Some sites (CDNs, public APIs) expose headers to browsers; others hide them.
        The probe reads what it can, and for hidden sites reports real latency and
        reachability instead.
      </p>

      {result && <ResultView result={result} />}
    </section>
  );
}

function ResultView({ result }) {
  if (result.error) {
    return <p className="tool-error">⚠️ {result.error}</p>;
  }

  const entries = Object.entries(result.headers || {}).filter(([, v]) => v !== null);

  return (
    <div className="probe-result">
      <p className="probe-meta">
        <strong>{result.finalUrl || result.url}</strong>
        {result.opaque ? (
          <> — reachable · {result.responseTimeMs} ms (headers hidden by the site)</>
        ) : (
          <> — status {result.status} · {result.responseTimeMs} ms</>
        )}
      </p>
      {result.note && <p className="hint-line">{result.note}</p>}
      {entries.length === 0 ? (
        !result.opaque && <p className="tool-empty">No headers were readable.</p>
      ) : (
        <dl className="kv-list">
          {entries.map(([name, value]) => (
            <div key={name} className="kv-row">
              <dt>{formatHeaderName(name)}</dt>
              <dd>{String(value)}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
