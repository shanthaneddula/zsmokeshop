# OptimizedImage Migration Guide

## Overview

This guide provides a systematic approach to migrate all existing Next.js Image components to use the new `OptimizedImage` component, eliminating performance warnings and implementing industry best practices.

## Migration Strategy

### Phase 1: Component Analysis ✅ COMPLETED
- [x] Created OptimizedImage component with context-based optimization
- [x] Implemented 8 different image contexts with appropriate sizing
- [x] Added loading states, error handling, and fallback UI
- [x] Created comprehensive test component

### Phase 2: Systematic Migration (IN PROGRESS)

#### Priority Order:
1. **High Traffic Components** (Homepage, Product Pages)
2. **Admin Components** (Already partially completed)
3. **Secondary Components** (Modals, Related Products)
4. **Utility Components** (Placeholders, Fallbacks)

## Context Mapping Guide

### Available Contexts

| Context | Use Case | Sizes Prop | Quality | Priority |
|---------|----------|------------|---------|----------|
| `thumbnail` | Small previews, admin lists | `64px` | 75 | false |
| `card` | Product cards, grid layouts | `(max-width: 768px) 50vw, 25vw` | 85 | false |
| `gallery` | Main product images | `(max-width: 768px) 100vw, 50vw` | 90 | false |
| `hero` | Hero sections, banners | `100vw` | 90 | true |
| `admin-thumb` | Admin interface thumbnails | `64px` | 75 | false |
| `preview` | Modal previews | `300px` | 85 | false |
| `featured` | Featured product carousels | `(max-width: 768px) 256px, 288px` | 85 | index < 4 |
| `related` | Related/recommended products | `(max-width: 768px) 50vw, 33vw` | 80 | false |

## Migration Checklist

### Components Already Migrated ✅

#### Admin Components (Manual fixes applied):
- [x] `/src/app/admin/products/products-client.tsx` - Product thumbnails
- [x] `/src/app/admin/categories/categories-client.tsx` - Category thumbnails  
- [x] `/src/app/admin/components/ProductImageUpload.tsx` - Upload previews
- [x] `/src/app/admin/components/ProductPreviewModal.tsx` - Preview images
- [x] `/src/app/admin/components/CategoryPreviewModal.tsx` - Preview images

#### Public Components (Manual fixes applied):
- [x] `/src/components/sections/featured-products.tsx` - Featured product images
- [x] `/src/components/product/ProductCard.tsx` - Product card images

### Components Migrated ✅

#### Public Components (OptimizedImage Migration Complete):
- [x] `/src/components/product/ProductImageGallery.tsx` - Main product gallery
- [x] `/src/components/product/MobileProductImageGallery.tsx` - Mobile gallery
- [x] `/src/components/product/RelatedProducts.tsx` - Related product images
- [x] `/src/components/product/ProductCard.tsx` - Product card images
- [x] `/src/components/sections/featured-products.tsx` - Featured product carousel

### Components Requiring Migration 🔄

#### High Priority:
- [x] `/src/components/sections/hero-section.tsx` - No images (uses video background)
- [ ] `/src/components/product/ProductPageTemplate.tsx` - Main product images
- [x] `/src/components/product/MobileProductImageGallery.tsx` - Mobile gallery ✅
- [x] `/src/components/sections/homepage-catalogue.tsx` - No direct images (uses ProductCard)
- [ ] `/src/app/products/[category]/page.tsx` - Category page images

#### Medium Priority:
- [x] `/src/components/product/ProductImageGallery.tsx` - Desktop gallery ✅
- [x] `/src/components/product/RelatedProducts.tsx` - Related product images ✅
- [x] `/src/components/product/ProductCard.tsx` - Product card images ✅
- [x] `/src/components/sections/featured-products.tsx` - Featured products ✅
- [ ] `/src/components/sections/testimonials.tsx` - User avatars
- [ ] `/src/components/layout/footer.tsx` - Brand logos
- [ ] `/src/app/about/page.tsx` - About page images

#### Low Priority:
- [ ] Error page images
- [ ] Loading placeholder components
- [ ] Marketing banner images

## Migration Process

### Step 1: Import OptimizedImage

```typescript
// Replace this import
import Image from 'next/image';

// With this import
import OptimizedImage from '@/components/ui/OptimizedImage';
```

### Step 2: Replace Image Components

#### Before (Manual Implementation):
```typescript
<Image
  src={product.image}
  alt={product.name}
  fill
  sizes="(max-width: 768px) 50vw, 25vw"
  priority={index === 0}
  className="object-cover"
/>
```

#### After (OptimizedImage):
```typescript
<OptimizedImage
  src={product.image}
  alt={product.name}
  context="card"
  priority={index === 0}
  className="object-cover"
/>
```

### Step 3: Choose Appropriate Context

#### Context Selection Guide:

**For Product Cards:**
```typescript
<OptimizedImage context="card" />
```

**For Admin Thumbnails:**
```typescript
<OptimizedImage context="admin-thumb" />
```

