'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Tab = { href: string; label: string; icon: React.ReactNode };

const I = (path: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6">
    <path d={path} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TABS: Tab[] = [
  { href: '/', label: 'Diario', icon: I('M4 6h16M4 12h16M4 18h10') },
  {
    href: '/storico',
    label: 'Storico',
    icon: I('M3 13h4v8H3zM10 3h4v18h-4zM17 8h4v13h-4z'),
  },
  { href: '/profilo', label: 'Profilo', icon: I('M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0') },
];

export function BottomNav() {
  const pathname = usePathname();
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur pb-safe">
      <div className="mx-auto flex max-w-md items-center justify-around px-2">
        {TABS.slice(0, 1).map((t) => (
          <NavLink key={t.href} tab={t} active={isActive(t.href)} />
        ))}

        <Link
          href="/aggiungi"
          aria-label="Aggiungi cibo"
          className="-mt-6 grid h-14 w-14 place-items-center rounded-full bg-brand text-white shadow-lg shadow-brand/30 active:scale-95 transition"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="h-7 w-7">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
        </Link>

        {TABS.slice(1).map((t) => (
          <NavLink key={t.href} tab={t} active={isActive(t.href)} />
        ))}
      </div>
    </nav>
  );
}

function NavLink({ tab, active }: { tab: Tab; active: boolean }) {
  return (
    <Link
      href={tab.href}
      className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition ${
        active ? 'text-brand' : 'text-muted'
      }`}
    >
      {tab.icon}
      {tab.label}
    </Link>
  );
}
