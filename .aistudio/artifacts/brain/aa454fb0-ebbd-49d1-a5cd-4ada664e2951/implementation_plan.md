# Implementation Plan: Mobile View & Alignment Improvements

Deliver a comprehensive mobile-first overhaul addressing both the **390×844 Mobile Canvas Artboard alignment** and the **ZLab design studio responsive UI on mobile screens (<768px)**.

---

## 1. Objectives & Scope
Based on your selections, we will implement:
1. **Mobile Canvas Artboard Alignment & Fit**:
   - Compute optimal preview scale and auto-centering for the `390×844` mobile artboard with balanced viewport padding and safe area margins.
   - Touch pinch-to-zoom and two-finger pan gesture support on canvas.
   - Clean alignment of mobile UI elements within standard 16px lateral gutters and safe areas.
2. **Compact Mobile Header with Overflow Dropdown**:
   - Prevent crowding on small screens by grouping secondary controls (Zoom, M3 Studio, Audit, Undo/Redo, Export) into a unified mobile overflow menu (`...`).
3. **Docked Mobile Bottom Toolbar**:
   - Dock the primary creation tools (Move, Frame, Rectangle, Text, Hand, Comment) into a touch-friendly bottom bar on mobile screens.
4. **Slide-Out Bottom Sheet / Drawer for Inspector & Sidebar**:
   - Modern mobile bottom sheet drawer for the Inspector with touch drag handles, compact scrubbers, and intuitive tab navigation.
   - Smooth mobile slide-over drawer for LeftSidebar (Layers & Pages) with backdrop dismiss.

---

## 2. Proposed Changes

### A. Canvas & Artboard Alignment (`src/components/Canvas.tsx`, `src/features/editor/components/DeviceFrame.tsx`)
- **Auto-Fit Algorithm**:
  - Update `fitToScreen` in `Canvas.tsx` when `devicePreview === 'mobile'` to calculate container aspect ratio and apply proportional margins (minimum 16px lateral, 24px top/bottom).
  - Center the 390×844 artboard frame precisely within the visible viewport accounting for mobile toolbars and chips.
- **Touch Gesture Support**:
  - Implement two-finger pinch-to-zoom using pointer events distance calculation.
  - Implement two-finger panning for effortless canvas navigation on touchscreens.

### B. Responsive Header & Mobile Overflow (`src/components/Header/Header.tsx`)
- Adapt header layout on `< 768px`:
  - Show project name + quick home toggle.
  - Provide an interactive mobile overflow menu button (`MoreVertical`) containing:
    - View controls (Zoom In/Out, Reset Zoom, Fit View).
    - M3 Studio modal trigger.
    - Accessibility & Design Audit trigger with live score badge.
    - Undo and Redo quick actions.
    - Export button with format selector.

### C. Docked Mobile Bottom Toolbar (`src/components/FloatingToolbar.tsx`, `src/App.tsx`)
- On screens under 768px, render the toolbar as a fixed, docked bottom bar above the status bar.
- Touch-optimized button hit areas (minimum 44×44px).
- Active state indicators for current tool (`move`, `frame`, `rect`, `text`, `hand`, `comment`).

### D. Mobile Inspector Bottom Sheet (`src/components/Inspector/Inspector.tsx`)
- On mobile devices, transform the Inspector into a slide-up bottom sheet with:
  - Rounded top corners and drag indicator handle.
  - Quick close button and backdrop overlay dismiss.
  - Compact tabs (`Design`, `Prototype`, `Inspect`, `Analysis`) with horizontal scroll support.
  - Touch-friendly numeric inputs and swatch popovers.

### E. Mobile Sidebar Overlay (`src/components/LeftSidebar.tsx`)
- Ensure mobile drawer slides smoothly from the left with full height coverage and dark backdrop.
- Layer item selection auto-dismisses on mobile for distraction-free canvas interaction.

---

## 3. Verification Plan

### Automated Tests
- Run `npm test -- --run` to ensure existing and new tests pass:
  - `Inspector.test.tsx` (verify mobile bottom sheet rendering, touch responsiveness, tabs).
  - Component unit tests.
- Run `npm run lint` (`tsc --noEmit`) to verify zero TypeScript compilation issues.

### Manual / Browser Verification
- Test viewport at `390px` (iPhone 14/15/16 width), `414px`, and `768px`.
- Verify mobile canvas artboard is centered, fits comfortably, and scales responsively.
- Verify two-finger pinch zoom and touch pan gestures.
- Verify bottom sheet inspector opens, scrolls cleanly, and dismisses on backdrop tap.
- Verify docked bottom toolbar switches tools correctly.
- Verify header overflow dropdown gives one-tap access to M3 Studio, Audit, Zoom, and Export.
