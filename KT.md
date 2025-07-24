# Z Smoke Shop Website Knowledge Transfer Document
⚠️ floating-chat-prompt.tsx - Complete but not integrated
🚨 data/catalogue.ts - Creates data inconsistency (discussed earlier)
## Website Structure and Components

### Page Structure

1. **Landing Page (Homepage)**
   - File: `/src/app/page.tsx`
   - Purpose: Main entry point for visitors
   - Components:
     - Header (navigation)
     - Hero Section
     - Featured Products
     - Homepage Catalogue (product categories)
     - Store Locations
     - Newsletter Section
     - Footer

2. **Catalogue Page**
   - File: `/src/app/catalogue/page.tsx`
   - Purpose: Display all product categories and subcategories
   - Components:
     - Category tabs
     - Subcategory displays
     - Product grids

3. **Category Page**
   - File: `/src/app/category/[slug]/page.tsx`
   - Purpose: Display products for a specific category
   - Components:
     - CategoryPageClient component

4. **Support/Help Page**
   - File: `/src/app/help/page.tsx`
   - Purpose: Customer support information
   - Components:
     - Contact options
     - Help topics
     - FAQ section

## Key Components

### Header Component
- **File**: `/src/components/layout/header.tsx`
- **Height**: h-16 (64px)
- **Width**: Full width (100%)
- **Features**:
  - Logo
  - Navigation links
  - Search bar
  - Cart icon
  - Mobile menu toggle
  - Adidas-inspired styling with persistent bottom border

### Hero Section
- **File**: `/src/components/sections/hero-section.tsx`
- **Height**: Varies, but typically takes up the full viewport height on initial load
- **Boundaries**: From below the header to the start of the Featured Products section
- **Features**:
  - Large Z logo graphic
  - Bold headline text
  - Call-to-action buttons
  - Store status information

### Featured Products Section
- **File**: `/src/components/sections/featured-products.tsx`
- **Purpose**: Showcase highlighted products
- **Features**:
  - Product cards with Adidas-inspired styling
  - Best Seller/New badges
  - Clean, minimalist layout

### Homepage Catalogue
- **File**: `/src/components/sections/homepage-catalogue.tsx`
- **Purpose**: Display product categories with horizontal scrolling brand carousels
- **Features**:
  - Category tabs
  - Scrollable brand cards
  - Navigation arrows

### Store Locations
- **File**: `/src/components/sections/store-locations.tsx`
- **Purpose**: Display physical store locations
- **Features**:
  - Clean numbered sections
  - Location details
  - Call-to-action buttons

### Footer
- **File**: `/src/components/layout/footer.tsx`
- **Features**:
  - Four-column layout
  - Newsletter signup
  - Social media links
  - Company information

## Data Structure

### Product Categories
- **File**: `/src/data/catalogue.ts`
- **Structure**:
  - Main categories (Vaporizers, Glass & Smoking, etc.)
  - Subcategories for complex categories (Cannabis)
  - Brands for each category/subcategory

### Site Navigation
- Defined in the header component
- Mobile navigation in the mobile menu section of the header

## Design System

### Adidas-Inspired UI Elements
- **Typography**:
  - Uppercase text with wide tracking (letter-spacing)
  - Bold headings (font-black)
  - Light body text (font-light)
  
- **Colors**:
  - Primarily black and white
  - Strategic use of gray
  - Dark mode support
  
- **Borders and Lines**:
  - Sharp rectangular borders (no rounded corners)
  - Accent lines under headings (w-16 h-0.5)
  - Header border (border-b-2)
  
- **Spacing**:
  - Clean, structured layouts
  - Strategic use of white space
  
- **Interactions**:
  - Subtle hover effects
  - Clean transitions
  - Horizontal scrolling for brand carousels

## Technical Implementation

### Framework
- Next.js 13+ with App Router
- React 18+
- TypeScript

### Styling
- Tailwind CSS
- Custom utility classes
- Dark mode support via next-themes

### Animation
- Framer Motion for smooth transitions and hover effects

### State Management
- React useState and useRef hooks
- Context API for global state (theme, cart)

## Responsive Design

- Mobile-first approach
- Breakpoints follow Tailwind CSS defaults:
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px
  - 2xl: 1536px
- Mobile menu for smaller screens
- Responsive grid layouts
- Adaptive typography sizes

## Future Enhancements

- Real product data integration
- E-commerce functionality
- User accounts
- Enhanced search capabilities
- Product filtering and sorting
