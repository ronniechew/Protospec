# Protospec UI Redesign Specification

## Overview
This document outlines a comprehensive UI redesign for Protospec, a software quotation service for Malaysian SMEs. The redesign focuses on elevating visual appeal, improving typography, enhancing brand identity, refining UX flows, and ensuring mobile-first professional design.

## Brand Identity & Color Palette

### Primary Colors (Malaysian Business Context)
- **Primary Blue**: `#1E40AF` (Deep, trustworthy blue - represents professionalism and reliability)
- **Secondary Green**: `#059669` (Malaysian prosperity green - represents growth and success)
- **Accent Gold**: `#D97706` (Premium gold accent - represents quality and premium service)

### Neutral Colors
- **Background Light**: `#F8FAFC` (Soft off-white background)
- **Background Card**: `#FFFFFF` (Pure white cards)
- **Text Primary**: `#1E293B` (Dark gray-blue for primary text)
- **Text Secondary**: `#64748B` (Medium gray for secondary text)
- **Border**: `#E2E8F0` (Subtle border color)
- **Success**: `#10B981` (Green for positive feedback)
- **Warning**: `#F59E0B` (Amber for warnings)
- **Error**: `#EF4444` (Red for errors)

### Color Usage Guidelines
- Primary Blue (`#1E40AF`) for main buttons, headers, and key interactive elements
- Secondary Green (`#059669`) for cost estimates, success states, and positive indicators
- Accent Gold (`#D97706`) for premium features, highlights, and special emphasis
- Use neutral colors consistently for backgrounds, text, and borders

## Typography System

### Font Stack
- **Primary Font**: Inter (system font stack with Inter as web font fallback)
- **Font Family**: `'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif`

### Typographic Hierarchy

| Element | Size | Weight | Line Height | Letter Spacing | Color |
|---------|------|--------|-------------|----------------|-------|
| H1 (Page Title) | 2.5rem (40px) | 800 | 1.1 | -0.02em | `#1E293B` |
| H2 (Section Title) | 1.875rem (30px) | 700 | 1.2 | -0.01em | `#1E293B` |
| H3 (Card Title) | 1.25rem (20px) | 600 | 1.4 | 0 | `#1E293B` |
| Body Large | 1.125rem (18px) | 500 | 1.6 | 0 | `#1E293B` |
| Body Default | 1rem (16px) | 400 | 1.6 | 0 | `#1E293B` |
| Body Small | 0.875rem (14px) | 400 | 1.5 | 0 | `#64748B` |
| Caption | 0.75rem (12px) | 500 | 1.4 | 0.02em | `#64748B` |

### Text Alignment Rules
- **Headers**: Left-aligned (not centered) for better readability and professional appearance
- **Body Text**: Left-aligned with consistent margins
- **Buttons**: Center-aligned text within buttons
- **Cost Estimates**: Right-aligned in results view for financial clarity
- **Form Labels**: Left-aligned above input fields

## Layout & Spacing System

### Spacing Scale (Tailwind classes)
- **xs**: 0.25rem (4px) - `space-x-1`, `p-1`, `m-1`
- **sm**: 0.5rem (8px) - `space-x-2`, `p-2`, `m-2`
- **md**: 1rem (16px) - `space-x-4`, `p-4`, `m-4`
- **lg**: 1.5rem (24px) - `space-x-6`, `p-6`, `m-6`
- **xl**: 2rem (32px) - `space-x-8`, `p-8`, `m-8`
- **2xl**: 3rem (48px) - `space-x-12`, `p-12`, `m-12`

### Container Widths
- **Mobile**: Full width with 16px horizontal padding
- **Tablet**: Max-width 640px
- **Desktop**: Max-width 1280px (7xl)
- **Content Area**: Max-width 7xl with consistent padding

### Grid System
- **Template Selection**: Responsive grid (1 column mobile → 2 tablet → 3 desktop → 5 large desktop)
- **Results Cards**: 1 column mobile → 2 columns desktop
- **Requirements Analysis**: Single column with proper spacing

## Component Design Specifications

### Header & Navigation
- **Height**: 80px on desktop, 72px on mobile
- **Background**: White with subtle shadow
- **Logo**: Custom Protospec logo (see branding section)
- **Typography**: H1 weight for main title, body small for subtitle

### Cards & Containers
- **Border Radius**: 12px (rounded-xl)
- **Shadow**: Subtle elevation shadow (`shadow-sm` or custom: `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)`)
- **Padding**: Consistent 24px (p-6) internal padding
- **Border**: Optional subtle border (`border border-slate-200`)

### Buttons
- **Primary**: 
  - Background: `#1E40AF` (bg-blue-900)
  - Hover: `#1E3A8A` (bg-blue-800)
  - Text: White, medium weight
  - Padding: px-6 py-3
  - Border Radius: 8px (rounded-lg)
  - Shadow: Subtle hover shadow
  
