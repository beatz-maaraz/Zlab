import { CanvasElement } from '../types';

export interface ContrastResult {
  ratio: number;
  foreground: string;
  background: string;
  normalTextAA: boolean;
  normalTextAAA: boolean;
  largeTextAA: boolean;
  largeTextAAA: boolean;
  uiComponentAA: boolean;
  rating: 'AAA' | 'AA' | 'AA Large' | 'Fail';
}

export interface AnalysisIssue {
  id: string;
  elementId: string;
  elementName: string;
  category: 'contrast' | 'touch-target' | 'tokens' | 'layout' | 'typography';
  severity: 'error' | 'warning' | 'info';
  title: string;
  description: string;
  recommendation: string;
  autoFixAvailable: boolean;
  autoFixLabel?: string;
  fixPayload?: Partial<CanvasElement>;
}

export interface DesignSystemAuditReport {
  overallScore: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  summary: {
    totalElements: number;
    totalIssues: number;
    errorsCount: number;
    warningsCount: number;
    contrastScore: number;
    tokenScore: number;
    touchTargetScore: number;
    layoutScore: number;
  };
  issues: AnalysisIssue[];
  tokenStats: {
    tokenizedCount: number;
    rawHexCount: number;
    tokenCoveragePercent: number;
  };
  accessibilityStats: {
    passedContrastCount: number;
    failedContrastCount: number;
    compliancePercent: number;
  };
}

// System Palette Tokens for Conformance Matching
export const KNOWN_DESIGN_TOKENS: Record<string, { name: string; system: 'm3' | 'ios' | 'glass' }> = {
  // Material 3 Dark System Tokens
  '#D0BCFF': { name: 'md.sys.color.primary (Light Purple)', system: 'm3' },
  '#381E72': { name: 'md.sys.color.onPrimary (Deep Purple)', system: 'm3' },
  '#EADDFF': { name: 'md.sys.color.primaryContainer (Lavender)', system: 'm3' },
  '#21005D': { name: 'md.sys.color.onPrimaryContainer', system: 'm3' },
  '#CCC2DC': { name: 'md.sys.color.secondary (Muted Lilac)', system: 'm3' },
  '#332D41': { name: 'md.sys.color.onSecondary', system: 'm3' },
  '#4A4458': { name: 'md.sys.color.secondaryContainer', system: 'm3' },
  '#E8DEF8': { name: 'md.sys.color.onSecondaryContainer', system: 'm3' },
  '#141218': { name: 'md.sys.color.surface (Dark Obsidian)', system: 'm3' },
  '#1D1B20': { name: 'md.sys.color.surfaceContainer', system: 'm3' },
  '#2B2930': { name: 'md.sys.color.surfaceContainerHigh', system: 'm3' },
  '#36343B': { name: 'md.sys.color.surfaceContainerHighest', system: 'm3' },
  '#E6E0E9': { name: 'md.sys.color.onSurface (Off-white)', system: 'm3' },
  '#CAC4D0': { name: 'md.sys.color.onSurfaceVariant', system: 'm3' },
  '#938F99': { name: 'md.sys.color.outline', system: 'm3' },
  '#49454F': { name: 'md.sys.color.outlineVariant', system: 'm3' },
  '#F2B8B5': { name: 'md.sys.color.error', system: 'm3' },
  '#601410': { name: 'md.sys.color.onError', system: 'm3' },
  '#8C1D18': { name: 'md.sys.color.errorContainer', system: 'm3' },
  '#F9DEDC': { name: 'md.sys.color.onErrorContainer', system: 'm3' },

  // Brand Electric Blue Accent
  '#0D99FF': { name: 'sys.color.brandPrimary (Electric Blue)', system: 'm3' },
  '#9FCAFF': { name: 'sys.color.brandContainer (Sky Blue)', system: 'm3' },
  '#002F55': { name: 'sys.color.onBrandPrimary', system: 'm3' },

  // iOS HIG Tokens
  '#007AFF': { name: 'ios.systemBlue', system: 'ios' },
  '#34C759': { name: 'ios.systemGreen', system: 'ios' },
  '#FF9500': { name: 'ios.systemOrange', system: 'ios' },
  '#FF2D55': { name: 'ios.systemPink', system: 'ios' },
  '#5856D6': { name: 'ios.systemPurple', system: 'ios' },
  '#AF52DE': { name: 'ios.systemIndigo', system: 'ios' },
  '#FF3B30': { name: 'ios.systemRed', system: 'ios' },
  '#1C1C1E': { name: 'ios.systemGray6Dark', system: 'ios' },
  '#2C2C2E': { name: 'ios.systemGray5Dark', system: 'ios' },
  '#3A3A3C': { name: 'ios.systemGray4Dark', system: 'ios' },
  '#8E8E93': { name: 'ios.systemGray', system: 'ios' },
  '#FFFFFF': { name: 'ios.label (Pure White)', system: 'ios' },
  '#000000': { name: 'ios.background (Pure Black)', system: 'ios' },
};

