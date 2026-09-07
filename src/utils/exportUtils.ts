import { CanvasElement } from '../types';

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
export function downloadInteractivePrototypeHtml(
  projectTitle: string,
  elements: Record<string, CanvasElement>,
  defaultDevice: 'desktop' | 'mobile' = 'desktop'
) {
  const safeTitle = escapeHtml(projectTitle || 'ZLab Prototype');
  const desktopElements = (Object.values(elements) as CanvasElement[]).filter(
    (el) => el.parentId === 'desktop-1440' || el.id === 'desktop-1440'
  );
  const mobileElements = (Object.values(elements) as CanvasElement[]).filter(
    (el) => el.parentId === 'mobile-app-view' || el.id === 'mobile-app-view'
  );

    function renderHtmlNodes(nodeId: string, targetX: number, targetY: number): string {
      const el = elements[nodeId];
      if (!el || el.visible === false) return '';
      
      const elX = el.x - targetX;
      const elY = el.y - targetY;
      
      let styles = `position: absolute; left: ${elX}px; top: ${elY}px; width: ${el.width}px; height: ${el.height}px;`;
      if (el.fill) styles += ` background-color: ${el.fill};`;
      if (el.fillOpacity !== undefined) styles += ` opacity: ${el.fillOpacity / 100};`;
      if (el.borderRadius) styles += ` border-radius: ${el.borderRadius}px;`;
      if (el.stroke && el.stroke !== 'none') styles += ` border: ${el.strokeWidth || 1}px solid ${el.stroke};`;
      if (el.shadowBlur) styles += ` box-shadow: 0px ${el.shadowY || 0}px ${el.shadowBlur}px rgba(0,0,0,0.4);`;
      if (el.backdropBlur) styles += ` backdrop-filter: blur(${el.backdropBlur}px); -webkit-backdrop-filter: blur(${el.backdropBlur}px);`;
      if (el.type === 'text' || el.textContent) {
        styles += ` color: ${el.textColor || (el.type === 'text' ? el.fill : '#fff')}; font-size: ${el.fontSize || 14}px; font-family: sans-serif; display: flex; align-items: ${el.textAlign === 'center' ? 'center' : 'flex-start'}; justify-content: ${el.textAlign === 'center' ? 'center' : (el.textAlign === 'right' ? 'flex-end' : 'flex-start')}; padding: 12px; box-sizing: border-box;`;
      }
      
      const innerContent = el.textContent ? escapeHtml(el.textContent) : '';
      
      const children = Object.values(elements).filter(
        (child) => child.parentId === nodeId && child.visible !== false
      );
      
      const nested = children.map((child) => renderHtmlNodes(child.id, targetX, targetY)).join('\n');
      
      return `<div class="hotspot" style="${styles}">${innerContent}\n${nested}</div>`;
    }

    const desktopTarget = elements['desktop-1440'];
    const mobileTarget = elements['mobile-app-view'];
    
    // We already have the frames .desktop-frame and .mobile-frame acting as the root targets, 
    // but the recursive function will now output a DIV for the target itself.
    // To avoid doubling the background/border for the frame, we can just render its children for the HTML 
    // since the HTML template natively supports the frame bounds and overflow.
    function renderHtmlChildren(parentId: string, targetX: number, targetY: number): string {
      return Object.values(elements)
        .filter((el) => el.parentId === parentId && el.visible !== false)
        .map((el) => renderHtmlNodes(el.id, targetX, targetY))
        .join('\n');
    }

    const desktopHtml = desktopTarget ? renderHtmlChildren('desktop-1440', desktopTarget.x, desktopTarget.y) : '';
    const mobileHtml = mobileTarget ? renderHtmlChildren('mobile-app-view', mobileTarget.x, mobileTarget.y) : '';

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle} - Interactive Prototype</title>
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
    .dynamic-island {
      position: absolute;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      width: 100px;
      height: 26px;
      background: #000;
      border-radius: 20px;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 8px;
    }
    .camera-lens { width: 8px; height: 8px; border-radius: 50%; background: #1a1a2e; }
    .mobile-status-bar {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 44px;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      padding: 0 24px 8px 24px;
      font-size: 12px;
      font-weight: 600;
      color: #fafafa;
      z-index: 990;
      pointer-events: none;
    }
    .mobile-content {
      flex: 1;
      position: relative;
      overflow: hidden;
    }
    .mobile-home-indicator {
      position: absolute;
      bottom: 8px;
      left: 50%;
      transform: translateX(-50%);
      width: 120px;
      height: 4px;
      background: #71717a;
      border-radius: 2px;
      z-index: 1000;
      pointer-events: none;
    }
    /* Hotspot Blue Ripple */
    .hotspot {
      cursor: pointer;
      position: absolute;
      transition: transform 0.1s ease, filter 0.15s ease;
    }
    .hotspot:hover {
      filter: brightness(1.08);
    }
    .hotspot:active {
      transform: scale(0.98);
    }
    .hotspot-flash {
      animation: hotspotPulse 0.4s ease-out;
    }
    @keyframes hotspotPulse {
      0% { box-shadow: 0 0 0 0 rgba(13, 153, 255, 0.8); }
      100% { box-shadow: 0 0 0 16px rgba(13, 153, 255, 0); }
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
      <button class="btn-action" onclick="toggleHotspots()">
        <span id="hotspot-indicator">●</span> Hints: ON
      </button>
      <button class="btn-action" onclick="restartPrototype()">↺ Restart</button>
    </div>
  </header>

  <main id="prototype-stage" onclick="handleCanvasClick(event)">
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
      <div class="dynamic-island">
        <div class="camera-lens"></div>
      </div>
      <div class="mobile-status-bar">
        <span>9:41</span>
        <span>5G 􀛨</span>
      </div>
      <div class="mobile-content">
        ${mobileHtml}
      </div>
      <div class="mobile-home-indicator"></div>
    </div>
  </main>

  <div id="prototype-toast">Interaction Triggered!</div>

  <script>
    let currentView = '${defaultDevice}';
    let currentMobileScreen = 'welcome';
    let showHotspots = true;

    function smartAnimateTo(screen) {
      currentMobileScreen = screen;
      const isWelcome = screen === 'welcome';
      
      const backRow = document.getElementById('proto-back-row');
      const logoWrapper = document.getElementById('proto-logo-wrapper');
      const logoBox = document.getElementById('proto-logo-box');
      const titleWrapper = document.getElementById('proto-title-wrapper');
      const title = document.getElementById('proto-title');
      const subtitle = document.getElementById('proto-subtitle');
      const welcomeCard = document.getElementById('proto-welcome-card');
      const signinForm = document.getElementById('proto-signin-form');
      const ctaBtn = document.getElementById('proto-cta-btn');
      const secondaryLink = document.getElementById('proto-secondary-link');

      if (isWelcome) {
        backRow.style.opacity = '0';
        backRow.style.transform = 'translateY(-10px)';
        backRow.style.pointerEvents = 'none';

        logoWrapper.style.transform = 'translateY(35px)';
        logoBox.style.width = '100px';
        logoBox.style.height = '100px';
        logoBox.style.borderRadius = '26px';

        titleWrapper.style.transform = 'translateY(45px)';
        title.textContent = 'Welcome to ZLab';
        title.style.fontSize = '22px';
        subtitle.textContent = 'Design smoothly with Smart Animate motion';

        welcomeCard.style.display = 'block';
        setTimeout(() => { welcomeCard.style.opacity = '1'; }, 20);

        signinForm.style.opacity = '0';
        signinForm.style.transform = 'translateY(20px)';
        setTimeout(() => { signinForm.style.display = 'none'; }, 250);

        ctaBtn.style.background = '#9fcaff';
        ctaBtn.style.color = '#003259';
        ctaBtn.textContent = '✦ Get Started (On Tap ➔ Smart Animate)';

        secondaryLink.innerHTML = 'Already have an account? <span style="color: #9fcaff; text-decoration: underline;">Sign In</span>';
        showToast('✦ Smart Animate: Sign-In Screen ➔ Welcome Screen (450ms)');
      } else {
        backRow.style.opacity = '1';
        backRow.style.transform = 'translateY(0)';
        backRow.style.pointerEvents = 'auto';

        logoWrapper.style.transform = 'translateY(5px)';
        logoBox.style.width = '64px';
        logoBox.style.height = '64px';
        logoBox.style.borderRadius = '18px';

        titleWrapper.style.transform = 'translateY(15px)';
        title.textContent = 'Sign in to your workspace';
        title.style.fontSize = '19px';
        subtitle.textContent = 'Enter your credentials to continue to canvas';

        welcomeCard.style.opacity = '0';
        setTimeout(() => { welcomeCard.style.display = 'none'; }, 250);

        signinForm.style.display = 'flex';
        setTimeout(() => {
          signinForm.style.opacity = '1';
          signinForm.style.transform = 'translateY(0)';
        }, 30);

        ctaBtn.style.background = '#0d99ff';
        ctaBtn.style.color = '#ffffff';
        ctaBtn.textContent = 'Sign In to Workspace';

        secondaryLink.innerHTML = '← Return to Welcome Screen';
        showToast('✦ Smart Animate: Welcome Screen ➔ Sign-In Screen (450ms)');
      }
    }

    function toggleScreenSmartAnimate() {
      if (currentMobileScreen === 'welcome') {
        smartAnimateTo('signin');
      } else {
        smartAnimateTo('welcome');
      }
    }

    function switchView(view) {
      currentView = view;
      document.getElementById('desktop-view').style.display = view === 'desktop' ? 'flex' : 'none';
      document.getElementById('mobile-view').style.display = view === 'mobile' ? 'flex' : 'none';
      document.getElementById('btn-show-desktop').classList.toggle('active', view === 'desktop');
      document.getElementById('btn-show-mobile').classList.toggle('active', view === 'mobile');
      showToast('Switched to ' + (view === 'desktop' ? 'Desktop 1440' : 'Mobile iOS') + ' view');
    }

    function toggleHotspots() {
      showHotspots = !showHotspots;
      const indicator = document.getElementById('hotspot-indicator');
      const btn = indicator.parentElement;
      indicator.style.color = showHotspots ? '#22c55e' : '#71717a';
      btn.innerHTML = '<span id="hotspot-indicator" style="color: ' + (showHotspots ? '#22c55e' : '#71717a') + '">●</span> Hints: ' + (showHotspots ? 'ON' : 'OFF');
      showToast('Click hints ' + (showHotspots ? 'Enabled' : 'Disabled'));
    }

    function triggerAction(message) {
      showToast(message);
    }

    function restartPrototype() {
      switchView('${defaultDevice}');
      showToast('Prototype restarted from initial frame');
    }

    function handleCanvasClick(e) {
      if (!showHotspots) return;
      const isHotspot = e.target.closest('.hotspot');
      if (!isHotspot) {
        // Flash subtle hint on all hotspots in current view
        const activeContainer = currentView === 'desktop' ? document.getElementById('desktop-view') : document.getElementById('mobile-view');
        if (activeContainer) {
          const spots = activeContainer.querySelectorAll('.hotspot');
          spots.forEach(s => {
            s.classList.remove('hotspot-flash');
            void s.offsetWidth; // trigger reflow
            s.classList.add('hotspot-flash');
          });
        }
      }
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
 * Generates and downloads a clean, scalable SVG file of the design artwork.
 */
export function downloadSvg(
  projectTitle: string,
  elements: Record<string, CanvasElement>,
  selectedElementId?: string
) {
  const target = selectedElementId ? elements[selectedElementId] : elements['desktop-1440'];
  const w = target?.width || 960;
  const h = target?.height || 640;
  const targetX = target?.x || 0;
  const targetY = target?.y || 0;

  function buildSvgNodes(nodeId: string): string {
    const el = elements[nodeId];
    if (!el || el.visible === false) return '';

    let nodeSvg = '';
    // Don't render the root target background again since it's already rendered as the base rect,
    // unless we want to let the generic renderer handle it. Actually, the base rect handles the background.
    // But we need the stroke, text, etc.
    // For simplicity, let's just let the recursive function render it. We can remove the base rect.
    const fill = el.fill || '#0d99ff';
    const stroke = el.stroke && el.stroke !== 'none' ? `stroke="${el.stroke}" stroke-width="${el.strokeWidth || 1}"` : '';
    const rx = el.borderRadius ? `rx="${el.borderRadius}"` : '';
    const textX = (el.x - targetX) + 12;
    const textY = (el.y - targetY) + (el.height / 2) + 5;
    const text = el.textContent ? `<text x="${textX}" y="${textY}" fill="${el.textColor || '#ffffff'}" font-family="sans-serif" font-size="${el.fontSize || 14}px">${escapeHtml(el.textContent)}</text>` : '';

    const rect = `<rect x="${el.x - targetX}" y="${el.y - targetY}" width="${el.width}" height="${el.height}" fill="${fill}" opacity="${(el.fillOpacity ?? 100) / 100}" ${rx} ${stroke} />`;
    
    nodeSvg = `  ${rect}\n  ${text}`;

    const children = Object.values(elements).filter(
      (child) => child.parentId === nodeId && child.visible !== false
    );
    
    const childrenSvg = children.map((child) => buildSvgNodes(child.id)).join('\n');
    return `${nodeSvg}\n${childrenSvg}`;
  }

  // Generate all SVG content recursively starting from target
  const childrenSvg = target ? buildSvgNodes(target.id) : '';

  const svgMarkup = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Generated by ZLab -->
${childrenSvg}
</svg>`;

  const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const fileName = `${projectTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.svg`;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates and downloads a raster PNG image using offscreen HTML5 canvas.
 */
export function downloadPng(
  projectTitle: string,
  elements: Record<string, CanvasElement>,
  selectedElementId?: string
) {
  const target = selectedElementId ? elements[selectedElementId] : elements['desktop-1440'];
  const w = target?.width || 960;
  const h = target?.height || 640;
  const scale = 2; // 2x Retina

  const canvas = document.createElement('canvas');
  canvas.width = w * scale;
  canvas.height = h * scale;
  const ctx = canvas.getContext('2d');

  if (!ctx) return;

  ctx.scale(scale, scale);

  // We won't draw the hardcoded background. The recursive renderer will draw the target's fill.
  const targetX = target?.x || 0;
  const targetY = target?.y || 0;

  function renderNodes(nodeId: string) {
    const el = elements[nodeId];
    if (!el || el.visible === false || !ctx) return;

    ctx.save();
    ctx.globalAlpha = (el.fillOpacity ?? 100) / 100;

    const elX = el.x - targetX;
    const elY = el.y - targetY;

    // Rounded rectangle path
    const r = el.borderRadius || 0;
    ctx.beginPath();
    ctx.moveTo(elX + r, elY);
    ctx.lineTo(elX + el.width - r, elY);
    ctx.quadraticCurveTo(elX + el.width, elY, elX + el.width, elY + r);
    ctx.lineTo(elX + el.width, elY + el.height - r);
    ctx.quadraticCurveTo(elX + el.width, elY + el.height, elX + el.width - r, elY + el.height);
    ctx.lineTo(elX + r, elY + el.height);
    ctx.quadraticCurveTo(elX, elY + el.height, elX, elY + el.height - r);
    ctx.lineTo(elX, elY + r);
    ctx.quadraticCurveTo(elX, elY, elX + r, elY);
    ctx.closePath();

    if (el.shadowBlur) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = el.shadowBlur;
      ctx.shadowOffsetY = el.shadowY || 0;
    }

    ctx.fillStyle = el.fill || (el.type === 'text' ? 'transparent' : '#0d99ff');
    ctx.fill();

    if (el.stroke && el.stroke !== 'none') {
      ctx.strokeStyle = el.stroke;
      ctx.lineWidth = el.strokeWidth || 1;
      ctx.stroke();
    }

    // Text
    if (el.textContent) {
      ctx.shadowColor = 'transparent';
      ctx.fillStyle = el.textColor || (el.type === 'text' ? el.fill : '#ffffff');
      ctx.font = `${el.fontSize || 13}px -apple-system, sans-serif`;
      
      const textAlign = el.textAlign || (el.id === 'main-hero-title' ? 'center' : 'left');
      ctx.textAlign = textAlign as CanvasTextAlign;
      ctx.textBaseline = 'middle';
      
      let textPosX = elX + 12;
      if (textAlign === 'center') textPosX = elX + (el.width / 2);
      if (textAlign === 'right') textPosX = elX + el.width - 12;
      
      ctx.fillText(el.textContent, textPosX, elY + el.height / 2);
    }

    ctx.restore();

    const children = Object.values(elements).filter(
      (child) => child.parentId === nodeId && child.visible !== false
    );

    for (const child of children) {
      renderNodes(child.id);
    }
  }

  if (target) {
    renderNodes(target.id);
  }

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileName = `${projectTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 'image/png');
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
    schemaVersion: '2.4',
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
