import { useState } from 'react';

export default function Tabs({ tabs, activeTab, onChange, className = '' }) {
  return (
    <div className={`border-b border-line ${className}`}>
      <nav className="-mb-px flex gap-1 overflow-x-auto scrollbar-thin">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            onClick={() => onChange(tab.id)}
            className={`
              flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors
              ${activeTab === tab.id
                ? 'border-chamber-600 text-chamber-700'
                : 'border-transparent text-ink-muted hover:border-line hover:text-ink'
              }
            `}
            role="tab"
            aria-selected={activeTab === tab.id}
          >
            {tab.icon && <tab.icon className="h-4 w-4" aria-hidden />}
            {tab.label}
            {tab.count !== undefined && (
              <span className={`ml-1 rounded-full px-2 py-0.5 text-xs font-medium
                ${activeTab === tab.id ? 'bg-chamber-100 text-chamber-700' : 'bg-line text-ink-muted'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