/**
 * Converts a hex or rgb string into RGB components [0-255].
 */
export function parseColor(colorStr: string): [number, number, number] {
  if (!colorStr || colorStr === 'none' || colorStr === 'transparent') {
    return [20, 18, 24]; // default dark fallback
  }

  // Hex format (#RGB or #RRGGBB)
  if (colorStr.startsWith('#')) {
    let hex = colorStr.slice(1);
    if (hex.length === 3) {
      hex = hex.split('').map((c) => c + c).join('');
    }
    if (hex.length >= 6) {
      const r = parseInt(hex.substring(0, 2), 16) || 0;
      const g = parseInt(hex.substring(2, 4), 16) || 0;
      const b = parseInt(hex.substring(4, 6), 16) || 0;
      return [r, g, b];
    }
  }

  // rgba or rgb format
  const rgbMatch = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (rgbMatch) {
    return [parseInt(rgbMatch[1], 10), parseInt(rgbMatch[2], 10), parseInt(rgbMatch[3], 10)];
  }

  return [255, 255, 255];
}

/**
 * Calculates WCAG 2.1 relative luminance for an sRGB component.
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((val) => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculates WCAG 2.1 Contrast Ratio between two colors.
 */
export function calculateContrastRatio(fgColor: string, bgColor: string): ContrastResult {
  const [r1, g1, b1] = parseColor(fgColor);
  const [r2, g2, b2] = parseColor(bgColor);

  const lum1 = getLuminance(r1, g1, b1);
  const lum2 = getLuminance(r2, g2, b2);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  const rawRatio = (brightest + 0.05) / (darkest + 0.05);
  const ratio = Math.round(rawRatio * 100) / 100;

  const normalTextAA = ratio >= 4.5;
  const normalTextAAA = ratio >= 7.0;
  const largeTextAA = ratio >= 3.0;
  const largeTextAAA = ratio >= 4.5;
  const uiComponentAA = ratio >= 3.0;

  let rating: 'AAA' | 'AA' | 'AA Large' | 'Fail' = 'Fail';
  if (normalTextAAA) {
    rating = 'AAA';
  } else if (normalTextAA) {
    rating = 'AA';
  } else if (largeTextAA) {
    rating = 'AA Large';
  }

  return {
    ratio,
    foreground: fgColor,
    background: bgColor,
    normalTextAA,
    normalTextAAA,
    largeTextAA,
    largeTextAAA,
    uiComponentAA,
    rating,
  };
}

/**
 * Computes an optimal high-contrast color (white or near-black) for a given background.
 */
export function getOptimalContrastColor(bgColor: string): string {
  const [r, g, b] = parseColor(bgColor);
  const lum = getLuminance(r, g, b);
  // If background luminance is greater than 0.35, dark text produces highest contrast
  return lum > 0.35 ? '#1C1B1F' : '#FFFFFF';
}

/**
 * Audits a single CanvasElement for contrast, touch targets, tokens, and geometry.
 */
