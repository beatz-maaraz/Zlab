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
 * Generates clean HTML markup for all elements on a specific artboard.
 * Used when an artboard is not currently mounted in the live DOM (e.g. desktop vs mobile mode).
 */
export function renderArtboardElementsToHtml(
  artboardId: string,
  elements: Record<string, CanvasElement>,
  isMobile: boolean
): string {
  const allEls = Object.values(elements) as CanvasElement[];

  // Find elements belonging to this artboard
  let children = allEls.filter((el) => {
    if (el.visible === false) return false;
    if (el.id === 'desktop-1440' || el.id === 'mobile-app-view' || el.id === 'default-artboard-frame' || el.id === 'hero-bg') {
      return false;
    }
    if (el.parentId && elements[el.parentId]?.type === 'group') {
      return false; // Rendered by parent group container
    }
    if (el.parentId === artboardId) return true;
    if (!el.parentId) {
      if (!isMobile && !allEls.some((e) => e.parentId === 'mobile-app-view')) return true;
      if (isMobile && !allEls.some((e) => e.parentId === 'desktop-1440')) return true;
    }
    return false;
  });

  if (children.length === 0) {
    children = allEls.filter((el) => {
      if (el.visible === false) return false;
      if (el.id === 'desktop-1440' || el.id === 'mobile-app-view' || el.id === 'default-artboard-frame' || el.id === 'hero-bg') {
        return false;
      }
      if (el.parentId && elements[el.parentId]?.type === 'group') return false;
      return true;
    });
  }

  const renderSingleElement = (el: CanvasElement): string => {
    const isInteractive = Boolean(
      el.prototype?.action ||
      el.prototype?.destinationId ||
      el.type === 'button' ||
      el.variant?.includes('button') ||
      el.variant?.includes('switch') ||
      el.variant?.includes('tabs')
    );
    const protoTrigger = el.prototype?.trigger || (el.type === 'button' ? 'tap' : 'click');
    const protoAction = el.prototype?.action || (el.type === 'button' ? 'navigate' : '');
    const protoDest = el.prototype?.destinationId || '';
    const protoAnim = el.prototype?.animation || 'smart_animate';

    let style = `position: absolute; left: ${el.x}px; top: ${el.y}px; width: ${el.width}px; height: ${el.height}px; box-sizing: border-box;`;
    if (el.rotation) style += ` transform: rotate(${el.rotation}deg);`;
    if (el.borderRadius) style += ` border-radius: ${el.borderRadius}px;`;
    if (el.fill && el.type !== 'text') style += ` background-color: ${el.fill};`;
    if (el.fillOpacity !== undefined && el.fillOpacity !== 100) style += ` opacity: ${el.fillOpacity / 100};`;
    if (el.stroke && el.stroke !== 'none') style += ` border: ${el.strokeWidth || 1}px solid ${el.stroke};`;
    if (el.shadowBlur) style += ` box-shadow: 0px ${el.shadowY || 4}px ${el.shadowBlur}px rgba(0,0,0,0.35);`;
    if (el.backdropBlur) style += ` backdrop-filter: blur(${el.backdropBlur}px); -webkit-backdrop-filter: blur(${el.backdropBlur}px);`;
    if (isInteractive) style += ` cursor: pointer;`;

    // Group element rendering
    if (el.type === 'group') {
      const groupChildren = allEls.filter((c) => c.parentId === el.id && c.visible !== false);
      const innerGroupHtml = groupChildren.map(renderSingleElement).join('\n');
      return `<div class="proto-node group-container ${isInteractive ? 'proto-hotspot' : ''}" style="${style}" data-node-id="${el.id}" data-name="${escapeHtml(el.name || '')}" data-proto-trigger="${protoTrigger}" data-proto-action="${protoAction}" data-proto-dest="${protoDest}" data-proto-anim="${protoAnim}">${innerGroupHtml}</div>`;
    }

    let inner = '';
    if (el.type === 'button') {
      style += ` display: flex; align-items: center; justify-content: center; user-select: none; font-weight: ${el.fontWeight || 600}; font-size: ${el.fontSize || 14}px; color: ${el.textColor || '#002f55'}; transition: transform 0.1s, filter 0.1s;`;
      inner = `<span>${escapeHtml(el.textContent || el.name || 'Button')}</span>`;
    } else if (el.type === 'text') {
      style += ` display: flex; align-items: ${el.textAlign === 'center' ? 'center' : 'flex-start'}; justify-content: ${el.textAlign === 'center' ? 'center' : (el.textAlign === 'right' ? 'flex-end' : 'flex-start')}; font-size: ${el.fontSize || 14}px; font-weight: ${el.fontWeight || 400}; color: ${el.textColor || el.fill || '#e5e2e1'}; line-height: 1.4; padding: 4px;`;
      inner = `<span>${escapeHtml(el.textContent || el.name || '')}</span>`;
    } else if (el.variant === 'ios-switch') {
      inner = `<div style="display: flex; align-items: center; justify-content: space-between; width: 100%; height: 100%; padding: 0 12px;"><span style="color: white; font-size: 13px; font-weight: 500;">${escapeHtml(el.textContent || 'iOS Switch')}</span><div style="width: 44px; height: 26px; border-radius: 13px; background: #34c759; padding: 2px; display: flex; align-items: center; justify-content: flex-end;"><div style="width: 22px; height: 22px; border-radius: 50%; background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div></div></div>`;
    } else if (el.variant === 'ios-tabbar' || el.variant?.includes('footer-tabs')) {
      inner = `<div style="display: flex; align-items: center; justify-content: space-around; width: 100%; height: 100%; font-size: 11px; color: #8e8e93;"><div style="display: flex; flex-direction: column; align-items: center; color: #007aff; font-weight: 600;"><span>✦ Today</span></div><span>★ Games</span><span>📦 Apps</span><span>🕹 Arcade</span><span>🔍 Search</span></div>`;
    } else if (el.variant === 'ios-navbar') {
      inner = `<div style="display: flex; flex-direction: column; justify-content: center; width: 100%; height: 100%; padding: 0 16px;"><span style="color: #007aff; font-size: 13px;">‹ Back</span><span style="color: white; font-size: 16px; font-weight: 700; letter-spacing: -0.3px;">${escapeHtml(el.textContent || 'Settings')}</span></div>`;
    } else if (el.variant?.includes('data-grid')) {
      const rows = (el.textContent || 'Material 3 Top App Bar $120\niOS 18 Translucent Footer $340\nAdaptive Data Grid View $590').split('\n');
      inner = `<div style="display: flex; flex-direction: column; width: 100%; height: 100%; padding: 10px; gap: 6px;">` +
        rows.map(r => {
          const parts = r.split('$');
          return `<div style="display: flex; justify-content: space-between; padding: 8px 12px; border-radius: 8px; background: #2c2c2e; font-size: 12px; font-weight: 500; color: #e5e2e1;"><span>${escapeHtml(parts[0]?.trim() || '')}</span><span style="color: #007aff; font-weight: 600;">$${escapeHtml(parts[1]?.trim() || '')}</span></div>`;
        }).join('') + `</div>`;
    } else if (el.variant?.includes('floating-input')) {
      inner = `<div style="display: flex; flex-direction: column; justify-content: center; width: 100%; height: 100%; padding: 0 14px;"><span style="font-size: 10px; font-weight: 600; color: #007aff;">Email Address</span><span style="color: white; font-size: 13px; margin-top: 2px;">${escapeHtml(el.subText || 'alex.creator@zlab.app')}</span></div>`;
    } else {
      if (el.textContent) {
        inner = `<div style="display: flex; align-items: center; justify-content: ${el.textAlign === 'center' ? 'center' : 'flex-start'}; width: 100%; height: 100%; padding: 0 10px; color: ${el.textColor || '#fff'}; font-size: ${el.fontSize || 13}px;"><span>${escapeHtml(el.textContent)}</span></div>`;
      }
    }

    return `<div class="proto-node ${isInteractive ? 'proto-hotspot' : ''}" style="${style}" data-node-id="${el.id}" data-name="${escapeHtml(el.name || '')}" data-proto-trigger="${protoTrigger}" data-proto-action="${protoAction}" data-proto-dest="${protoDest}" data-proto-anim="${protoAnim}">${inner}</div>`;
  };

  return children.map(renderSingleElement).join('\n');
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

  // Try to grab live DOM elements from canvas for exact mounted visual representation
  const desktopElement = document.getElementById('desktop-1440');
  const mobileElement = document.getElementById('mobile-app-view');

  const getCleanHtml = (el: HTMLElement | null) => {
    if (!el) return '';
    const clone = el.cloneNode(true) as HTMLElement;

    // Remove editor-specific overlays and handles to prevent them from appearing in exports
    clone.querySelectorAll('.pointer-events-none.border-2, .ring-2, [class*="bg-[#0d99ff]"], [class*="TransformGizmo"]').forEach(node => {
      if (
        node.classList.contains('absolute') &&
        (node.classList.contains('cursor-grab') || node.classList.contains('z-50') || node.classList.contains('whitespace-nowrap'))
      ) {
        node.remove();
      }
    });

    return clone.innerHTML;
  };

  let desktopHtml = getCleanHtml(desktopElement);
  if (!desktopHtml.trim()) {
    desktopHtml = renderArtboardElementsToHtml('desktop-1440', elements, false);
  }

  let mobileHtml = getCleanHtml(mobileElement);
  if (!mobileHtml.trim()) {
    mobileHtml = renderArtboardElementsToHtml('mobile-app-view', elements, true);
  }

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
  <!-- Fallback Tailwind CSS for offline viewing -->
  <script src="https://cdn.tailwindcss.com"></script>
  ${documentStyles}
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #0b0b0d;
      color: #e5e2e1;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
      user-select: none;
      -webkit-font-smoothing: antialiased;
    }
    header {
      height: 52px;
      background: #151518;
      border-bottom: 1px solid #27272a;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      z-index: 50;
      flex-shrink: 0;
      gap: 12px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 600;
      font-size: 13px;
      color: #fafafa;
    }
    .brand .logo-badge {
      width: 24px;
      height: 24px;
      background: linear-gradient(135deg, #0d99ff, #0056b3);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 12px;
      box-shadow: 0 2px 8px rgba(13,153,255,0.3);
    }
    .center-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .pill-switcher {
      display: flex;
      background: #202024;
      padding: 3px;
      border-radius: 8px;
      border: 1px solid #2d2d32;
      gap: 2px;
    }
    .pill-btn {
      background: transparent;
      border: none;
      color: #a1a1aa;
      padding: 5px 12px;
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .pill-btn.active {
      background: #3f3f46;
      color: #ffffff;
      box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    }
    .pill-btn:hover:not(.active) {
      color: #e4e4e7;
      background: rgba(255,255,255,0.05);
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .btn-action {
      background: #202024;
      border: 1px solid #2d2d32;
      color: #d4d4d8;
      padding: 5px 11px;
      border-radius: 6px;
      font-size: 11px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
      transition: all 0.15s ease;
      font-weight: 500;
    }
    .btn-action:hover {
      background: #2c2c31;
      color: #ffffff;
      border-color: #3f3f46;
    }
    .btn-action.active {
      background: #0d99ff;
      color: #002544;
      border-color: #0d99ff;
      font-weight: 600;
    }
    main {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      background: radial-gradient(circle, #202024 1px, transparent 1px);
      background-size: 20px 20px;
      background-color: #0c0c0e;
      overflow: auto;
      padding: 24px;
    }
    /* Frame stage wrapper with interactive zoom scale */
    #stage-scaler {
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.15s ease-out;
      transform-origin: center center;
    }
    /* Desktop Frame */
    .desktop-frame {
      width: ${desktopTarget?.width || 1440}px;
      height: ${desktopTarget?.height || 900}px;
      background: ${desktopTarget?.fill || '#131313'};
      border-radius: ${desktopTarget?.borderRadius || 8}px;
      box-shadow: 0 30px 80px -15px rgba(0,0,0,0.8), 0 0 0 1px #27272a;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: relative;
    }
    .browser-bar {
      height: 40px;
      background: #1c1c1f;
      border-bottom: 1px solid #27272a;
      display: flex;
      align-items: center;
      padding: 0 16px;
      gap: 12px;
      z-index: 1000;
      flex-shrink: 0;
    }
    .browser-dots {
      display: flex;
      gap: 6px;
    }
    .dot { width: 11px; height: 11px; border-radius: 50%; }
    .dot.red { background: #ef4444; }
    .dot.yellow { background: #eab308; }
    .dot.green { background: #22c55e; }
    .address-bar {
      flex: 1;
      max-width: 520px;
      height: 26px;
      background: #121214;
      border-radius: 6px;
      border: 1px solid #2b2b2f;
      display: flex;
      align-items: center;
      padding: 0 12px;
      font-size: 11px;
      color: #9ca3af;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
      gap: 6px;
    }
    .address-bar svg {
      width: 12px;
      height: 12px;
      color: #6b7280;
    }
    .screen-content {
      flex: 1;
      position: relative;
      overflow: hidden;
    }
    /* Mobile Frame */
    .mobile-frame-wrapper {
      padding: 12px;
      background: #1e1e20;
      border-radius: 52px;
      box-shadow: 0 30px 80px -15px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.08);
      position: relative;
    }
    .mobile-frame {
      width: ${mobileTarget?.width || 390}px;
      height: ${mobileTarget?.height || 844}px;
      background: ${mobileTarget?.fill || '#131313'};
      border-radius: 44px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: relative;
    }
    .mobile-status-bar {
      height: 44px;
      padding: 0 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: white;
      font-size: 12px;
      font-weight: 600;
      z-index: 50;
      flex-shrink: 0;
      pointer-events: none;
    }
    .dynamic-island {
      position: absolute;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      width: 116px;
      height: 26px;
      background: #000;
      border-radius: 20px;
      z-index: 60;
      pointer-events: none;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 12px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.5);
    }
    .dynamic-island .camera {
      width: 9px;
      height: 9px;
      background: #111;
      border-radius: 50%;
      border: 1px solid #222;
    }
    .dynamic-island .sensor {
      width: 8px;
      height: 8px;
      background: #0d99ff;
      opacity: 0.4;
      border-radius: 50%;
    }
    .home-indicator {
      position: absolute;
      bottom: 8px;
      left: 50%;
      transform: translateX(-50%);
      width: 128px;
      height: 4px;
      background: rgba(255,255,255,0.4);
      border-radius: 2px;
      z-index: 60;
      pointer-events: none;
    }
    .mobile-content {
      flex: 1;
      position: relative;
      overflow: hidden;
    }
    /* Hotspot pulse highlight */
    .proto-hotspot {
      position: absolute;
      transition: box-shadow 0.15s ease, transform 0.1s ease;
    }
    .proto-hotspot:hover {
      filter: brightness(1.05);
    }
    .proto-hotspot:active {
      transform: scale(0.98);
    }
    body.show-hotspots .proto-hotspot {
      box-shadow: 0 0 0 2px rgba(13, 153, 255, 0.7) !important;
    }
    .hotspot-flash {
      box-shadow: 0 0 0 3px rgba(13, 153, 255, 0.9) !important;
      transition: box-shadow 0.4s ease-out;
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
      padding: 10px 22px;
      border-radius: 10px;
      font-size: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.6);
      opacity: 0;
      transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 2000;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    #prototype-toast.show {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <div class="logo-badge">Z</div>
      <span>${safeTitle}</span>
      <span style="font-size: 10px; background: #27272a; color: #a1a1aa; padding: 2px 6px; border-radius: 4px; font-mono;">Interactive Prototype</span>
    </div>

    <div class="center-controls">
      <div class="pill-switcher">
        <button id="btn-show-desktop" class="pill-btn ${defaultDevice === 'desktop' ? 'active' : ''}" onclick="switchView('desktop')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>
          Desktop
        </button>
        <button id="btn-show-mobile" class="pill-btn ${defaultDevice === 'mobile' ? 'active' : ''}" onclick="switchView('mobile')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><line x1="12" x2="12.01" y1="18" y2="18"/></svg>
          Mobile
        </button>
      </div>

      <div class="pill-switcher">
        <button id="btn-zoom-fit" class="pill-btn active" onclick="setZoomMode('fit')">Fit</button>
        <button id="btn-zoom-100" class="pill-btn" onclick="setZoomMode('100')">100%</button>
        <button id="btn-zoom-75" class="pill-btn" onclick="setZoomMode('75')">75%</button>
      </div>
    </div>

    <div class="header-actions">
      <button id="btn-toggle-hotspots" class="btn-action" onclick="toggleHotspots()" title="Highlight Interactive Hotspots (H)">
        ✦ Hotspots
      </button>
      <button class="btn-action" onclick="restartPrototype()" title="Restart Prototype (R)">
        ↺ Restart
      </button>
      <button class="btn-action" onclick="toggleFullscreen()" title="Fullscreen (F)">
        ⛶ Fullscreen
      </button>
    </div>
  </header>

  <main id="prototype-stage" onclick="handleStageClick(event)">
    <div id="stage-scaler">
      <!-- Desktop View Frame -->
      <div id="desktop-view" class="desktop-frame" style="display: ${defaultDevice === 'desktop' ? 'flex' : 'none'};">
        <div class="browser-bar">
          <div class="browser-dots">
            <div class="dot red"></div>
            <div class="dot yellow"></div>
            <div class="dot green"></div>
          </div>
          <div class="address-bar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <span>https://app.zlab.io/prototype/${projectTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}</span>
          </div>
        </div>
        <div class="screen-content">
          ${desktopHtml}
        </div>
      </div>

      <!-- Mobile View Frame -->
      <div id="mobile-view" class="mobile-frame-wrapper" style="display: ${defaultDevice === 'mobile' ? 'block' : 'none'};">
        <div class="mobile-frame">
          <div class="dynamic-island">
            <div class="camera"></div>
            <div class="sensor"></div>
          </div>
          <div class="mobile-status-bar">
            <span>9:41</span>
            <div style="display: flex; align-items: center; gap: 4px; font-size: 11px;">
              <span>5G</span>
              <div style="width: 18px; height: 10px; border: 1px solid white; border-radius: 3px; padding: 1px; display: flex;">
                <div style="width: 100%; height: 100%; background: white; border-radius: 1px;"></div>
              </div>
            </div>
          </div>
          <div class="mobile-content">
            ${mobileHtml}
          </div>
          <div class="home-indicator"></div>
        </div>
      </div>
    </div>
  </main>

  <div id="prototype-toast">✦ Interaction Triggered</div>

  <script>
    let currentView = '${defaultDevice}';
    let zoomMode = 'fit';
    let showHotspotsActive = false;

    function applyScale() {
      const scaler = document.getElementById('stage-scaler');
      if (!scaler) return;
      if (zoomMode === '100') {
        scaler.style.transform = 'scale(1)';
        return;
      }
      if (zoomMode === '75') {
        scaler.style.transform = 'scale(0.75)';
        return;
      }

      // 'fit' mode
      const stage = document.getElementById('prototype-stage');
      const targetFrame = currentView === 'desktop'
        ? document.getElementById('desktop-view')
        : document.getElementById('mobile-view');

      if (!stage || !targetFrame) return;

      const stageW = stage.clientWidth - 48;
      const stageH = stage.clientHeight - 48;
      const frameW = currentView === 'desktop' ? ${desktopTarget?.width || 1440} : (${mobileTarget?.width || 390} + 24);
      const frameH = currentView === 'desktop' ? (${desktopTarget?.height || 900} + 40) : (${mobileTarget?.height || 844} + 24);

      const scale = Math.min(stageW / frameW, stageH / frameH, 1);
      scaler.style.transform = 'scale(' + Math.max(0.2, scale.toFixed(3)) + ')';
    }

    function setZoomMode(mode) {
      zoomMode = mode;
      document.getElementById('btn-zoom-fit').classList.toggle('active', mode === 'fit');
      document.getElementById('btn-zoom-100').classList.toggle('active', mode === '100');
      document.getElementById('btn-zoom-75').classList.toggle('active', mode === '75');
      applyScale();
      showToast('Zoom: ' + (mode === 'fit' ? 'Fit Window' : mode + '%'));
    }

    function switchView(view) {
      currentView = view;
      document.getElementById('desktop-view').style.display = view === 'desktop' ? 'flex' : 'none';
      document.getElementById('mobile-view').style.display = view === 'mobile' ? 'block' : 'none';
      document.getElementById('btn-show-desktop').classList.toggle('active', view === 'desktop');
      document.getElementById('btn-show-mobile').classList.toggle('active', view === 'mobile');
      applyScale();
      showToast('Switched to ' + (view === 'desktop' ? 'Desktop 1440' : 'Mobile iOS') + ' view');
    }

    function toggleHotspots() {
      showHotspotsActive = !showHotspotsActive;
      document.body.classList.toggle('show-hotspots', showHotspotsActive);
      document.getElementById('btn-toggle-hotspots').classList.toggle('active', showHotspotsActive);
      showToast(showHotspotsActive ? '✦ Hotspots Highlighted' : 'Hotspots Hidden');
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
      setZoomMode('fit');
      showToast('↺ Prototype reset to initial frame');
    }

    function toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }

    function handleStageClick(e) {
      const hotspot = e.target.closest('.proto-hotspot, button, [data-proto-action]');
      if (hotspot) {
        e.stopPropagation();
        const action = hotspot.getAttribute('data-proto-action') || 'navigate';
        const dest = hotspot.getAttribute('data-proto-dest');
        const name = hotspot.getAttribute('data-name') || hotspot.textContent?.trim() || 'Element';

        if (action === 'navigate' && dest) {
          showToast('✦ Transitioning to: ' + dest);
        } else if (action === 'url' && dest) {
          showToast('✦ Open link: ' + dest);
        } else {
          showToast('✦ Clicked: ' + name);
        }

        // Ripple tactile feedback
        hotspot.style.transition = 'transform 0.1s ease';
        hotspot.style.transform = 'scale(0.97)';
        setTimeout(() => {
          hotspot.style.transform = 'none';
        }, 120);
        return;
      }

      // Clicked outside hotspot: briefly flash all hotspots to assist discovery
      const container = currentView === 'desktop'
        ? document.getElementById('desktop-view')
        : document.getElementById('mobile-view');

      if (container) {
        const spots = container.querySelectorAll('.proto-hotspot, button');
        spots.forEach(s => s.classList.add('hotspot-flash'));
        setTimeout(() => {
          spots.forEach(s => s.classList.remove('hotspot-flash'));
        }, 450);
      }
    }

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === '1') switchView('desktop');
      if (e.key === '2') switchView('mobile');
      if (e.key === 'h' || e.key === 'H') toggleHotspots();
      if (e.key === 'r' || e.key === 'R') restartPrototype();
      if (e.key === 'f' || e.key === 'F') toggleFullscreen();
    });

    window.addEventListener('resize', applyScale);
    setTimeout(applyScale, 50);
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
  let htmlContent = '';

  if (domElement) {
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

    htmlContent = clone.outerHTML;
  } else {
    // Graceful fallback when the requested artboard is not actively mounted in current viewport
    const isMobileTarget = targetId === 'mobile-app-view';
    const innerNodes = renderArtboardElementsToHtml(targetId, elements, isMobileTarget);
    const bg = target.fill || (isMobileTarget ? '#000000' : '#131313');
    const w = target.width || (isMobileTarget ? 390 : 1440);
    const h = target.height || (isMobileTarget ? 844 : 900);
    const r = target.borderRadius || (isMobileTarget ? 48 : 8);

    htmlContent = `<div style="position: relative; width: ${w}px; height: ${h}px; background-color: ${bg}; border-radius: ${r}px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">${innerNodes}</div>`;
  }

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
