import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbsProps {
  items: { label: string; onClick?: () => void; active?: boolean }[];
  onHomeClick: () => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, onHomeClick }) => {
  return (
    <nav aria-label="Breadcrumb" className="py-3 px-4 bg-grey-50 border-y border-grey-200 flex items-center overflow-x-auto whitespace-nowrap">
      <ol className="max-w-7xl mx-auto w-full flex items-center gap-2 text-xs font-display font-medium text-grey-600">
        <li className="flex items-center">
          <button
            onClick={onHomeClick}
            className="flex items-center gap-1.5 hover:text-blue-700 transition-colors focus:outline-none rounded-md px-1.5 py-0.5 cursor-pointer font-semibold"
            aria-label="Home"
          >
            <Home className="w-3.5 h-3.5 text-blue-700" />
            <span>Home</span>
          </button>
        </li>
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center gap-2">
            <ChevronRight className="w-3.5 h-3.5 text-grey-400" aria-hidden="true" />
            {item.active ? (
              <span className="text-ink font-bold" aria-current="page">
                {item.label}
              </span>
            ) : (
              <button
                onClick={item.onClick}
                className="hover:text-blue-700 transition-colors focus:outline-none rounded-md px-1.5 py-0.5 cursor-pointer font-medium"
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

