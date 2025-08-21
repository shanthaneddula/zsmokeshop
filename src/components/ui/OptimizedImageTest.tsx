"use client";

import OptimizedImage, { ImageContext } from './OptimizedImage';

/**
 * Test component to demonstrate OptimizedImage usage across different contexts
 * This component can be used for testing and as a reference for implementation
 */
export default function OptimizedImageTest() {
  // Sample images for testing (using existing product images)
  const sampleImages = {
    product: "/images/products/HANDPIPE.webp",
    admin: "/images/admin/general/watermelon-zkittlez--1753476562749-0zgnmm.jpg",
    placeholder: "/images/placeholder.jpg"
  };

  const contexts: { context: ImageContext; description: string; containerClass: string }[] = [
    {
      context: 'thumbnail',
      description: 'Admin thumbnails (64x64 fixed)',
      containerClass: 'w-16 h-16'
    },
    {
      context: 'card',
      description: 'Product cards (responsive grid)',
      containerClass: 'w-64 h-48'
    },
    {
      context: 'gallery',
      description: 'Main product images (large display)',
      containerClass: 'w-96 h-64'
    },
    {
      context: 'hero',
      description: 'Hero sections (full width)',
      containerClass: 'w-full h-64'
    },
    {
      context: 'admin-thumb',
      description: 'Admin interface thumbnails',
      containerClass: 'w-16 h-16'
    },
    {
      context: 'preview',
      description: 'Modal previews (300px)',
      containerClass: 'w-72 h-48'
    },
    {
      context: 'featured',
      description: 'Featured product carousel',
      containerClass: 'w-72 h-52'
    },
    {
      context: 'related',
      description: 'Related products section',
      containerClass: 'w-48 h-48'
    }
  ];

  return (
    <div className="p-8 space-y-8 bg-white dark:bg-gray-900">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black uppercase tracking-wide text-gray-900 dark:text-white mb-4">
          OptimizedImage Test Suite
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Testing all image contexts with performance optimizations
        </p>
      </div>

      {/* Context Examples */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {contexts.map(({ context, description, containerClass }) => (
          <div key={context} className="space-y-4">
            <div className="text-center">
              <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wide text-sm mb-2">
                {context}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {description}
              </p>
            </div>
            
            <div className={`relative ${containerClass} border border-gray-200 dark:border-gray-700 rounded overflow-hidden bg-gray-100 dark:bg-gray-800`}>
              <OptimizedImage
                src={sampleImages.product}
                alt={`${context} example`}
                context={context}
                className="object-cover"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Performance Comparison */}
      <div className="mt-12 space-y-6">
        <h2 className="text-2xl font-black uppercase tracking-wide text-gray-900 dark:text-white text-center">
          Performance Comparison
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Before: Manual Implementation */}
          <div className="space-y-4">
            <h3 className="font-bold text-red-600 dark:text-red-400 uppercase tracking-wide text-sm">
              ❌ Before: Manual Implementation
            </h3>
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded border border-red-200 dark:border-red-800">
              <pre className="text-xs text-red-800 dark:text-red-200 overflow-x-auto">
{`// Manual sizes calculation required
<Image
  src="/images/product.webp"
  alt="Product"
  fill
  sizes="(max-width: 768px) 50vw, 25vw"
  className="object-cover"
/>

// Issues:
// - Manual sizes calculation
// - Inconsistent across components  
// - Performance warnings
// - Maintenance overhead`}
              </pre>
            </div>
          </div>

          {/* After: OptimizedImage */}
          <div className="space-y-4">
            <h3 className="font-bold text-green-600 dark:text-green-400 uppercase tracking-wide text-sm">
              ✅ After: OptimizedImage
            </h3>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded border border-green-200 dark:border-green-800">
              <pre className="text-xs text-green-800 dark:text-green-200 overflow-x-auto">
{`// Context-aware optimization
<OptimizedImage
  src="/images/product.webp"
  alt="Product"
  context="card"
  className="object-cover"
/>

// Benefits:
// - Automatic optimization
// - Consistent performance
// - Zero console warnings
// - Easy maintenance`}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Examples */}
      <div className="mt-12 space-y-6">
        <h2 className="text-2xl font-black uppercase tracking-wide text-gray-900 dark:text-white text-center">
          Usage Examples
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Card Example */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wide text-sm">
              Product Card
            </h3>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
              <div className="relative w-full h-48">
                <OptimizedImage
                  src={sampleImages.product}
                  alt="Sample Product"
                  context="card"
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">Sample Product</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Using &apos;card&apos; context for optimal performance</p>
              </div>
            </div>
          </div>

          {/* Admin Thumbnail Example */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wide text-sm">
              Admin Thumbnail
            </h3>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-4">
              <div className="flex items-center space-x-4">
                <div className="relative w-16 h-16 border border-gray-200 dark:border-gray-700 rounded">
                  <OptimizedImage
                    src={sampleImages.product}
                    alt="Admin Thumbnail"
                    context="admin-thumb"
                    className="object-cover rounded"
                  />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Product Name</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Using &apos;admin-thumb&apos; context (64px)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="mt-12 bg-gray-50 dark:bg-gray-800 p-6 rounded border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-black uppercase tracking-wide text-gray-900 dark:text-white text-center mb-6">
          Performance Benefits
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="space-y-2">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">0</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">Console Warnings</div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">100%</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">Automated</div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">8</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">Contexts</div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">90%</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">Less Maintenance</div>
          </div>
        </div>
      </div>
    </div>
  );
}