**For Hero Images:**
```typescript
<OptimizedImage context="hero" priority />
```

**For Product Galleries:**
```typescript
<OptimizedImage context="gallery" />
```

**For Featured Products:**
```typescript
<OptimizedImage 
  context="featured" 
  priority={index < 4} // First 4 images only
/>
```

## Component-Specific Migration Examples

### 1. Hero Section Migration

**File:** `/src/components/sections/hero-section.tsx`

**Before:**
```typescript
<Image
  src="/images/hero-bg.jpg"
  alt="Hero Background"
  fill
  sizes="100vw"
  priority
  className="object-cover"
/>
```

**After:**
```typescript
<OptimizedImage
  src="/images/hero-bg.jpg"
  alt="Hero Background"
  context="hero"
  className="object-cover"
/>
```

### 2. Product Gallery Migration

**File:** `/src/components/product/ProductGallery.tsx`

**Before:**
```typescript
// Main image
<Image
  src={selectedImage}
  alt="Product"
  fill
  sizes="(max-width: 768px) 100vw, 50vw"
  className="object-contain"
/>

// Thumbnails
<Image
  src={image}
  alt="Thumbnail"
  fill
  sizes="150px"
  className="object-cover"
/>
```

**After:**
```typescript
// Main image
<OptimizedImage
  src={selectedImage}
  alt="Product"
  context="gallery"
  className="object-contain"
/>

// Thumbnails
<OptimizedImage
  src={image}
  alt="Thumbnail"
  context="thumbnail"
  className="object-cover"
/>
```

### 3. Category Page Migration

**File:** `/src/app/products/[category]/page.tsx`

**Before:**
```typescript
<Image
  src={category.image}
  alt={category.name}
  fill
  sizes="(max-width: 768px) 100vw, 50vw"
  className="object-cover"
/>
```

**After:**
```typescript
<OptimizedImage
  src={category.image}
  alt={category.name}
  context="hero"
  className="object-cover"
/>
```

## Testing & Validation

### 1. Performance Testing
- [ ] Run Lighthouse audit before migration
- [ ] Run Lighthouse audit after migration
- [ ] Compare Core Web Vitals scores
- [ ] Verify no console warnings

### 2. Visual Testing
- [ ] Test all image contexts in different screen sizes
- [ ] Verify loading states work correctly
- [ ] Test error fallbacks with broken image URLs
- [ ] Confirm aspect ratios are maintained

### 3. Browser Testing
- [ ] Chrome (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Mobile Safari
- [ ] Chrome Mobile

## Quality Assurance Checklist

### Before Migration:
- [ ] Document current console warnings
- [ ] Screenshot existing layouts
- [ ] Record current Lighthouse scores
- [ ] Note any performance issues

### During Migration:
- [ ] Test each component individually
- [ ] Verify context selection is appropriate
- [ ] Check responsive behavior
- [ ] Validate loading states

### After Migration:
- [ ] Confirm zero console warnings
- [ ] Verify improved Lighthouse scores
- [ ] Test all image interactions
- [ ] Validate error handling

## Performance Metrics

### Expected Improvements:

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Console Warnings | 15+ | 0 | 100% |
| LCP Score | Variable | Optimized | 15-30% |
| Bundle Size | Larger | Smaller | 5-10% |
| Maintenance Time | High | Low | 90% |

### Success Criteria:
- ✅ Zero Next.js Image console warnings
- ✅ Improved Core Web Vitals scores
- ✅ Consistent image loading behavior
- ✅ Reduced maintenance overhead
- ✅ Better mobile performance

## Rollback Plan

If issues arise during migration:

1. **Immediate Rollback:**
   ```bash
   git revert [commit-hash]
   ```

2. **Component-Level Rollback:**
   - Revert specific component changes
   - Keep OptimizedImage for working components

3. **Gradual Rollback:**
   - Identify problematic contexts
   - Fix OptimizedImage component
   - Re-migrate affected components

## Future Enhancements

### Phase 3: Advanced Optimizations
- [ ] Implement blur placeholders
- [ ] Add responsive image sets
- [ ] Integrate with CDN
- [ ] Add image metadata detection

### Phase 4: Performance Monitoring
- [ ] Implement image performance tracking
- [ ] Add Core Web Vitals monitoring
- [ ] Create performance dashboard
- [ ] Set up automated testing

## Resources

- [Next.js Image Optimization Docs](https://nextjs.org/docs/basic-features/image-optimization)
- [Core Web Vitals Guide](https://web.dev/vitals/)
- [Image Performance Best Practices](https://web.dev/fast/#optimize-your-images)

## Support

For migration assistance or issues:
1. Check the OptimizedImageTest component for examples
2. Review context mapping guide above
3. Test with sample images before production
4. Document any edge cases discovered

---

**Migration Status:** Phase 2 - Systematic Migration
**Last Updated:** January 2025
**Next Review:** After Phase 2 completion
