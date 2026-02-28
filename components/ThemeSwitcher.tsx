'use client';

import { useState, useEffect } from 'react';

const themes = [
  {
    name: 'trust',
    label: 'Foundational Trust',
    primary: '#0d1b2a',
    accent: '#0891b2',
  },
  {
    name: 'estate',
    label: 'Modern Estate',
    primary: '#023a20',
    accent: '#a06028',
  },
  {
    name: 'intelligence',
    label: 'Pure Intelligence',
    primary: '#0c0e1e',
    accent: '#7c3aed',
  },
];

export default function ThemeSwitcher() {
  const [active, setActive] = useState('trust');

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved && themes.some((t) => t.name === saved)) {
      setActive(saved);
      if (saved !== 'trust') {
        document.documentElement.setAttribute('data-theme', saved);
      }
    }
  }, []);

  const switchTheme = (name: string) => {
    setActive(name);
    if (name === 'trust') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', name);
    }
    localStorage.setItem('theme', name);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 bg-white rounded-full shadow-lg border border-slate-200 px-4 py-2.5 no-print">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        Theme
      </span>
      {themes.map((t) => (
        <button
          key={t.name}
          onClick={() => switchTheme(t.name)}
          title={t.label}
          className={`w-8 h-8 rounded-full transition-all cursor-pointer ${
            active === t.name
              ? 'ring-2 ring-slate-900 ring-offset-2 scale-110'
              : 'hover:scale-105'
          }`}
          style={{
            background: `linear-gradient(135deg, ${t.primary} 50%, ${t.accent} 50%)`,
          }}
        />
      ))}
    </div>
  );
}