export function auditElement(
  element: CanvasElement,
  allElements: Record<string, CanvasElement>,
  artboardSize: { width: number; height: number } = { width: 1440, height: 900 }
): AnalysisIssue[] {
  const issues: AnalysisIssue[] = [];
  if (!element || element.visible === false) return issues;

  // Skip root artboards from minor component checks
  const isArtboard =
    element.id === 'desktop-1440' ||
    element.id === 'mobile-app-view' ||
    element.id === 'default-artboard-frame';

  // 1. WCAG Contrast Check for Text and Buttons
  if (element.type === 'text' || element.type === 'button' || element.textContent) {
    const parent = element.parentId ? allElements[element.parentId] : null;
    const effectiveBg =
      element.type === 'button'
        ? element.fill && element.fill !== 'none'
          ? element.fill
          : '#0D99FF'
        : parent && parent.fill && parent.fill !== 'none'
        ? parent.fill
        : '#141218';

    const effectiveFg = element.textColor || (element.type === 'text' ? element.fill : '#FFFFFF');

    const contrast = calculateContrastRatio(effectiveFg, effectiveBg);
    const fontSize = element.fontSize || 14;
    const isLarge = fontSize >= 18 || (fontSize >= 14 && Number(element.fontWeight || 400) >= 600);
    const passes = isLarge ? contrast.largeTextAA : contrast.normalTextAA;

    if (!passes) {
      const optimal = getOptimalContrastColor(effectiveBg);
      issues.push({
        id: `contrast-${element.id}`,
        elementId: element.id,
        elementName: element.name,
        category: 'contrast',
        severity: contrast.ratio < 3.0 ? 'error' : 'warning',
        title: `Low Contrast Ratio (${contrast.ratio}:1)`,
        description: `Text color ${effectiveFg} against ${effectiveBg} fails WCAG 2.1 AA standards (minimum ${
          isLarge ? '3.0:1' : '4.5:1'
        } required).`,
        recommendation: `Update text color to high-contrast ${optimal} to achieve ${calculateContrastRatio(optimal, effectiveBg).ratio}:1 AAA rating.`,
        autoFixAvailable: true,
        autoFixLabel: `Set text to ${optimal}`,
        fixPayload: { textColor: optimal, ...(element.type === 'text' ? { fill: optimal } : {}) },
      });
    }
  }

  // 2. Touch Target & Sizing Check (WCAG 2.5.5 / 2.5.8 & Material 3 ergonomics)
  const isInteractive =
    element.type === 'button' ||
    element.type === 'input' ||
    element.type === 'icon' ||
    element.variant?.includes('btn') ||
    element.variant?.includes('switch') ||
    element.variant?.includes('action');

  if (isInteractive && !isArtboard) {
    const isUnder48 = element.width < 48 || element.height < 48;
    const isUnder44 = element.width < 44 || element.height < 44;

    if (isUnder44 || isUnder48) {
      const targetW = Math.max(element.width, 48);
      const targetH = Math.max(element.height, 48);
      issues.push({
        id: `touch-${element.id}`,
        elementId: element.id,
        elementName: element.name,
        category: 'touch-target',
        severity: isUnder44 ? 'error' : 'warning',
        title: `Touch Target Size Under Ergonomic Standard (${Math.round(element.width)}×${Math.round(element.height)}px)`,
        description: `Interactive elements must have a touch target of at least 48×48px (M3) or 44×44px (WCAG 2.5.5) for touch usability.`,
        recommendation: `Expand dimensions to at least 48×48px to prevent miss-taps.`,
        autoFixAvailable: true,
        autoFixLabel: 'Resize to 48×48px minimum',
        fixPayload: { width: targetW, height: targetH },
      });
    }
  }

  // 3. Design Token Conformance Check
  if (!isArtboard && element.fill && element.fill !== 'none' && !element.fill.startsWith('rgba')) {
    const hex = element.fill.toUpperCase();
    const isTokenized = Boolean(KNOWN_DESIGN_TOKENS[hex]);

    if (!isTokenized) {
      // Find closest token suggestion
      const suggestedToken = '#D0BCFF';
      issues.push({
        id: `token-${element.id}`,
        elementId: element.id,
        elementName: element.name,
        category: 'tokens',
        severity: 'info',
        title: `Unlinked Color Hex (${element.fill})`,
        description: `This element uses hardcoded color ${element.fill} instead of a registered design token.`,
        recommendation: `Link to Material 3 / iOS design tokens for consistency and effortless theme switching.`,
        autoFixAvailable: true,
        autoFixLabel: 'Link to M3 Primary Container',
        fixPayload: { fill: suggestedToken, materialPreset: 'm3' },
      });
    }
  }

  // 4. Sub-pixel / Alignment Precision Check (8-point grid)
  if (!isArtboard) {
    const hasFractionalPos = element.x % 1 !== 0 || element.y % 1 !== 0;
    const hasFractionalDim = element.width % 1 !== 0 || element.height % 1 !== 0;
    const isOff8ptGrid = element.x % 4 !== 0 || element.y % 4 !== 0;

    if (hasFractionalPos || hasFractionalDim || isOff8ptGrid) {
      const snappedX = Math.round(element.x / 4) * 4;
      const snappedY = Math.round(element.y / 4) * 4;
      const snappedW = Math.max(4, Math.round(element.width / 4) * 4);
      const snappedH = Math.max(4, Math.round(element.height / 4) * 4);

      if (hasFractionalPos || hasFractionalDim) {
        issues.push({
          id: `layout-fractional-${element.id}`,
          elementId: element.id,
          elementName: element.name,
          category: 'layout',
          severity: 'warning',
          title: `Fractional Sub-pixel Geometry`,
          description: `Element has non-integer coordinates or size (${element.x.toFixed(1)}, ${element.y.toFixed(1)}, ${element.width.toFixed(1)}×${element.height.toFixed(1)}px), causing pixel blurriness on non-retina displays.`,
          recommendation: `Snap position and dimensions to integer pixels on the 4px/8px grid.`,
          autoFixAvailable: true,
          autoFixLabel: 'Snap to 4px Grid',
          fixPayload: { x: snappedX, y: snappedY, width: snappedW, height: snappedH },
        });
      }
    }

    // 5. Bounds Check: elements spilling out of artboard
    if (
      element.x < -20 ||
      element.y < -20 ||
      element.x + element.width > artboardSize.width + 40 ||
      element.y + element.height > artboardSize.height + 40
    ) {
      issues.push({
        id: `bounds-${element.id}`,
        elementId: element.id,
        elementName: element.name,
        category: 'layout',
        severity: 'info',
        title: `Element Outside Artboard Bounds`,
        description: `Coordinates extend beyond the visible canvas boundary (${artboardSize.width}×${artboardSize.height}px).`,
        recommendation: `Reposition element inside artboard frame or adjust clipping.`,
        autoFixAvailable: true,
        autoFixLabel: 'Re-center on Artboard',
        fixPayload: {
          x: Math.max(16, Math.min(element.x, artboardSize.width - element.width - 16)),
          y: Math.max(16, Math.min(element.y, artboardSize.height - element.height - 16)),
        },
      });
    }
  }

  return issues;
}

