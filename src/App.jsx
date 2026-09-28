import * as React from 'react';
import DnsLookup from './tools/DnsLookup.jsx';
import DnsPropagation from './tools/DnsPropagation.jsx';
import IpInfo from './tools/IpInfo.jsx';
import SubnetCalculator from './tools/SubnetCalculator.jsx';
import HeaderProbe from './tools/HeaderProbe.jsx';

const TOOLS = [
  { id: 'dns', label: 'DNS Lookup', component: DnsLookup },
  { id: 'propagation', label: 'DNS Propagation', component: DnsPropagation },
  { id: 'ipinfo', label: 'IP Info', component: IpInfo },
  { id: 'netcalc', label: 'Subnet Calculator', component: SubnetCalculator },
  { id: 'headers', label: 'Header Probe', component: HeaderProbe },
];

export default function App() {
  const [tool, setTool] = React.useState('dns');
  const active = TOOLS.find((t) => t.id === tool);

  return (
    <div className="app">
      <header className="app-header">
        <h1>network-tools <span className="lite-badge">lite</span></h1>
        <p className="tagline">
          Browser-only network utilities. No server, no logs — queries go straight from your browser to public DNS-over-HTTPS resolvers.
        </p>
      </header>

      <nav className="tabs" role="tablist" aria-label="Tools">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tool === t.id}
            className={`tab ${tool === t.id ? 'active' : ''}`}
            onClick={() => setTool(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="panel">{active ? <active.component /> : null}</main>

      <footer className="app-footer">
        lite edition — DNS, propagation, IP info, subnet math. The full 8-tool edition with port scanning and TLS inspection needs a server.
      </footer>
    </div>
  );
}
