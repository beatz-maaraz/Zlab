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
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
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
      width: 960px;
      height: 640px;
      background: #18181b;
      border-radius: 12px;
      box-shadow: 0 25px 60px -15px rgba(0,0,0,0.7), 0 0 0 1px #27272a;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: opacity 0.2s ease, transform 0.2s ease;
    }
    .browser-bar {
      height: 38px;
      background: #202023;
      border-bottom: 1px solid #27272a;
      display: flex;
      align-items: center;
      padding: 0 14px;
      gap: 12px;
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
      background: #121214;
      position: relative;
      overflow-y: auto;
    }
    /* Mobile Frame */
    .mobile-frame {
      width: 360px;
      height: 720px;
      background: #000;
      border-radius: 48px;
      box-shadow: 0 25px 60px -15px rgba(0,0,0,0.8), 0 0 0 4px #27272a;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: relative;
      transition: opacity 0.2s ease, transform 0.2s ease;
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
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 8px;
    }
    .camera-lens { width: 8px; height: 8px; border-radius: 50%; background: #1a1a2e; }
    .mobile-status-bar {
      height: 44px;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      padding: 0 24px 8px 24px;
      font-size: 12px;
      font-weight: 600;
      color: #fafafa;
      z-index: 90;
    }
    .mobile-content {
      flex: 1;
      background: #141417;
      position: relative;
      overflow-y: auto;
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
      z-index: 100;
    }
    /* Hotspot Blue Ripple */
    .hotspot {
      cursor: pointer;
      position: relative;
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
      z-index: 200;
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
      <div class="logo-badge">V</div>
      <span>${safeTitle}</span>
      <span style="font-size: 11px; background: #27272a; color: #a1a1aa; padding: 2px 6px; border-radius: 4px;">Prototype v2.4</span>
    </div>

    <div class="pill-switcher">
      <button id="btn-show-desktop" class="pill-btn ${defaultDevice === 'desktop' ? 'active' : ''}" onclick="switchView('desktop')">Desktop 1440</button>
      <button id="btn-show-mobile" class="pill-btn ${defaultDevice === 'mobile' ? 'active' : ''}" onclick="switchView('mobile')">Mobile iOS</button>
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
        <!-- Desktop Nav -->
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 18px 40px; border-bottom: 1px solid #202024;">
          <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; color: #fff;">
            <span style="background: #0d99ff; color: #00284d; padding: 2px 8px; border-radius: 4px; font-weight: 900;">Z</span>
            ZLAB
          </div>
          <div style="display: flex; gap: 24px; font-size: 13px; color: #a1a1aa;">
            <span class="hotspot" onclick="triggerAction('Overview clicked')">Overview</span>
            <span class="hotspot" onclick="triggerAction('Features clicked')">Features</span>
            <span class="hotspot" onclick="triggerAction('Pricing clicked')">Pricing</span>
            <span class="hotspot" onclick="switchView('mobile')">Switch to Mobile App ↗</span>
          </div>
          <button class="hotspot" onclick="triggerAction('Free trial started!')" style="background: #9fcaff; color: #003259; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 600; font-size: 12px; cursor: pointer;">
            Get Started
          </button>
        </div>

        <!-- Desktop Hero -->
        <div style="text-align: center; padding: 60px 40px 40px;">
          <div style="display: inline-block; background: #27272a; color: #d2bbff; padding: 4px 12px; border-radius: 20px; font-size: 12px; margin-bottom: 16px;">
            ✨ Next-Gen Vector Engine
          </div>
          <h1 style="font-size: 38px; font-weight: 800; color: #fafafa; margin-bottom: 16px; line-height: 1.2;">
            Design at the speed of thought with infinite precision.
          </h1>
          <p style="color: #a1a1aa; max-width: 580px; margin: 0 auto 28px; font-size: 14px; line-height: 1.6;">
            A high-performance vector creation workspace with real-time multiplayer, smart constraints, and one-click component prototyping.
          </p>
          <div style="display: flex; justify-content: center; gap: 14px;">
            <button class="hotspot" onclick="triggerAction('Primary CTA clicked: Account created!')" style="background: #9fcaff; color: #003259; border: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; box-shadow: 0 4px 14px rgba(159,202,255,0.3);">
              Start Free Trial →
            </button>
            <button class="hotspot" onclick="switchView('mobile')" style="background: #27272a; color: #fafafa; border: 1px solid #3f3f46; padding: 12px 24px; border-radius: 8px; font-weight: 500; font-size: 14px; cursor: pointer;">
              Preview Mobile iOS View
            </button>
          </div>
        </div>

        <!-- Interactive Grid Cards -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; padding: 20px 40px;">
          <div class="hotspot" onclick="triggerAction('Opened Vector Pen engine details')" style="background: #1e1e24; border: 1px solid #2d2d35; border-radius: 12px; padding: 20px;">
            <div style="font-size: 20px; margin-bottom: 8px;">⚡</div>
            <h3 style="font-size: 14px; color: #fff; margin-bottom: 6px;">GPU Vector Core</h3>
            <p style="font-size: 12px; color: #89919e; line-height: 1.5;">Sub-pixel math rendering 100k nodes smoothly at 120 FPS.</p>
          </div>
          <div class="hotspot" onclick="triggerAction('Opened Multiplayer Sync details')" style="background: #1e1e24; border: 1px solid #2d2d35; border-radius: 12px; padding: 20px;">
            <div style="font-size: 20px; margin-bottom: 8px;">👥</div>
            <h3 style="font-size: 14px; color: #fff; margin-bottom: 6px;">Live Collaboration</h3>
            <p style="font-size: 12px; color: #89919e; line-height: 1.5;">CRDT synchronization ensuring zero conflicts across your entire team.</p>
          </div>
          <div class="hotspot" onclick="triggerAction('Opened Component Library modal')" style="background: #1e1e24; border: 1px solid #2d2d35; border-radius: 12px; padding: 20px;">
            <div style="font-size: 20px; margin-bottom: 8px;">🧩</div>
            <h3 style="font-size: 14px; color: #fff; margin-bottom: 6px;">Design Systems</h3>
            <p style="font-size: 12px; color: #89919e; line-height: 1.5;">Linked components with variants, tokens, and instant code generation.</p>
          </div>
        </div>
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
      <div class="mobile-content" style="display: flex; flex-direction: column; padding: 20px; position: relative;">
        <!-- Top Back button (only on signin) -->
        <div id="proto-back-row" style="opacity: 0; transform: translateY(-10px); transition: all 0.45s cubic-bezier(0, 0, 0.2, 1); pointer-events: none; margin-bottom: 8px;">
          <button class="hotspot" onclick="smartAnimateTo('welcome')" style="background: #201f1f; border: 1px solid #353534; color: #9fcaff; border-radius: 20px; padding: 6px 14px; font-size: 11px; font-weight: 600; cursor: pointer;">
            ← Welcome Screen
          </button>
        </div>

        <!-- Shared Emblem / Logo (Smart Animate morphing) -->
        <div id="proto-logo-wrapper" style="display: flex; justify-content: center; transform: translateY(35px); transition: all 0.45s cubic-bezier(0, 0, 0.2, 1); margin: 8px 0;">
          <div id="proto-logo-box" class="hotspot" onclick="toggleScreenSmartAnimate()" style="width: 100px; height: 100px; border-radius: 26px; background: #0d99ff; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #fff; box-shadow: 0 12px 30px rgba(13, 153, 255, 0.35); transition: all 0.45s cubic-bezier(0, 0, 0.2, 1); cursor: pointer;">
            <div style="font-size: 26px; font-weight: 800;">✦</div>
            <div id="proto-logo-text" style="font-size: 13px; font-weight: 700; margin-top: 2px;">ZLab</div>
          </div>
        </div>

        <!-- Shared Title & Subtitle -->
        <div id="proto-title-wrapper" style="text-align: center; transform: translateY(45px); transition: all 0.45s cubic-bezier(0, 0, 0.2, 1);">
          <h2 id="proto-title" style="font-size: 22px; font-weight: 800; color: #fff; margin: 0; transition: all 0.45s ease;">Welcome to ZLab</h2>
          <p id="proto-subtitle" style="font-size: 12px; color: #89919e; margin-top: 6px; transition: all 0.45s ease;">Design smoothly with Smart Animate motion</p>
        </div>

        <!-- Welcome Screen Specific Trigger Card -->
        <div id="proto-welcome-card" style="margin-top: 55px; background: #1c1c21; border: 1px solid #27272a; border-radius: 14px; padding: 14px; transition: all 0.45s cubic-bezier(0, 0, 0.2, 1);">
          <div style="font-size: 11px; font-weight: 700; color: #34d399; margin-bottom: 4px;">● FIGMA SMART ANIMATE READY</div>
          <div style="font-size: 11px; color: #89919e; line-height: 1.5;">
            Trigger: <strong style="color: #9fcaff;">On tap</strong><br>
            Destination: <strong style="color: #9fcaff;">Sign-In Screen</strong><br>
            Animation: <strong style="color: #d2bbff;">Smart Animate (450ms)</strong>
          </div>
        </div>

        <!-- Sign-In Form Fields (Fade & slide into view) -->
        <div id="proto-signin-form" style="display: none; opacity: 0; transform: translateY(20px); transition: all 0.45s cubic-bezier(0, 0, 0.2, 1); margin-top: 25px; flex-direction: column; gap: 12px;">
          <div>
            <label style="font-size: 11px; color: #89919e; display: block; margin-bottom: 4px;">Email address</label>
            <input type="text" readonly value="designer@zlab.app" style="width: 100%; box-sizing: border-box; background: #1c1c21; border: 1px solid #2d2d32; border-radius: 10px; padding: 10px 12px; color: #fff; font-size: 12px; outline: none;">
          </div>
          <div>
            <label style="font-size: 11px; color: #89919e; display: block; margin-bottom: 4px;">Password</label>
            <input type="password" readonly value="••••••••••••" style="width: 100%; box-sizing: border-box; background: #1c1c21; border: 1px solid #2d2d32; border-radius: 10px; padding: 10px 12px; color: #fff; font-size: 12px; outline: none;">
          </div>
        </div>

        <!-- Bottom Primary CTA Button -->
        <div style="margin-top: auto; padding-top: 20px; display: flex; flex-direction: column; gap: 10px;">
          <button id="proto-cta-btn" class="hotspot" onclick="toggleScreenSmartAnimate()" style="width: 100%; background: #9fcaff; color: #003259; border: none; border-radius: 14px; padding: 14px; font-weight: 700; font-size: 13px; cursor: pointer; transition: all 0.45s cubic-bezier(0, 0, 0.2, 1); box-shadow: 0 4px 15px rgba(159, 202, 255, 0.3);">
            ✦ Get Started (On Tap ➔ Smart Animate)
          </button>
          <div id="proto-secondary-link" onclick="toggleScreenSmartAnimate()" style="text-align: center; font-size: 11px; color: #89919e; cursor: pointer; padding: 4px;">
            Already have an account? <span style="color: #9fcaff; text-decoration: underline;">Sign In</span>
          </div>
        </div>
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

  // Build SVG child elements
  const children = Object.values(elements)
    .filter((el) => el.parentId === target?.id && el.visible !== false)
    .map((el) => {
      const fill = el.fill || '#0d99ff';
      const stroke = el.stroke && el.stroke !== 'none' ? `stroke="${el.stroke}" stroke-width="${el.strokeWidth || 1}"` : '';
      const rx = el.borderRadius ? `rx="${el.borderRadius}"` : '';
      const text = el.textContent ? `<text x="${el.x + 12}" y="${el.y + el.height / 2 + 5}" fill="${el.textColor || '#ffffff'}" font-family="sans-serif" font-size="${el.fontSize || 14}px">${escapeHtml(el.textContent)}</text>` : '';

      return `  <rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${fill}" opacity="${(el.fillOpacity ?? 100) / 100}" ${rx} ${stroke} />
  ${text}`;
    })
    .join('\n');

  const svgMarkup = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Generated by ZLab -->
  <rect width="${w}" height="${h}" fill="${target?.fill || '#131313'}" />
${children}
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

  // Background
  ctx.fillStyle = target?.fill || '#131313';
  ctx.fillRect(0, 0, w, h);

  // Render children
  const children = Object.values(elements).filter(
    (el) => el.parentId === target?.id && el.visible !== false
  );

  for (const el of children) {
    ctx.save();
    ctx.globalAlpha = (el.fillOpacity ?? 100) / 100;

    // Rounded rectangle path
    const r = el.borderRadius || 0;
    ctx.beginPath();
    ctx.moveTo(el.x + r, el.y);
    ctx.lineTo(el.x + el.width - r, el.y);
    ctx.quadraticCurveTo(el.x + el.width, el.y, el.x + el.width, el.y + r);
    ctx.lineTo(el.x + el.width, el.y + el.height - r);
    ctx.quadraticCurveTo(el.x + el.width, el.y + el.height, el.x + el.width - r, el.y + el.height);
    ctx.lineTo(el.x + r, el.y + el.height);
    ctx.quadraticCurveTo(el.x, el.y + el.height, el.x, el.y + el.height - r);
    ctx.lineTo(el.x, el.y + r);
    ctx.quadraticCurveTo(el.x, el.y, el.x + r, el.y);
    ctx.closePath();

    if (el.shadowBlur) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = el.shadowBlur;
      ctx.shadowOffsetY = el.shadowY || 0;
    }

    ctx.fillStyle = el.fill || '#0d99ff';
    ctx.fill();

    if (el.stroke && el.stroke !== 'none') {
      ctx.strokeStyle = el.stroke;
      ctx.lineWidth = el.strokeWidth || 1;
      ctx.stroke();
    }

    // Text
    if (el.textContent) {
      ctx.shadowColor = 'transparent';
      ctx.fillStyle = el.textColor || '#ffffff';
      ctx.font = `${el.fontSize || 13}px -apple-system, sans-serif`;
      ctx.fillText(el.textContent, el.x + 12, el.y + el.height / 2 + 4);
    }

    ctx.restore();
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
