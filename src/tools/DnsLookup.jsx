import * as React from 'react';
import { queryResolver, isValidDomain, DNS_TYPES_HELPER } from './types.js';

export default function DnsLookup() {
  const [domain, setDomain] = React.useState('');
  const [type, setType] = React.useState('A');
  const [result, setResult] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const run = async (e) => {
    e.preventDefault();
    if (!isValidDomain(domain.trim())) return;
    setLoading(true);
    setResult(await queryResolver('cloudflare', domain.trim(), type));
    setLoading(false);
  };

  return (
    <section aria-label="DNS lookup">
      <form className="tool-form" onSubmit={run}>
        <input
          className="form-input"
          type="text"
          placeholder="domain.com"
          aria-label="Domain"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
        />
        <select
          className="form-select"
          aria-label="Record type"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          {DNS_TYPES_HELPER.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <button type="submit" className="btn-primary" disabled={!isValidDomain(domain.trim()) || loading}>
          {loading ? 'Looking up…' : 'Look up'}
        </button>
      </form>

      {result && <ResultView result={result} />}
    </section>
  );
}

export function ResultView({ result }) {
  if (result.error) {
    return <p className="tool-error">⚠️ {result.error}</p>;
  }
  if (result.records.length === 0) {
    return <p className="tool-empty">No records of this type found.</p>;
  }
  return (
    <ul className="record-list">
      {result.records.map((r, i) => (
        <li key={i} className="record-row">{r}</li>
      ))}
    </ul>
  );
}