/**
 * Runs a project-wide design system audit across all elements.
 */
export function runProjectAudit(
  elements: Record<string, CanvasElement>,
  artboardSize: { width: number; height: number } = { width: 1440, height: 900 }
): DesignSystemAuditReport {
  const allElementsList = Object.values(elements);
  const issues: AnalysisIssue[] = [];

  let tokenizedCount = 0;
  let rawHexCount = 0;
  let textElementsCount = 0;
  let passedContrastCount = 0;
  let failedContrastCount = 0;
  let interactiveCount = 0;
  let touchCompliantCount = 0;

  for (const el of allElementsList) {
    if (!el || el.visible === false) continue;

    const elIssues = auditElement(el, elements, artboardSize);
    issues.push(...elIssues);

    // Track tokens
    if (el.fill && el.fill !== 'none') {
      if (KNOWN_DESIGN_TOKENS[el.fill.toUpperCase()]) {
        tokenizedCount++;
      } else {
        rawHexCount++;
      }
    }

    // Track text contrast
    if (el.type === 'text' || el.type === 'button' || el.textContent) {
      textElementsCount++;
      const hasContrastIssue = elIssues.some((i) => i.category === 'contrast');
      if (hasContrastIssue) {
        failedContrastCount++;
      } else {
        passedContrastCount++;
      }
    }

    // Track touch targets
    const isInteractive =
      el.type === 'button' ||
      el.type === 'input' ||
      el.type === 'icon' ||
      el.variant?.includes('btn');

    if (isInteractive) {
      interactiveCount++;
      const hasTouchIssue = elIssues.some((i) => i.category === 'touch-target');
      if (!hasTouchIssue) {
        touchCompliantCount++;
      }
    }
  }

  // Calculate Sub-Scores (0-100)
  const contrastScore =
    textElementsCount > 0
      ? Math.round((passedContrastCount / textElementsCount) * 100)
      : 100;

  const totalColors = tokenizedCount + rawHexCount;
  const tokenCoveragePercent =
    totalColors > 0 ? Math.round((tokenizedCount / totalColors) * 100) : 100;
  const tokenScore = tokenCoveragePercent;

  const touchTargetScore =
    interactiveCount > 0
      ? Math.round((touchCompliantCount / interactiveCount) * 100)
      : 100;

  const layoutIssuesCount = issues.filter((i) => i.category === 'layout').length;
  const layoutScore = Math.max(0, 100 - layoutIssuesCount * 5);

  // Overall Weighted Score: 35% Contrast, 25% Tokens, 20% Touch Targets, 20% Layout
  const overallScore = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        contrastScore * 0.35 +
          tokenScore * 0.25 +
          touchTargetScore * 0.2 +
          layoutScore * 0.2
      )
    )
  );

  let grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
  if (overallScore >= 97) grade = 'A+';
  else if (overallScore >= 90) grade = 'A';
  else if (overallScore >= 80) grade = 'B';
  else if (overallScore >= 70) grade = 'C';
  else if (overallScore >= 60) grade = 'D';

  const errorsCount = issues.filter((i) => i.severity === 'error').length;
  const warningsCount = issues.filter((i) => i.severity === 'warning').length;

  return {
    overallScore,
    grade,
    summary: {
      totalElements: allElementsList.length,
      totalIssues: issues.length,
      errorsCount,
      warningsCount,
      contrastScore,
      tokenScore,
      touchTargetScore,
      layoutScore,
    },
    issues,
    tokenStats: {
      tokenizedCount,
      rawHexCount,
      tokenCoveragePercent,
    },
    accessibilityStats: {
      passedContrastCount,
      failedContrastCount,
      compliancePercent: contrastScore,
    },
  };
}

