'use client';

import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import RichTextRenderer from '@/components/ui/RichTextRenderer';

interface ExpandableDescriptionProps {
  shortDescription?: string;
  detailedDescription?: string;
  className?: string;
}

export default function ExpandableDescription({ 
  shortDescription, 
  detailedDescription,
  className = '' 
}: ExpandableDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine what content to show
  const hasShortDescription = shortDescription?.trim();
  const hasDetailedDescription = detailedDescription?.trim();

  // If we have both short and detailed descriptions, show as separate sections
  if (hasShortDescription && hasDetailedDescription) {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Product Details Section (Short Description) */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Product details
          </h3>
          <RichTextRenderer content={shortDescription || ''} />
        </div>
        
        {/* About This Item Section (Detailed Description) */}
        <div className="space-y-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              About this item
            </h3>
            {isExpanded ? (
              <ChevronUpIcon className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDownIcon className="w-5 h-5 text-gray-500" />
            )}
          </button>
          
          {isExpanded && (
            <div className="pt-2">
              <RichTextRenderer content={detailedDescription || ''} />
            </div>
          )}
        </div>
      </div>
    );
  }

  // If we only have detailed description, show it as "About this item"
  if (hasDetailedDescription) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            About this item
          </h3>
          <RichTextRenderer content={detailedDescription || ''} />
        </div>
      </div>
    );
  }

  // If we only have short description, show it as "Product details"
  if (hasShortDescription) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Product details
          </h3>
          <RichTextRenderer content={shortDescription || ''} />
        </div>
      </div>
    );
  }

  // No description available
  return null;
}
