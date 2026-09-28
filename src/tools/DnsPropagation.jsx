import * as React from 'react';
import { checkPropagation, verdictOf, RESOLVERS, isValidDomain } from '../doh.js';

export default function DnsPropagation() {
  const [domain, setDomain] = React.useState('');
  const [type, setType] = React.useState('A');
  const [result, setResult] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const run = async (e) => {
    e.preventDefault();
    const d = domain.trim();
    if (!isValidDomain(d)) return;
    setLoading(true);
    setResult(await checkPropagation(d, type));
    setLoading(false);
  };

  return (
    <section aria-label="DNS propagation">
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
          {['A', 'AAAA', 'TXT', 'NS', 'MX'].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <button type="submit" className="btn-primary" disabled={!isValidDomain(domain.trim()) || loading}>
          {loading ? 'Checking…' : 'Check propagation'}
        </button>
      </form>

      {result && (
        <div className="propagation-result">
          <p className={`verdict verdict-${verdictOf(result.results, result.type)}`}>
            {verdictOf(result.results, result.type) === 'agree'
              ? '✅ All resolvers agree — fully propagated.'
              : verdictOf(result.results, result.type) === 'partial'
                ? '⚠️ Resolvers that answered agree — one or more were unreachable.'
                : '❌ Resolvers disagree — propagation still in progress.'}
          </p>
          {Object.keys(RESOLVERS).map((id) => {
            const r = result.results.find((x) => x.resolver === id);
            if (!r) return null;
            return (
              <div key={id} className="resolver-block">
                <h3 className="resolver-name">{RESOLVERS[id].label}</h3>
                {r.error ? (
                  <p className="tool-error">⚠️ {r.error}</p>
                ) : r.records.length === 0 ? (
                  <p className="tool-empty">No records.</p>
                ) : (
                  <ul className="record-list">
                    {r.records.map((rec, i) => (
                      <li key={i} className="record-row">{rec}</li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