/**
 * Generates formatted Markdown report string for download.
 */
export function generateMarkdownAuditReport(
  projectTitle: string,
  report: DesignSystemAuditReport
): string {
  const timestamp = new Date().toISOString();
  return `# Design System Health & Accessibility Audit Report
**Project:** ${projectTitle}  
**Date:** ${timestamp}  
**Overall Score:** ${report.overallScore}/100 (${report.grade})  

---

## 📊 Executive Scorecard
| Metric | Score | Status |
| :--- | :--- | :--- |
| **Overall Health** | **${report.overallScore}/100** | Grade ${report.grade} |
| **WCAG 2.1 Contrast** | ${report.summary.contrastScore}% | ${report.summary.contrastScore >= 90 ? '🟢 Pass' : '🔴 Action Required'} |
| **Design Token Coverage** | ${report.tokenStats.tokenCoveragePercent}% | ${report.tokenStats.tokenCoveragePercent >= 80 ? '🟢 Consistent' : '🟡 Unlinked Tokens'} |
| **Touch Target Ergonomics** | ${report.summary.touchTargetScore}% | ${report.summary.touchTargetScore >= 90 ? '🟢 Ergonomic' : '🟡 Review Sizing'} |
| **Layout & Grid Precision** | ${report.summary.layoutScore}% | ${report.summary.layoutScore >= 90 ? '🟢 Precise' : '🟡 Sub-pixel drift'} |

---

## 🔍 Issues Found (${report.issues.length} Total)
${report.issues.length === 0 ? '_No issues detected! Your design system is in peak health._' : ''}
${report.issues
  .map(
    (issue, i) => `### ${i + 1}. [${issue.severity.toUpperCase()}] ${issue.title}
- **Component:** ${issue.elementName} (\`${issue.elementId}\`)
- **Category:** ${issue.category}
- **Description:** ${issue.description}
- **Remediation:** ${issue.recommendation}
`
  )
  .join('\n')}

---
_Generated automatically by ZLab Design Studio Audit Engine._
`;
}
