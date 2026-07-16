import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbsProps {
  items: { label: string; onClick?: () => void; active?: boolean }[];
  onHomeClick: () => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, onHomeClick }) => {
  return (
    <nav aria-label="Breadcrumb" className="py-3 px-4 bg-slate-50 border-y border-slate-100 flex items-center overflow-x-auto whitespace-nowrap">
      <ol className="max-w-7xl mx-auto w-full flex items-center gap-2 text-xs font-medium text-slate-500">
        <li className="flex items-center">
          <button
            onClick={onHomeClick}
            className="flex items-center gap-1.5 hover:text-[#1A6DB5] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1A6DB5] rounded-sm px-1 py-0.5"
            aria-label="Home"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
        </li>
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center gap-2">
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" aria-hidden="true" />
            {item.active ? (
              <span className="text-slate-900 font-semibold" aria-current="page">
                {item.label}
              </span>
            ) : (
              <button
                onClick={item.onClick}
                className="hover:text-[#1A6DB5] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1A6DB5] rounded-sm px-1 py-0.5"
              >
                {item.label}
              </button>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
