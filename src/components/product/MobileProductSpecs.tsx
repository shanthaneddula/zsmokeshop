'use client';

import { AdminProduct } from '@/types';
import { 
  CubeIcon, 
  TagIcon,
  ShieldCheckIcon,
  TruckIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import CollapsibleInfoSection from './CollapsibleInfoSection';
import ExpandableDescription from './ExpandableDescription';

interface MobileProductSpecsProps {
  product: AdminProduct;
}

export default function MobileProductSpecs({ product }: MobileProductSpecsProps) {
  const { getPrimaryPhone } = useBusinessSettings();
  const businessPhone = getPrimaryPhone();
  return (
    <div className="space-y-0">
      {/* Enhanced Description - Shows as separate sections */}
      {(product.shortDescription?.trim() || product.detailedDescription?.trim()) && (
        <div data-description-section className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
          <ExpandableDescription 
            shortDescription={product.shortDescription}
            detailedDescription={product.detailedDescription}
            className=""
          />
        </div>
      )}

      {/* Specifications */}
      <CollapsibleInfoSection 
        title="Specifications" 
        icon={<CubeIcon className="w-5 h-5" />}
      >
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide text-sm">
                SKU
              </span>
              <span className="font-medium text-gray-900 dark:text-white text-sm">
                {product.sku}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide text-sm">
                Brand
              </span>
              <span className="font-medium text-gray-900 dark:text-white text-sm">
                {product.brand || 'N/A'}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide text-sm">
                Category
              </span>
              <span className="font-medium text-gray-900 dark:text-white text-sm capitalize">
                {product.category?.replace('-', ' ')}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide text-sm">
                Stock Status
              </span>
              <span className={`font-medium text-sm ${
                product.inStock ? 'text-green-600' : 'text-red-600'
              }`}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            {product.weight && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                <span className="font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide text-sm">
                  Weight
                </span>
                <span className="font-medium text-gray-900 dark:text-white text-sm">
                  {product.weight}
                </span>
              </div>
            )}

            {product.dimensions && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                <span className="font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide text-sm">
                  Dimensions
                </span>
                <span className="font-medium text-gray-900 dark:text-white text-sm">
                  {product.dimensions}
                </span>
              </div>
            )}
          </div>
        </div>
      </CollapsibleInfoSection>

      {/* Store Information */}
      <CollapsibleInfoSection 
        title="Store Information" 
        icon={<TagIcon className="w-5 h-5" />}
      >
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <TruckIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <h5 className="font-bold text-blue-800 dark:text-blue-200 text-sm uppercase tracking-wide">
                  Store Pickup Available
                </h5>
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  Order online and pick up at our Austin location. Ready in 1-2 hours during business hours.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Location:</span>
              <span className="font-medium text-gray-900 dark:text-white">Austin, Texas</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Availability:</span>
              <span className="font-medium text-green-600">Available Now</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Store Hours:</span>
              <span className="font-medium text-gray-900 dark:text-white">Mon-Fri 10AM-9PM</span>
            </div>
          </div>
        </div>
      </CollapsibleInfoSection>

      {/* Compliance Information */}
      {(product.complianceLevel && product.complianceLevel !== 'none') && (
        <CollapsibleInfoSection 
          title="Age Verification & Compliance" 
          icon={<ShieldCheckIcon className="w-5 h-5" />}
        >
          <div className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <ShieldCheckIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <h5 className="font-bold text-yellow-800 dark:text-yellow-200 text-sm uppercase tracking-wide">
                    Age Verification Required
                  </h5>
                  <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                    You must be {product.ageRestriction || 18} or older to purchase tobacco products. Valid ID required for all purchases.
                  </p>
                </div>
              </div>
            </div>

            {product.complianceNotes && product.complianceNotes.length > 0 && (
              <div className="space-y-2">
                <h6 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wide">
                  Compliance Notes
                </h6>
                <ul className="space-y-1 text-sm">
                  {product.complianceNotes.map((note, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-gray-400 mt-1">•</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.safetyWarnings && product.safetyWarnings.length > 0 && (
              <div className="space-y-2">
                <h6 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wide">
                  Safety Warnings
                </h6>
                <ul className="space-y-1 text-sm">
                  {product.safetyWarnings.map((warning, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-red-500 mt-1">⚠</span>
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CollapsibleInfoSection>
      )}

      {/* Contact Support */}
      <CollapsibleInfoSection 
        title="Questions?" 
        icon={<ClockIcon className="w-5 h-5" />}
      >
        <div className="text-center space-y-4">
          <p className="text-sm">
            Have questions about this product? Our expert staff is here to help.
          </p>
          <div className="space-y-2">
            <a 
              href="/support" 
              className="block w-full py-3 px-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black uppercase tracking-wide text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
            >
              Contact Our Store
            </a>
            <a 
              href={`tel:${businessPhone}`} 
              className="block w-full py-3 px-4 border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white font-black uppercase tracking-wide text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Call {businessPhone}
            </a>
          </div>
        </div>
      </CollapsibleInfoSection>
    </div>
  );
}