- **Secondary**:
  - Background: White
  - Border: `#E2E8F0` (border-slate-300)
  - Hover: `#F8FAFC` (bg-slate-50)
  - Text: `#1E293B` (text-slate-900)
  - Padding: px-6 py-3
  - Border Radius: 8px (rounded-lg)

- **Success** (for cost estimates):
  - Background: `#059669` (bg-emerald-700)
  - Hover: `#047857` (bg-emerald-800)

### Form Elements
- **Input Fields**:
  - Height: 48px minimum
  - Border: `#E2E8F0` (border-slate-300)
  - Focus: Primary blue ring (`ring-2 ring-blue-500 ring-offset-2`)
  - Border Radius: 8px (rounded-lg)
  - Padding: px-4 py-3
  
- **Textarea**:
  - Min Height: 160px
  - Same styling as input fields
  - Resize: vertical only

- **Labels**:
  - Font Weight: 600 (semi-bold)
  - Margin Bottom: 8px (mb-2)
  - Color: `#1E293B` (text-slate-900)

### Template Selection Cards
- **Layout**: Card-style with icon or illustration
- **Hover State**: Subtle scale transform (scale-105) with primary color border
- **Active State**: Primary color border with slight shadow
- **Content**: Template name (medium weight), description (small, secondary color)

## UX Flow Enhancements

### Rapid Entry Workflow
1. **Real-time Feedback**: Cost preview updates instantly with smooth transitions
2. **Visual Indicators**: Progress indicators for complex calculations
3. **Smart Defaults**: Pre-filled common requirements based on templates
4. **Validation**: Inline validation with clear error messaging

### Template Selection Experience
1. **Visual Templates**: Each template has a unique icon/color scheme
2. **Preview Capability**: Hover to see template details
3. **Category Grouping**: Templates organized by business type (e-commerce, SaaS, etc.)
4. **Recent Templates**: Track and display recently used templates

### Real-time Cost Preview
1. **Prominent Placement**: Fixed position or sticky element at bottom on mobile
2. **Visual Hierarchy**: Large, bold cost display with currency symbol
3. **Breakdown Toggle**: Expandable section showing cost components
4. **Color Coding**: Green for reasonable estimates, amber for high estimates

### PDF Quote Experience
1. **Professional Layout**: Print-optimized design with company branding
2. **Download Options**: Multiple formats (PDF, email, share link)
3. **Preview Modal**: Before downloading, show PDF preview
4. **Branding Elements**: Include company logo, contact info, and professional footer

## Mobile-First Design Principles

### Touch Targets
- **Minimum Size**: 48x48px for all interactive elements
- **Spacing**: Adequate spacing between touch targets (8px minimum)
- **Feedback**: Visual feedback on touch (color change, scale)

### Responsive Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px  
- **Desktop**: > 1024px

### Mobile-Specific Optimizations
- **Keyboard Handling**: Proper focus management when keyboard appears
- **Scrolling**: Smooth, natural scrolling behavior
- **Loading States**: Skeleton loaders for async operations
- **Offline Support**: Graceful handling of offline scenarios

## Branding Elements

### Logo Design
- **Wordmark**: "Protospec" in custom typography
- **Icon**: Abstract "P" or document/checkmark combination
- **Color Variations**: Primary (blue), white (for dark backgrounds), monochrome

### Loading States
- **Skeleton Screens**: For content loading
- **Progress Indicators**: For quote generation
- **Success Animations**: Subtle checkmark animation on completion

### Micro-interactions
- **Button Hover**: Smooth color transitions
- **Form Focus**: Elegant focus rings
- **Transitions**: All state changes use smooth transitions (150ms ease-in-out)

## Implementation Guidelines

### Tailwind CSS Classes to Use
- **Colors**: Use custom palette via theme.extend.colors
- **Typography**: Use text-size classes with font-weight variants
- **Spacing**: Stick to the defined spacing scale
- **Shadows**: Use custom shadow definitions for consistency
- **Transitions**: Apply transition-all duration-150 ease-in-out

### Accessibility Considerations
- **Color Contrast**: All text meets WCAG AA contrast ratios
- **Focus Management**: Clear focus indicators for keyboard navigation
- **Screen Reader**: Proper ARIA labels and semantic HTML
- **Reduced Motion**: Respect user preference for reduced motion

### Performance Optimization
- **Critical CSS**: Inline critical styles for above-the-fold content
- **Font Loading**: Optimize font loading strategy
- **Image Optimization**: Compress and serve appropriately sized images
- **Bundle Size**: Minimize JavaScript bundle size

This specification provides a comprehensive foundation for implementing a professional, engaging, and user-friendly interface that builds trust with Malaysian SME clients while maintaining the rapid time-to-quote functionality that makes Protospec valuable.