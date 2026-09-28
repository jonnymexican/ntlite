import * as React from 'react';
import netcalc from '../netcalc.js';

export default function SubnetCalculator() {
  const [input, setInput] = React.useState('');

  const result = React.useMemo(() => {
    if (!input.trim()) return null;
    return netcalc(input);
  }, [input]);

  return (
    <section aria-label="Subnet calculator">
      <form className="tool-form" onSubmit={(e) => e.preventDefault()}>
        <input
          className="form-input"
          type="text"
          placeholder="192.168.1.77/26"
          aria-label="CIDR"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </form>

      {result && result.error && <p className="tool-error">⚠️ {result.error}</p>}

      {result && !result.error && (
        <div className="netcalc-result">
          <dl className="kv-list">
            {[
              ['Network', result.network],
              ['Broadcast', result.broadcast],
              ['Netmask', result.netmask],
              ['Wildcard', result.wildcardMask],
              ['Usable hosts', String(result.usableHosts)],
              ['Total addresses', String(result.totalAddresses)],
              ['Host range', result.ipRange],
              ['Type', result.type],
              ['IP (binary)', result.binary.ip],
              ['Mask (binary)', result.binary.netmask],
            ].map(([k, v]) => (
              <div key={k} className="kv-row">
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </section>
  );
}
