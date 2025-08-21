'use client';

import { AdminProduct } from '@/types';
import CollapsibleInfoSection from './CollapsibleInfoSection';
import ComplianceNote from './ComplianceNote';
import Link from 'next/link';
import { 
  InformationCircleIcon, 
  BuildingStorefrontIcon, 
  QuestionMarkCircleIcon,
  ClipboardDocumentListIcon 
} from '@heroicons/react/24/outline';

interface DesktopProductSpecsProps {
  product: AdminProduct;
}

export default function DesktopProductSpecs({ product }: DesktopProductSpecsProps) {
  return (
    <div className="space-y-6">
      {/* Product Specifications */}
      <CollapsibleInfoSection 
        title="Specifications" 
        defaultOpen={true}
        icon={<ClipboardDocumentListIcon className="w-5 h-5" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {product.brand && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="font-medium text-gray-900 dark:text-white">Brand</span>
              <span className="text-gray-600 dark:text-gray-400">{product.brand}</span>
            </div>
          )}
          
          {product.sku && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="font-medium text-gray-900 dark:text-white">SKU</span>
              <span className="text-gray-600 dark:text-gray-400">{product.sku}</span>
            </div>
          )}
          
          {product.weight && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="font-medium text-gray-900 dark:text-white">Weight</span>
              <span className="text-gray-600 dark:text-gray-400">{product.weight}</span>
            </div>
          )}
          
          {product.dimensions && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="font-medium text-gray-900 dark:text-white">Dimensions</span>
              <span className="text-gray-600 dark:text-gray-400">{product.dimensions}</span>
            </div>
          )}

          {/* Cannabis-specific specifications */}
          {product.subcategory && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="font-medium text-gray-900 dark:text-white">Type</span>
              <span className="text-gray-600 dark:text-gray-400">{product.subcategory}</span>
            </div>
          )}

          {product.strainType && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="font-medium text-gray-900 dark:text-white">Strain Type</span>
              <span className="text-gray-600 dark:text-gray-400 capitalize">{product.strainType}</span>
            </div>
          )}

          {product.strainName && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="font-medium text-gray-900 dark:text-white">Strain</span>
              <span className="text-gray-600 dark:text-gray-400">{product.strainName}</span>
            </div>
          )}

          {product.cannabinoidStrength && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="font-medium text-gray-900 dark:text-white">Strength</span>
              <span className="text-gray-600 dark:text-gray-400">{product.cannabinoidStrength}mg</span>
            </div>
          )}

          {product.thcaPercentage && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="font-medium text-gray-900 dark:text-white">THC-A</span>
              <span className="text-gray-600 dark:text-gray-400">{product.thcaPercentage}%</span>
            </div>
          )}

          {product.weightVolume && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="font-medium text-gray-900 dark:text-white">Size</span>
              <span className="text-gray-600 dark:text-gray-400">{product.weightVolume}</span>
            </div>
          )}
        </div>

        {/* Effect Tags */}
        {product.effectTags && product.effectTags.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Effects</h4>
            <div className="flex flex-wrap gap-2">
              {product.effectTags.map((effect, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full"
                >
                  {effect}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Cannabinoid Types */}
        {product.cannabinoidType && product.cannabinoidType.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Cannabinoids</h4>
            <div className="flex flex-wrap gap-2">
              {product.cannabinoidType.map((cannabinoid, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm rounded-full"
                >
                  {cannabinoid}
                </span>
              ))}
            </div>
          </div>
        )}
      </CollapsibleInfoSection>

      {/* Compliance Information */}
      {(product.complianceLevel && product.complianceLevel !== 'none') && (
        <CollapsibleInfoSection 
          title="Important Information" 
          defaultOpen={true}
          icon={<InformationCircleIcon className="w-5 h-5" />}
        >
          <ComplianceNote 
            complianceLevel={product.complianceLevel}
            ageRestriction={product.ageRestriction}
            complianceNotes={product.complianceNotes}
            safetyWarnings={product.safetyWarnings}
            legalDisclaimers={product.legalDisclaimers}
          />
        </CollapsibleInfoSection>
      )}

      {/* Store Information */}
      <CollapsibleInfoSection 
        title="Store Information" 
        defaultOpen={false}
        icon={<BuildingStorefrontIcon className="w-5 h-5" />}
      >
        <div className="space-y-4">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h4 className="font-bold text-green-800 dark:text-green-200 mb-2 uppercase tracking-wide">
              Free Store Pickup
            </h4>
            <p className="text-green-700 dark:text-green-300 text-sm">
              Order online and pick up at our Austin location. No shipping fees, immediate availability.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-wide">
              Z Smoke Shop - Austin
            </h4>
            <div className="space-y-2 text-sm">
              <p className="text-gray-600 dark:text-gray-400">
                <strong>Address:</strong> 123 Main St, Austin, TX 78701
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <strong>Phone:</strong> (512) 555-0123
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <strong>Hours:</strong> Mon-Sat 10AM-9PM, Sun 12PM-6PM
              </p>
            </div>
          </div>

          {product.ageRestriction && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <h4 className="font-bold text-amber-800 dark:text-amber-200 mb-2 uppercase tracking-wide">
                Age Verification Required
              </h4>
              <p className="text-amber-700 dark:text-amber-300 text-sm">
                You must be {product.ageRestriction}+ years old to purchase this product. 
                Valid ID required for pickup.
              </p>
            </div>
          )}
        </div>
      </CollapsibleInfoSection>

      {/* Questions & Support */}
      <CollapsibleInfoSection 
        title="Questions?" 
        defaultOpen={false}
        icon={<QuestionMarkCircleIcon className="w-5 h-5" />}
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Have questions about this product? Our expert staff is here to help!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/support"
              className="
                flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 
                px-4 py-3 font-black uppercase tracking-wide text-sm text-center
                hover:bg-gray-800 dark:hover:bg-gray-100 
                transition-colors duration-200
              "
            >
              Contact Support
            </Link>
            <Link
              href="/locations"
              className="
                flex-1 bg-transparent text-gray-900 dark:text-white 
                px-4 py-3 font-black uppercase tracking-wide text-sm text-center
                border-2 border-gray-900 dark:border-white
                hover:bg-gray-100 dark:hover:bg-gray-800 
                transition-colors duration-200
              "
            >
              Visit Store
            </Link>
          </div>
        </div>
      </CollapsibleInfoSection>
    </div>
  );
}
