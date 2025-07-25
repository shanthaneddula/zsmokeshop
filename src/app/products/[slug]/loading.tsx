export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Breadcrumb Skeleton */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center space-x-2 text-sm">
          <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
          <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
          <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery Skeleton */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
              ))}
            </div>
          </div>

          {/* Product Info Skeleton */}
          <div className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
              <div className="h-6 w-1/2 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="h-8 w-1/3 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
              <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
            </div>

            {/* Badges */}
            <div className="flex space-x-2">
              <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
              <div className="h-6 w-12 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
              <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
              <div className="h-4 w-4/6 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
              <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
            </div>

            {/* Specifications */}
            <div className="space-y-4">
              <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
              <div className="grid grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-1">
                    <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                    <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Skeleton */}
        <div className="mt-16">
          <div className="h-8 w-1/4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mb-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-square bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                  <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                  <div className="h-6 w-1/2 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
