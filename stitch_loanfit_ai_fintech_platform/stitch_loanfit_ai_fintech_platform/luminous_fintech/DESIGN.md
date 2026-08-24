---
name: Luminous Fintech
colors:
  surface: '#fcf8fa'
  surface-dim: '#dcd9db'
  surface-bright: '#fcf8fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f5'
  surface-container: '#f0edef'
  surface-container-high: '#eae7e9'
  surface-container-highest: '#e4e2e4'
  on-surface: '#1b1b1d'
  on-surface-variant: '#45464d'
  inverse-surface: '#303032'
  inverse-on-surface: '#f3f0f2'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#07006c'
  on-tertiary-container: '#7073ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#e1e0ff'
  tertiary-fixed-dim: '#c0c1ff'
  on-tertiary-fixed: '#07006c'
  on-tertiary-fixed-variant: '#2f2ebe'
  background: '#fcf8fa'
  on-background: '#1b1b1d'
  surface-variant: '#e4e2e4'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.03em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 40px
  margin-mobile: 20px
  stack-gap: 16px
---

## Brand & Style

The design system embodies a "High-Tech Precision" aesthetic, blending corporate reliability with the airy lightness of modern AI platforms. It is built for a target audience that values transparency, speed, and analytical depth in financial decision-making.

The visual narrative is defined by:
- **Clean Minimalism:** Vast amounts of whitespace (slate-50) to reduce cognitive load during complex data entry.
- **Modern Fluidity:** Soft, diffused glows and thin dotted-line vectors that suggest a connected, intelligent network.
- **Glass-Adjacent Surfaces:** While not full glassmorphism, the UI uses subtle layering and pure white containers to create a sense of organized depth.
- **Approachable Intelligence:** A balance of sharp geometric layouts and friendly, rounded-pill interactive elements.

## Colors

The palette is rooted in a "Paper & Ink" high-contrast foundation, utilizing high-end neutrals to establish a premium feel.

- **Primary:** Dark Navy (Slate-900) is used for primary actions, headlines, and critical UI state to ensure maximum legibility and authority.
- **Secondary/Body:** Slate-500 handles metadata, secondary labels, and helper text, providing a clear hierarchy without clutter.
- **Backgrounds:** A dual-tone strategy using Slate-50 for the global canvas and Pure White (#FFFFFF) for elevated cards and content containers.
- **Accents:** Subtle Blue/Purple indigo glows are used sparingly as "data trails" or AI-active indicators to highlight the platform's technological core.

## Typography

This design system utilizes a tiered typography strategy to balance personality with utility. 

**Plus Jakarta Sans** is the primary display face. Its geometric yet soft nature is used for headlines and prominent brand moments, providing an approachable fintech character.

**Inter** is the workhorse for the functional UI. It is used for all data-dense areas, body copy, and form labels due to its exceptional legibility and neutral, systematic tone.

Scaling follows a strict rhythmic hierarchy. On mobile, display sizes compress significantly to maintain vertical flow, while body sizes remain constant at 16px to ensure accessibility.

## Layout & Spacing

The design system employs a **Fluid-Fixed Hybrid** grid. 
- Content is housed in a centered container (max-width 1280px).
- Internal spacing follows a base-4 scale, with 16px (4 units) being the standard stack gap.
- **The Mesh Layout:** Elements such as data cards and AI insights are often connected by thin dotted lines (Slate-200) to visualize the relationship between different financial metrics.
- **Breakpoints:** 
  - *Desktop (1024px+):* 12-column grid, 24px gutters.
  - *Tablet (768px):* 8-column grid, 16px gutters.
  - *Mobile (Under 768px):* 4-column grid, 16px gutters, vertical stacking of all comparison cards.

## Elevation & Depth

Hierarchy is achieved through "Soft Volume" rather than harsh shadows.

- **Level 0 (Canvas):** Slate-50 background.
- **Level 1 (Cards):** Pure white surfaces with a wide, diffused shadow (`0px 20px 25px -5px rgba(226, 232, 240, 0.5)`). This creates a "floating" effect that makes the UI feel light and airy.
- **AI Layers:** Elements influenced by the AI assistant feature a secondary "inner glow" or a background aura in soft indigo to denote focus.
- **Lines:** Use 1px dotted lines (Slate-300) for connectors and 1px solid lines (Slate-100) for table row separators.

## Shapes

The shape language is defined by extreme variance between containers and interactive elements:
- **Structural Containers:** Content cards and modules use a `24px` (rounded-2xl) radius to provide a modern, friendly container for complex data.
- **Interactive Elements:** Navigation bars, buttons, and status chips use a `9999px` (pill-shaped) radius. This visual shorthand instantly identifies "clickable" surfaces.
- **Form Inputs:** Use a slightly tighter `12px` radius to maintain a sense of precision and structure.

## Components

### Navigation
- **Floating Pill:** The main menu is a center-aligned, pill-shaped bar. Background: `Slate-100`, Backdrop-blur: `8px`. Active states should use a white pill "chip" that slides behind the text.

### Buttons
- **Primary:** Solid `Slate-900` background, white text, pill-shaped. On hover, slight scale-up (1.02x).
- **Secondary:** Outline `Slate-300`, `Slate-900` text, pill-shaped. Clear, minimalist presence.

### Cards
- **The Analysis Card:** Pure white background, `24px` radius. Must include generous internal padding (min 32px). Used for loan details, comparison metrics, and AI insights.

### Inputs & Fields
- **Minimalist Style:** Background `Slate-50`, no border or a very faint `Slate-200` border. Focus state should trigger a soft blue ring or a change to a white background with a shadow.

### Indicators & Chips
- **Status Pills:** Small, high-contrast labels (e.g., "Best Fit", "92% Odds"). Use semi-transparent backgrounds with highly saturated text for readability.

### AI Assistant Overlay
- A persistent, docked glassmorphic window on the right side. Uses a distinct header with the Blue/Purple glow to separate AI guidance from core data entry.