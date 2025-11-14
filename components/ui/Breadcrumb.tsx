import React from 'react';
import { Icon } from './Icon';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  // If it's the dashboard (or any page that is the root), display a title instead.
  if (items.length <= 1) {
    return (
        <nav aria-label="breadcrumb" className="no-print">
            <ol className="flex items-center">
                <li>
                    <span className="font-bold text-xl text-slate-900 truncate">{items[0]?.label || ''}</span>
                </li>
            </ol>
        </nav>
    );
  }

  return (
    <nav aria-label="breadcrumb" className="no-print">
      <ol className="flex items-center space-x-1 text-base flex-wrap">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <Icon type="chevron-right" className="h-4 w-4 mx-1 flex-shrink-0 text-gray-400" />
            )}
            {index === items.length - 1 || !item.onClick ? (
              <span className="font-semibold text-gray-800 truncate max-w-[200px] sm:max-w-none" title={item.label}>{item.label}</span>
            ) : (
              <button
                onClick={item.onClick}
                className="text-gray-600 hover:text-blue-600 hover:underline transition-colors"
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

export default Breadcrumb;