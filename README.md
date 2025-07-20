# 🛍️ Z SMOKE SHOP

A modern, mobile-first website for Z SMOKE SHOP built with Next.js, TypeScript, and Tailwind CSS.

## 🏪 About Z SMOKE SHOP

Z SMOKE SHOP serves the Austin, TX area with two convenient locations:
- **Location 1**: 719 W William Cannon Dr #105, Austin, TX 78745
- **Location 2**: 5318 Cameron Rd, Austin, TX 78723

## 🚀 Features

### 🎨 **Adidas-Inspired Design System**
- **Minimalist Aesthetic**: Clean, uncluttered layouts with strategic white space
- **Bold Typography**: Uppercase text with wide letter spacing and sharp geometry
- **Authentic Mobile Navigation**: Expandable category tree matching Adidas UX patterns
- **Thin Borders**: Subtle separators instead of heavy visual elements
- **Perfect Centering**: Pixel-perfect alignment across all components

### 📱 **Mobile-First Experience**
- **Responsive Design**: Optimized for all screen sizes from 320px to 4K
- **Touch-Friendly**: Optimized button sizes and touch targets
- **Side-by-Side Buttons**: Horizontal layout on mobile for better UX
- **Expandable Menu**: Multi-level navigation with smooth animations

### 🛍️ **Product Categories**
Comprehensive smoke shop inventory including:
- **Vapes & E-Cigarettes**: Disposable Vapes, Vape Kits, E-Liquids
- **Smoking Accessories**: Pipes, Papers & Wraps, Lighters
- **Specialty Items**: CBD Products, New & Trending, Sale Items
- **Traditional Products**: Glass, Grinders, Scales, Trays
- **Premium Selection**: High-End Vaporizers, Kratoms, Shisha & Hookah

### 🎬 **Immersive Experience**
- **Video Background**: Atmospheric smoke effects on hero section
- **Smooth Animations**: Framer Motion powered transitions
- **Interactive Elements**: Hover states and micro-interactions
- **Professional Support**: Adidas-style help page with comprehensive service

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5 for type safety
- **Styling**: Tailwind CSS 3.3.0 with custom design system
- **Animations**: Framer Motion for smooth transitions
- **Icons**: Lucide React for clean iconography
- **Themes**: next-themes for dark mode support
- **Forms**: @tailwindcss/forms for enhanced form styling
- **Deployment**: Optimized for Vercel

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd zsmokeshop
```

2. **Install dependencies:**
```bash
npm install
# or
yarn install
```

3. **Start the development server:**
```bash
npm run dev
# or
yarn dev
```

4. **Open your browser:**
Visit [http://localhost:3000](http://localhost:3000) to see the website.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🌍 Deployment

The site is optimized for deployment on Vercel:

1. **Connect your GitHub repository to Vercel**
2. **Configure build settings** (auto-detected)
3. **Deploy** - Automatic deployments on push to main branch

## 📱 Mobile Experience

The website is designed mobile-first with:
- Responsive breakpoints: `xs: 375px`, `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`, `2xl: 1536px`
- Touch-optimized navigation with expandable categories
- Optimized images and video backgrounds for mobile
- Fast loading times with Next.js optimization

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── globals.css         # Global styles and Tailwind imports
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Homepage
│   ├── support/            # Support/Help pages
│   ├── locations/          # Store locations
│   └── products/           # Product pages
├── components/             # Reusable UI components
│   ├── layout/             # Layout components (header, footer)
│   ├── sections/           # Page sections (hero, products)
│   └── ui/                 # UI components
├── types/                  # TypeScript type definitions
└── data/                   # Static data and configurations
```

## 🎨 Adidas-Inspired Design System

### **Visual Principles**
- **Minimalist Aesthetic**: Clean layouts with strategic white space
- **Sharp Geometry**: Rectangular borders, no rounded corners
- **High Contrast**: Black and white with subtle gray accents
- **Bold Typography**: Uppercase text with wide letter spacing

### **Layout System**
- **Mobile**: Single column with expandable navigation
- **Desktop**: Multi-column grids with hover interactions
- **Responsive**: Fluid layouts adapting to all screen sizes

### **Interactive Elements**
- **Hover States**: Subtle color inversions (black ↔ white)
- **Animations**: Smooth Framer Motion transitions
- **Focus States**: Accessible keyboard navigation
- **Touch Targets**: Optimized for mobile interaction

### **Typography Scale**
- **Headings**: `text-3xl` to `text-8xl` with `font-black`
- **Body**: `text-sm` to `text-xl` with `font-medium`
- **Tracking**: `tracking-wide` to `tracking-widest`
- **Case**: Strategic use of `uppercase` for emphasis

## 🚀 Deployment

The project is optimized for deployment on Vercel:

```bash
npm run build
```

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
