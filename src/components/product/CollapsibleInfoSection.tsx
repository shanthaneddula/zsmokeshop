'use client';

import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface CollapsibleInfoSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  icon?: React.ReactNode;
}

export default function CollapsibleInfoSection({ 
  title, 
  children, 
  defaultOpen = false,
  icon 
}: CollapsibleInfoSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          {icon && (
            <div className="text-gray-600 dark:text-gray-400">
              {icon}
            </div>
          )}
          <h3 className="text-lg font-black uppercase tracking-wide text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>
        <div className="text-gray-600 dark:text-gray-400">
          {isOpen ? (
            <ChevronUpIcon className="w-5 h-5" />
          ) : (
            <ChevronDownIcon className="w-5 h-5" />
          )}
        </div>
      </button>
      
      {isOpen && (
        <div className="pb-4 px-0 md:px-8">
          <div className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
