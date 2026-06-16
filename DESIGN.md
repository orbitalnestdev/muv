---
name: Slate & Stone Premium
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#444748'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c8c6c5'
  secondary: '#545f72'
  on-secondary: '#ffffff'
  secondary-container: '#d5e0f7'
  on-secondary-container: '#586377'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#261900'
  on-tertiary-container: '#a17f3b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474746'
  secondary-fixed: '#d8e3fa'
  secondary-fixed-dim: '#bcc7dd'
  on-secondary-fixed: '#111c2c'
  on-secondary-fixed-variant: '#3c475a'
  tertiary-fixed: '#ffdea5'
  tertiary-fixed-dim: '#e9c176'
  on-tertiary-fixed: '#261900'
  on-tertiary-fixed-variant: '#5d4201'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
  deep-charcoal: '#121212'
  slate-blue: '#4A5568'
  refined-gold: '#C5A059'
  off-white: '#F7F8F9'
  pure-white: '#FFFFFF'
typography:
  display-lg:
    fontFamily: Montserrat
    fontSize: 64px
    fontWeight: '700'
    lineHeight: 72px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Montserrat
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.01em
  headline-xl:
    fontFamily: Montserrat
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
  headline-lg:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 32px
  margin-desktop: 64px
  margin-mobile: 20px
  section-gap: 120px
---

## Brand & Style

This design system is built to transform the digital presence into a premium, high-end real estate experience. The brand personality is authoritative yet approachable, evoking feelings of exclusivity, security, and architectural precision. 

The aesthetic follows a **Minimalist** philosophy, prioritizing high-quality architectural photography over decorative elements. By utilizing expansive whitespace (macro-typography) and a restrained color palette, the interface allows the properties to serve as the primary visual driver. The design balances the "raw" feeling of high-end materials like concrete and steel with the warmth of sophisticated accent tones, creating a contemporary atmosphere that appeals to discerning buyers and investors.

## Colors

The palette is anchored by **Deep Charcoal**, used for primary text and structural elements to provide a weighted, trustworthy foundation. **Slate Blue** serves as the primary functional accent, offering a contemporary alternative to traditional corporate blues, while **Refined Gold** is reserved for high-value interactions, badges, and premium tier indicators.

Backgrounds should primarily utilize **Pure White** for content areas to ensure maximum clarity, with **Off-white** used for section separation and container backgrounds to reduce optical fatigue.

## Typography

This design system employs a dual-font strategy to balance character with utility. **Montserrat** is used for headlines to convey a bold, architectural strength. It should be typeset with tight letter-spacing in larger sizes to maintain a modern, editorial feel.

**Inter** handles all functional text, body copy, and UI labels. Its neutral, systematic nature provides excellent legibility at smaller sizes, essential for property details and data tables. Use uppercase styling for `label-lg` to create a sense of hierarchy in navigation and sub-headers.

## Layout & Spacing

The layout utilizes a **12-column fixed grid** centered within the viewport for desktop, ensuring content remains readable and structured. A generous 120px section gap is mandated to create the "spacious" feeling requested, preventing the UI from feeling cluttered.

Spacing follows an 8px rhythmic scale. On mobile, margins tighten to 20px, and the grid collapses to a single column, though property cards may maintain a 2-column layout if images are clear enough. Use "safe area" padding for all content containers to ensure architectural photography never feels cramped against the edge of the screen.

## Elevation & Depth

This design system moves away from heavy drop shadows in favor of **Tonal Layers** and **Low-contrast Outlines**. Depth is created by placing white containers on light gray (`#F7F8F9`) backgrounds.

When shadows are necessary (e.g., for floating navigation or active modals), use "Ambient Shadows": extremely diffused, low-opacity (#000000 at 4-6%), with a large blur radius (30px+) to mimic natural, soft gallery lighting. Thin 1px borders in a muted gray (`#E2E8F0`) should be used for form fields and card outlines to maintain a crisp, sharp architectural edge.

## Shapes

The shape language is **Soft (Level 1)**. This subtle rounding (0.25rem) softens the "brutalist" edge of a purely sharp design while maintaining a sense of precision and structure. It reflects the "soft-minimalism" found in modern architecture.

Buttons and input fields should strictly adhere to this radius. Interactive components like property tags or chips may use a slightly more rounded profile (up to 0.5rem) to differentiate them from structural layout blocks.

## Components

### Buttons
Primary buttons use the **Deep Charcoal** background with **Pure White** text, featuring the Level 1 corner radius. Secondary buttons should be "Ghost" style: a 1px Slate Blue border with Slate Blue text. For premium CTAs (e.g., "Book a Viewing"), use a **Refined Gold** accent.

### Cards
Property cards are the core component. They must feature a full-bleed image at the top with a 3:2 aspect ratio. Content below the image should be padded generously (24px) using `headline-md` for price and `body-md` for address details. Shadows should be absent until the card is hovered, at which point an ambient shadow is applied.

### Input Fields
Inputs are minimalist: a 1px bottom-border only or a very light full-border. Labels should use `label-sm` positioned above the field. Focus states should be indicated by the border color transitioning to Slate Blue.

### Chips & Badges
Used for property status (e.g., "New Listing," "Sold"). These should use `label-sm` with a light-tinted background of the status color (e.g., light gold for "Featured") and no border to keep the UI clean.

### Navigation
The header should be transparent on hero sections, transitioning to a solid white background with a very subtle ambient shadow upon scrolling. Use `label-lg` for navigation items with a Slate Blue active state indicator (a simple dot or underline).