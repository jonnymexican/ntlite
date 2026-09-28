const LINKS = [
  { href: 'https://jonnymexican.github.io/links/', label: '🏠' },
  { href: 'https://jonnymexican.github.io/test/hub.html', label: '🧩' },
  { href: 'https://jonnymexican.github.io/test/vicinitygo/', label: '🧭' },
  { href: 'https://jonnymexican.github.io/brocredit/', label: '🎖️' },
  { href: 'https://jonnymexican.github.io/adhdTracker/', label: '✅' },
  { href: 'https://jonnymexican.github.io/ntlite/', label: '🛠️' },
];

const TITLES = {
  'https://jonnymexican.github.io/links/': 'All apps',
  'https://jonnymexican.github.io/test/hub.html': 'App hub',
  'https://jonnymexican.github.io/test/vicinitygo/': 'vicinityGo',
  'https://jonnymexican.github.io/brocredit/': 'FriendCredit',
  'https://jonnymexican.github.io/adhdTracker/': 'adhdTracker',
  'https://jonnymexican.github.io/ntlite/': 'network-tools lite',
};

/** Tiny cross-app nav. `current` is the href of the app you're in. */
export default function AppNav({ current }) {
  return (
    <nav className="app-nav" aria-label="All apps">
      {LINKS.map((l) => (
        <a
          key={l.href}
          href={l.href}
          className={`app-nav-link ${l.href === current ? 'current' : ''}`}
          aria-current={l.href === current ? 'page' : undefined}
          title={TITLES[l.href]}
        >
          {l.label}
        </a>
      ))}
    </nav>
  );
}
