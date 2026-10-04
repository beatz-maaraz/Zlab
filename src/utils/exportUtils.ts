import { CanvasElement } from '../types';
import { toPng, toSvg, toJpeg } from 'html-to-image';

/**
 * Escapes HTML characters for safe embedding
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generates and downloads a complete, self-contained interactive prototype HTML file.
 * The file can be opened offline in any web browser to simulate the design.
 */
export async function downloadInteractivePrototypeHtml(
  projectTitle: string,
  elements: Record<string, CanvasElement>,
  defaultDevice: 'desktop' | 'mobile' = 'desktop'
) {
  const safeTitle = escapeHtml(projectTitle || 'ZLab Prototype');

  const desktopTarget = elements['desktop-1440'];
  const mobileTarget = elements['mobile-app-view'];
  
  // Grab the actual DOM elements from the canvas for exact state matching
  const desktopElement = document.getElementById('desktop-1440');
  const mobileElement = document.getElementById('mobile-app-view');

  const getCleanHtml = (el: HTMLElement | null) => {
    if (!el) return '';
    const clone = el.cloneNode(true) as HTMLElement;
    
    // Remove editor-specific overlays and handles to prevent them from appearing in exports
    clone.querySelectorAll('.pointer-events-none.border-2, .ring-2, [class*="bg-[#0d99ff]"]').forEach(node => {
        // Only remove UI overlay items like dimension pills, handles or bounding boxes, not valid elements like actual buttons
        if (
            node.classList.contains('absolute') && 
            (node.classList.contains('cursor-grab') || node.classList.contains('z-50') || node.classList.contains('whitespace-nowrap'))
        ) {
            node.remove();
        }
    });

    return clone.innerHTML;
  };

  const desktopHtml = getCleanHtml(desktopElement);
  const mobileHtml = getCleanHtml(mobileElement);

  // Capture all current styles from the document to ensure Tailwind classes and custom styles work
  const documentStyles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map(el => el.outerHTML)
    .join('\n');

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle} - Interactive Prototype</title>
  <!-- Fallback Tailwind CSS for local viewing -->
  <script src="https://cdn.tailwindcss.com"></script>
  ${documentStyles}
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #0f0f11;
      color: #e5e2e1;
      font-family: -apple-system, sans-serif;
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
      user-select: none;
    }
    header {
      height: 52px;
      background: #18181b;
      border-bottom: 1px solid #27272a;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      z-index: 50;
      flex-shrink: 0;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 600;
      font-size: 14px;
      color: #fafafa;
    }
    .brand .logo-badge {
      width: 24px;
      height: 24px;
      background: #0d99ff;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 12px;
    }
    .pill-switcher {
      display: flex;
      background: #27272a;
      padding: 3px;
      border-radius: 8px;
      gap: 2px;
    }
    .pill-btn {
      background: transparent;
      border: none;
      color: #a1a1aa;
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.15s ease;
    }
    .pill-btn.active {
      background: #3f3f46;
      color: #ffffff;
      box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    }
    .pill-btn:hover:not(.active) {
      color: #e4e4e7;
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .btn-action {
      background: #27272a;
      border: 1px solid #3f3f46;
      color: #d4d4d8;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
    }
    .btn-action:hover {
      background: #3f3f46;
      color: #ffffff;
    }
    main {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      background: radial-gradient(circle, #27272a 1px, transparent 1px);
      background-size: 24px 24px;
      overflow: auto;
      padding: 30px;
    }
    /* Desktop Frame */
    .desktop-frame {
      width: ${desktopTarget?.width || 960}px;
      height: ${desktopTarget?.height || 640}px;
      background: ${desktopTarget?.fill || '#131313'};
      border-radius: ${desktopTarget?.borderRadius || 8}px;
      box-shadow: 0 25px 60px -15px rgba(0,0,0,0.7), 0 0 0 1px #27272a;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: relative;
    }
    .browser-bar {
      height: 38px;
      background: #202023;
      border-bottom: 1px solid #27272a;
      display: flex;
      align-items: center;
      padding: 0 14px;
      gap: 12px;
      z-index: 1000;
    }
    .browser-dots {
      display: flex;
      gap: 6px;
    }
    .dot { width: 10px; height: 10px; border-radius: 50%; }
    .dot.red { background: #ef4444; }
    .dot.yellow { background: #eab308; }
    .dot.green { background: #22c55e; }
    .address-bar {
      flex: 1;
      max-width: 480px;
      height: 24px;
      background: #141416;
      border-radius: 6px;
      border: 1px solid #2d2d31;
      display: flex;
      align-items: center;
      padding: 0 10px;
      font-size: 11px;
      color: #a1a1aa;
      font-family: monospace;
    }
    .screen-content {
      flex: 1;
      position: relative;
      overflow: hidden;
    }
    /* Mobile Frame */
    .mobile-frame {
      width: ${mobileTarget?.width || 390}px;
      height: ${mobileTarget?.height || 844}px;
      background: ${mobileTarget?.fill || '#131313'};
      border-radius: ${mobileTarget?.borderRadius || 44}px;
      box-shadow: 0 25px 60px -15px rgba(0,0,0,0.8), 0 0 0 4px #27272a;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: relative;
    }
    .mobile-content {
      flex: 1;
      position: relative;
      overflow: hidden;
    }
    /* Toast notice */
    #prototype-toast {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      background: #0d99ff;
      color: #002544;
      font-weight: 600;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 13px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 2000;
    }
    #prototype-toast.show {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
    /* Preserving tailwind classes explicitly embedded by actual DOM elements if any, fallback handles standard style rendering */
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <div class="logo-badge">Z</div>
      <span>${safeTitle}</span>
      <span style="font-size: 11px; background: #27272a; color: #a1a1aa; padding: 2px 6px; border-radius: 4px;">ZLab Prototype</span>
    </div>

    <div class="pill-switcher">
      <button id="btn-show-desktop" class="pill-btn ${defaultDevice === 'desktop' ? 'active' : ''}" onclick="switchView('desktop')">Desktop View</button>
      <button id="btn-show-mobile" class="pill-btn ${defaultDevice === 'mobile' ? 'active' : ''}" onclick="switchView('mobile')">Mobile View</button>
    </div>

    <div class="header-actions">
      <button class="btn-action" onclick="restartPrototype()">↺ Restart</button>
    </div>
  </header>

  <main id="prototype-stage">
    <!-- Desktop View -->
    <div id="desktop-view" class="desktop-frame" style="display: ${defaultDevice === 'desktop' ? 'flex' : 'none'};">
      <div class="browser-bar">
        <div class="browser-dots">
          <div class="dot red"></div>
          <div class="dot yellow"></div>
          <div class="dot green"></div>
        </div>
        <div class="address-bar">https://app.zlab.io/preview</div>
      </div>
      <div class="screen-content">
        ${desktopHtml}
      </div>
    </div>

    <!-- Mobile View -->
    <div id="mobile-view" class="mobile-frame" style="display: ${defaultDevice === 'mobile' ? 'flex' : 'none'};">
      <div class="mobile-content">
        ${mobileHtml}
      </div>
    </div>
  </main>

  <div id="prototype-toast">Interaction Triggered!</div>

  <script>
    let currentView = '${defaultDevice}';

    function switchView(view) {
      currentView = view;
      document.getElementById('desktop-view').style.display = view === 'desktop' ? 'flex' : 'none';
      document.getElementById('mobile-view').style.display = view === 'mobile' ? 'flex' : 'none';
      document.getElementById('btn-show-desktop').classList.toggle('active', view === 'desktop');
      document.getElementById('btn-show-mobile').classList.toggle('active', view === 'mobile');
      showToast('Switched to ' + (view === 'desktop' ? 'Desktop 1440' : 'Mobile iOS') + ' view');
    }

    function showToast(text) {
      const toast = document.getElementById('prototype-toast');
      toast.textContent = text;
      toast.classList.add('show');
      clearTimeout(window.__toastTimer);
      window.__toastTimer = setTimeout(() => {
        toast.classList.remove('show');
      }, 2200);
    }

    function restartPrototype() {
      switchView('${defaultDevice}');
      showToast('Prototype restarted from initial frame');
    }
  </script>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const fileName = `${projectTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-prototype.html`;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates and downloads a scalable SVG using DOM-to-image conversion to accurately reflect current state.
 */
export async function downloadSvg(
  projectTitle: string,
  elements: Record<string, CanvasElement>,
  selectedElementId?: string,
  options?: {
    transparentBackground?: boolean;
    includeIds?: boolean;
    editableText?: boolean;
  }
) {
  const targetId = selectedElementId || 'desktop-1440';
  const targetElementId = targetId === 'desktop-1440' || targetId === 'mobile-app-view' 
    ? targetId 
    : `canvas-el-${targetId}`;
    
  const targetElement = document.getElementById(targetElementId);
  
  if (!targetElement) {
    console.error(`Export failed: DOM node for element ${targetId} not found.`);
    return;
  }

  try {
    const filterUiOverlays = (node: HTMLElement) => {
        if (!node.classList) return true;
        
        // Exclude editor selection bounds and resize handles
        if (node.classList.contains('pointer-events-none') && node.classList.contains('border-2')) return false;
        if (node.classList.contains('ring-2')) return false;
        
        // Exclude dimension pills and rotation handles (which use absolute + z-50 + specific background)
        if (
            node.classList.contains('absolute') && 
            (node.classList.contains('cursor-grab') || node.classList.contains('z-50') || node.classList.contains('whitespace-nowrap')) &&
            node.className.includes('bg-[#0d99ff]')
        ) {
            return false;
        }
        
        return true;
    };

    const dataUrl = await toSvg(targetElement, {
      backgroundColor: options?.transparentBackground ? 'transparent' : undefined,
      skipFonts: false,
      filter: filterUiOverlays,
      style: {
        transform: 'none',
        transformOrigin: 'top left',
        margin: '0'
      }
    });

    const targetSlug = (elements[targetId]?.name || 'artwork').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const fileName = `${projectTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${targetSlug}.svg`;
    
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(dataUrl);
  } catch (error) {
    console.error('Error exporting SVG:', error);
  }
}

/**
 * Generates and downloads a raster PNG image using offscreen HTML5 canvas to accurately reflect current state.
 */
export async function downloadPng(
  projectTitle: string,
  elements: Record<string, CanvasElement>,
  selectedElementId?: string,
  scale: number = 2,
  options?: {
    transparentBackground?: boolean;
  }
) {
  const targetId = selectedElementId || 'desktop-1440';
  const targetElementId = targetId === 'desktop-1440' || targetId === 'mobile-app-view' 
    ? targetId 
    : `canvas-el-${targetId}`;
    
  const targetElement = document.getElementById(targetElementId);
  
  if (!targetElement) {
    console.error(`Export failed: DOM node for element ${targetId} not found.`);
    return;
  }

  try {
    // Wait for fonts to be ready
    if (typeof document !== 'undefined' && 'fonts' in document) {
      await (document as any).fonts.ready;
    }

    const filterUiOverlays = (node: HTMLElement) => {
      if (!node.classList) return true;
      
      // Exclude editor selection bounds and resize handles
      if (node.classList.contains('pointer-events-none') && node.classList.contains('border-2')) return false;
      if (node.classList.contains('ring-2')) return false;
      
      // Exclude dimension pills and rotation handles
      if (
          node.classList.contains('absolute') && 
          (node.classList.contains('cursor-grab') || node.classList.contains('z-50') || node.classList.contains('whitespace-nowrap')) &&
          node.className.includes('bg-[#0d99ff]')
      ) {
          return false;
      }
      
      return true;
    };

    // Some browsers have a bug rendering fonts in html-to-image without fetching them properly.
    const dataUrl = await toPng(targetElement, {
      pixelRatio: scale,
      backgroundColor: options?.transparentBackground ? 'transparent' : undefined,
      skipFonts: false,
      filter: filterUiOverlays,
      style: {
        transform: 'none',
        transformOrigin: 'top left',
        margin: '0'
      }
    });

    const targetSlug = (elements[targetId]?.name || 'artwork').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const fileName = `${projectTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${targetSlug}@${scale}x.png`;
    
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(dataUrl);
  } catch (error) {
    console.error('Error exporting PNG:', error);
  }
}

/**
 * Generates and downloads a compressed JPG image using html-to-image to accurately reflect current state.
 */
export async function downloadJpeg(
  projectTitle: string,
  elements: Record<string, CanvasElement>,
  selectedElementId?: string,
  scale: number = 2,
  options?: {
    quality?: number;
    backgroundColor?: string;
  }
) {
  const targetId = selectedElementId || 'desktop-1440';
  const targetElementId = targetId === 'desktop-1440' || targetId === 'mobile-app-view' 
    ? targetId 
    : `canvas-el-${targetId}`;
    
  const targetElement = document.getElementById(targetElementId);
  
  if (!targetElement) {
    console.error(`Export failed: DOM node for element ${targetId} not found.`);
    return;
  }

  try {
    // Wait for fonts to be ready
    if (typeof document !== 'undefined' && 'fonts' in document) {
      await (document as any).fonts.ready;
    }

    const filterUiOverlays = (node: HTMLElement) => {
      if (!node.classList) return true;
      if (node.classList.contains('pointer-events-none') && node.classList.contains('border-2')) return false;
      if (node.classList.contains('ring-2')) return false;
      if (
        node.classList.contains('absolute') && 
        (node.classList.contains('cursor-grab') || node.classList.contains('z-50') || node.classList.contains('whitespace-nowrap')) &&
        node.className.includes('bg-[#0d99ff]')
      ) {
        return false;
      }
      return true;
    };

    const targetElementFill = elements[targetId]?.fill || '#131313';
    const bgColor = options?.backgroundColor || targetElementFill || '#131313';
    const quality = options?.quality !== undefined ? options.quality : 0.92;

    const dataUrl = await toJpeg(targetElement, {
      quality,
      pixelRatio: scale,
      backgroundColor: bgColor,
      skipFonts: false,
      filter: filterUiOverlays,
      style: {
        transform: 'none',
        transformOrigin: 'top left',
        margin: '0'
      }
    });

    const targetSlug = (elements[targetId]?.name || 'artwork').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const qualityPct = Math.round(quality * 100);
    const fileName = `${projectTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${targetSlug}@${scale}x-q${qualityPct}.jpg`;
    
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(dataUrl);
  } catch (error) {
    console.error('Error exporting JPEG:', error);
  }
}

export interface ExportPreviewData {
  dataUrl: string;
  byteSize: number;
  width: number;
  height: number;
  svgText?: string;
  format: 'png' | 'svg' | 'jpg';
  scale: number;
  quality?: number;
}

export async function generateExportPreview(
  targetId: string,
  format: 'png' | 'svg' | 'jpg',
  scale: number,
  options?: {
    quality?: number;
    transparentBackground?: boolean;
    backgroundColor?: string;
  }
): Promise<ExportPreviewData | null> {
  const targetElementId = targetId === 'desktop-1440' || targetId === 'mobile-app-view' 
    ? targetId 
    : `canvas-el-${targetId}`;
    
  const targetElement = document.getElementById(targetElementId);
  if (!targetElement) return null;

  const filterUiOverlays = (node: HTMLElement) => {
    if (!node.classList) return true;
    if (node.classList.contains('pointer-events-none') && node.classList.contains('border-2')) return false;
    if (node.classList.contains('ring-2')) return false;
    if (
      node.classList.contains('absolute') && 
      (node.classList.contains('cursor-grab') || node.classList.contains('z-50') || node.classList.contains('whitespace-nowrap')) &&
      node.className.includes('bg-[#0d99ff]')
    ) {
      return false;
    }
    return true;
  };

  const rect = targetElement.getBoundingClientRect();
  const width = Math.round((targetElement.offsetWidth || rect.width) * scale);
  const height = Math.round((targetElement.offsetHeight || rect.height) * scale);

  try {
    // Wait for fonts to be ready
    if (typeof document !== 'undefined' && 'fonts' in document) {
      await (document as any).fonts.ready;
    }

    let dataUrl = '';
    let svgText: string | undefined = undefined;

    if (format === 'svg') {
      dataUrl = await toSvg(targetElement, {
        backgroundColor: options?.transparentBackground ? 'transparent' : undefined,
        skipFonts: false,
        filter: filterUiOverlays,
        style: {
          transform: 'none',
          transformOrigin: 'top left',
          margin: '0'
        }
      });

      if (dataUrl.startsWith('data:image/svg+xml;charset=utf-8,')) {
        svgText = decodeURIComponent(dataUrl.replace('data:image/svg+xml;charset=utf-8,', ''));
      } else if (dataUrl.startsWith('data:image/svg+xml;base64,')) {
        try {
          svgText = atob(dataUrl.replace('data:image/svg+xml;base64,', ''));
        } catch {
          // ignore decode error
        }
      }
    } else if (format === 'jpg') {
      const quality = options?.quality !== undefined ? options.quality : 0.9;
      dataUrl = await toJpeg(targetElement, {
        quality,
        pixelRatio: scale,
        backgroundColor: options?.backgroundColor || '#131313',
        skipFonts: false,
        filter: filterUiOverlays,
        style: {
          transform: 'none',
          transformOrigin: 'top left',
          margin: '0'
        }
      });
    } else {
      dataUrl = await toPng(targetElement, {
        pixelRatio: scale,
        backgroundColor: options?.transparentBackground ? 'transparent' : undefined,
        skipFonts: false,
        filter: filterUiOverlays,
        style: {
          transform: 'none',
          transformOrigin: 'top left',
          margin: '0'
        }
      });
    }

    let byteSize = 0;
    if (svgText) {
      byteSize = new Blob([svgText]).size;
    } else if (dataUrl.includes('base64,')) {
      const base64Str = dataUrl.split('base64,')[1] || '';
      const padding = (base64Str.match(/=/g) || []).length;
      byteSize = Math.max(0, Math.floor((base64Str.length * 3) / 4) - padding);
    } else {
      byteSize = dataUrl.length;
    }

    return {
      dataUrl,
      byteSize,
      width,
      height,
      svgText,
      format,
      scale,
      quality: options?.quality
    };
  } catch (err) {
    console.error('generateExportPreview error:', err);
    return null;
  }
}

/**
 * Downloads ZLab project schema JSON
 */
export function downloadJson(
  projectTitle: string,
  elements: Record<string, CanvasElement>
) {
  const exportData = {
    project: projectTitle,
    schemaVersion: '2.5',
    exportedAt: new Date().toISOString(),
    elements,
  };
  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${projectTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates and downloads a React/Tailwind component representing the selected design.
 */
export function downloadReactCode(
  projectTitle: string,
  elements: Record<string, CanvasElement>,
  targetElementId?: string
) {
  const targetId = targetElementId || 'desktop-1440';
  const target = elements[targetId] || elements['desktop-1440'];
  if (!target) return;
  
  const targetX = target.x;
  const targetY = target.y;

  function buildTsxNodes(nodeId: string, indentLevel: number = 3): string {
    const el = elements[nodeId];
    if (!el || el.visible === false) return '';
    
    const indent = '  '.repeat(indentLevel);
    const isRoot = nodeId === targetId;

    const x = isRoot ? 0 : el.x - targetX;
    const y = isRoot ? 0 : el.y - targetY;
    
    let styleStr = `position: '${isRoot ? 'relative' : 'absolute'}', `;
    styleStr += `left: ${isRoot ? 0 : x}, top: ${isRoot ? 0 : y}, `;
    styleStr += `width: ${el.width}, height: ${el.height}, `;
    
    if (el.fill && el.type !== 'text') {
      styleStr += `backgroundColor: '${el.fill}', `;
    }
    if (el.fillOpacity !== undefined && el.fillOpacity !== 100) {
      styleStr += `opacity: ${el.fillOpacity / 100}, `;
    }
    if (el.borderRadius) {
      styleStr += `borderRadius: ${el.borderRadius}, `;
    }
    if (el.stroke && el.stroke !== 'none') {
      styleStr += `border: '${el.strokeWidth || 1}px solid ${el.stroke}', `;
    }
    if (el.shadowBlur) {
      styleStr += `boxShadow: '0px ${el.shadowY || 0}px ${el.shadowBlur}px rgba(0,0,0,0.4)', `;
    }
    if (el.backdropBlur) {
      styleStr += `backdropFilter: 'blur(${el.backdropBlur}px)', WebkitBackdropFilter: 'blur(${el.backdropBlur}px)', `;
    }
    if (el.type === 'text' || el.textContent) {
      styleStr += `color: '${el.textColor || (el.type === 'text' ? el.fill : '#fff')}', `;
      styleStr += `fontSize: ${el.fontSize || 14}, `;
      styleStr += `display: 'flex', `;
      styleStr += `alignItems: '${el.textAlign === 'center' ? 'center' : 'flex-start'}', `;
      styleStr += `justifyContent: '${el.textAlign === 'center' ? 'center' : (el.textAlign === 'right' ? 'flex-end' : 'flex-start')}', `;
      styleStr += `padding: 12, boxSizing: 'border-box', `;
    }

    const childrenNodes = Object.values(elements)
      .filter((child) => child.parentId === nodeId && child.visible !== false)
      .map((child) => buildTsxNodes(child.id, indentLevel + 1))
      .join('\\n');

    let content = '';
    if (el.textContent) {
      content = `\\n${indent}  {${JSON.stringify(el.textContent)}}\\n`;
    }
    if (childrenNodes) {
      content += (content ? '' : '\\n') + childrenNodes + `\\n${indent}`;
    }

    const tag = el.type === 'button' ? 'button' : 'div';
    
    if (!content) {
      return `${indent}<${tag} style={{ ${styleStr} }} />`;
    }

    return `${indent}<${tag} style={{ ${styleStr} }}>${content}</${tag}>`;
  }

  const tsxContent = buildTsxNodes(targetId, 2);
  const componentName = (target.name || 'ZLabComponent')
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');

  const code = `import React from 'react';

/**
 * Generated by ZLab Export
 * Component: ${componentName}
 */
export const ${componentName}: React.FC = () => {
  return (
${tsxContent}
  );
};

export default ${componentName};
`;

  const blob = new Blob([code], { type: 'text/typescript;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const targetSlug = (target.name || 'component').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  link.download = `${projectTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${targetSlug}.tsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates and downloads raw HTML/CSS representing the selected design.
 */
export function downloadHtmlCode(
  projectTitle: string,
  elements: Record<string, CanvasElement>,
  targetElementId?: string
) {
  const targetId = targetElementId || 'desktop-1440';
  const target = elements[targetId] || elements['desktop-1440'];
  if (!target) return;
  
  const domId = targetId === 'desktop-1440' || targetId === 'mobile-app-view' 
    ? targetId 
    : `canvas-el-${targetId}`;

  const domElement = document.getElementById(domId);
  if (!domElement) {
    console.error(`Export failed: DOM node for element ${targetId} not found.`);
    return;
  }

  // Clone to avoid mutating the live DOM
  const clone = domElement.cloneNode(true) as HTMLElement;
  
  // Clean up selection rings or UI overlays if present
  const uiOverlays = clone.querySelectorAll('.pointer-events-none.border-2, .ring-2, [class*="bg-[#0d99ff]"]');
  uiOverlays.forEach(node => {
        if (
            node.classList.contains('absolute') && 
            (node.classList.contains('cursor-grab') || node.classList.contains('z-50') || node.classList.contains('whitespace-nowrap'))
        ) {
            node.remove();
        }
  });

  // Force the root element to be relatively positioned so it renders correctly inline
  clone.style.position = 'relative';
  clone.style.left = '0';
  clone.style.top = '0';
  clone.style.transform = 'none';

  const htmlContent = clone.outerHTML;

  // Capture all current styles from the document to ensure Tailwind classes and custom styles work
  const documentStyles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map(el => el.outerHTML)
    .join('\n');

  const componentName = (target.name || 'ZLabComponent')
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');

  const code = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectTitle} - ${componentName}</title>
  <!-- Fallback Tailwind CSS for local viewing -->
  <script src="https://cdn.tailwindcss.com"></script>
  ${documentStyles}
  <style>
    /* Reset baseline */
    body {
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      font-family: -apple-system, sans-serif;
    }
  </style>
</head>
<body>
${htmlContent}
</body>
</html>
`;

  const blob = new Blob([code], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const targetSlug = (target.name || 'component').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  link.download = `${projectTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${targetSlug}-code.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
