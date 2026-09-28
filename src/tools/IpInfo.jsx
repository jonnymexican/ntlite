import * as React from 'react';
import { isIPv4 } from '../netcalc.js';

export default function IpInfo() {
  const [ip, setIp] = React.useState('');
  const [data, setData] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const run = async (e) => {
    e.preventDefault();
    const value = ip.trim();
    if (value && !isIPv4(value)) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch(
        value ? `https://ipapi.co/${encodeURIComponent(value)}/json/` : 'https://ipapi.co/json/'
      );
      const json = await res.json();
      if (json.error) throw new Error(json.reason || 'Lookup failed');
      setData(json);
    } catch (err) {
      setError(err.message || 'Lookup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section aria-label="IP info">
      <form className="tool-form" onSubmit={run}>
        <input
          className="form-input"
          type="text"
          placeholder="IP address (blank = your own)"
          aria-label="IP address"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
        />
        <button
          type="submit"
          className="btn-primary"
          disabled={Boolean(ip.trim() && !isIPv4(ip.trim())) || loading}
        >
          {loading ? 'Looking up…' : 'Look up'}
        </button>
      </form>

      {error && <p className="tool-error">⚠️ {error}</p>}
      {data && (
        <dl className="kv-list">
          {[
            ['IP', data.ip],
            ['Version', data.version],
            ['City', data.city],
            ['Region', data.region],
            ['Country', data.country_name],
            ['Postal', data.postal],
            ['Latitude', data.latitude],
            ['Longitude', data.longitude],
            ['Timezone', data.timezone],
            ['Organization', data.org],
            ['ASN', data.asn],
          ]
            .filter(([, v]) => v !== undefined && v !== null && v !== '')
            .map(([k, v]) => (
              <div key={k} className="kv-row">
                <dt>{k}</dt>
                <dd>{String(v)}</dd>
              </div>
            ))}
        </dl>
      )}
    </section>
  );
}
