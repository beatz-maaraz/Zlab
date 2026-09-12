import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Monitor,
  Download,
  RotateCcw,
  Sparkles,
  Maximize2,
  Minimize2,
  ArrowLeft,
  Mail,
  Lock,
  CheckCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { CanvasElement } from '../types';
import { downloadInteractivePrototypeHtml } from '../utils/exportUtils';

interface PrototypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectTitle: string;
  elements: Record<string, CanvasElement>;
  initialDevice?: 'desktop' | 'mobile';
}

export const PrototypeModal: React.FC<PrototypeModalProps> = ({
  isOpen,
  onClose,
  projectTitle,
  elements,
  initialDevice = 'mobile',
}) => {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('mobile');
  const [showHotspots, setShowHotspots] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [flashKey, setFlashKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Prototype screen & Smart Animate motion state
  const [mobileScreen, setMobileScreen] = useState<'welcome' | 'signin' | 'projects'>('welcome');
  const [isMorphing, setIsMorphing] = useState(false);
  const [animationDuration, setAnimationDuration] = useState<number>(450); // ms
  const [animationEasing, setAnimationEasing] = useState<'ease-out' | 'spring'>('ease-out');

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2600);
  };

  const handleStageClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isHotspot = target.closest('.proto-hotspot');
    if (!isHotspot && showHotspots) {
      setFlashKey((k) => k + 1);
    }
  };

  const handleDownloadHtml = () => {
    downloadInteractivePrototypeHtml(projectTitle, elements, device);
    showToast('Prototype HTML downloaded successfully!');
  };

  const triggerSmartAnimate = (targetScreen: 'welcome' | 'signin' | 'projects') => {
    setIsMorphing(true);
    setMobileScreen(targetScreen);
    const label =
      targetScreen === 'signin'
        ? 'Welcome Screen ➔ Sign-In Screen'
        : targetScreen === 'welcome'
        ? 'Sign-In Screen ➔ Welcome Screen'
        : 'Sign-In ➔ Projects Dashboard';

    showToast(`✦ Smart Animate: ${label} (${animationDuration}ms)`);
    setTimeout(() => {
      setIsMorphing(false);
    }, animationDuration);
  };

  const easingTransition =
    animationEasing === 'spring'
      ? `all ${animationDuration}ms cubic-bezier(0.34, 1.56, 0.64, 1)`
      : `all ${animationDuration}ms cubic-bezier(0, 0, 0.2, 1)`;

  return (
    <div
      id="modal-prototype-simulator"
      className="fixed inset-0 z-50 bg-[#09090b]/92 backdrop-blur-md flex flex-col select-none animate-fadeIn"
    >
      {/* Top Controls Bar */}
      <header className="h-14 bg-[#141416] border-b border-[#27272a] px-5 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#0d99ff] flex items-center justify-center font-bold text-white text-xs shadow">
            V
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white tracking-tight flex items-center gap-2">
              <span>{projectTitle}</span>
              <span className="text-[10px] bg-[#27272a] text-[#a1a1aa] px-1.5 py-0.5 rounded font-mono font-normal">
                Prototype Player
              </span>
              <span className="text-[10px] bg-[#0d99ff]/20 text-[#9fcaff] px-2 py-0.5 rounded-full font-mono font-semibold flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                Smart Animate: Active
              </span>
            </h3>
          </div>
        </div>

        {/* Center: Device & Screen Switcher */}
        <div className="flex items-center gap-2">
          {/* Device Switcher */}
          <div className="flex items-center bg-[#202024] p-1 rounded-lg border border-[#2d2d32]">
            <button
              onClick={() => setDevice('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
                device === 'mobile'
                  ? 'bg-[#3f3f46] text-white shadow-sm'
                  : 'text-[#89919e] hover:text-[#d4d4d8]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile iOS</span>
            </button>
            <button
              onClick={() => setDevice('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
                device === 'desktop'
                  ? 'bg-[#3f3f46] text-white shadow-sm'
                  : 'text-[#89919e] hover:text-[#d4d4d8]'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop 1440</span>
            </button>
          </div>

          {/* Quick Screen Switcher (when in mobile mode) */}
          {device === 'mobile' && (
            <div className="flex items-center bg-[#18181b] p-1 rounded-lg border border-[#27272a] text-xs">
              <button
                onClick={() => triggerSmartAnimate('welcome')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  mobileScreen === 'welcome'
                    ? 'bg-[#0d99ff] text-[#002f55] font-bold shadow'
                    : 'text-[#89919e] hover:text-white'
                }`}
              >
                Welcome Screen
              </button>
              <button
                onClick={() => triggerSmartAnimate('signin')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  mobileScreen === 'signin'
                    ? 'bg-[#0d99ff] text-[#002f55] font-bold shadow'
                    : 'text-[#89919e] hover:text-white'
                }`}
              >
                Sign-In Screen
              </button>
            </div>
          )}

          {/* Smart Animate Speed Control */}
          <div className="flex items-center bg-[#18181b] px-2 py-1 rounded-lg border border-[#27272a] text-[11px] gap-1.5 text-[#89919e]">
            <span>Speed:</span>
            <button
              onClick={() => setAnimationDuration(300)}
              className={`px-1.5 py-0.5 rounded font-mono ${
                animationDuration === 300 ? 'bg-[#3f3f46] text-white font-bold' : 'hover:text-white'
              }`}
            >
              300ms
            </button>
            <button
              onClick={() => setAnimationDuration(450)}
              className={`px-1.5 py-0.5 rounded font-mono ${
                animationDuration === 450 ? 'bg-[#3f3f46] text-white font-bold' : 'hover:text-white'
              }`}
            >
              450ms
            </button>
            <button
              onClick={() => setAnimationDuration(800)}
              className={`px-1.5 py-0.5 rounded font-mono ${
                animationDuration === 800 ? 'bg-[#3f3f46] text-[#9fcaff] font-bold' : 'hover:text-white'
              }`}
              title="Slow-Mo to inspect smooth layer morphing"
            >
              800ms (Slow-Mo)
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHotspots(!showHotspots)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              showHotspots
                ? 'bg-[#0d99ff]/15 border-[#0d99ff]/40 text-[#9fcaff]'
                : 'bg-[#202024] border-[#2d2d32] text-[#89919e] hover:text-white'
            }`}
            title="Toggle Clickable Hotspot Hints"
          >
            <span
              className={`w-2 h-2 rounded-full ${showHotspots ? 'bg-[#34d399]' : 'bg-[#71717a]'}`}
            />
            <span>Hints: {showHotspots ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => {
              setMobileScreen('welcome');
              showToast('Prototype state reset to Welcome Screen');
            }}
            className="p-2 text-[#89919e] hover:text-white rounded-lg hover:bg-[#202024] transition-colors"
            title="Restart Prototype (R)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            id="btn-proto-modal-download"
            onClick={handleDownloadHtml}
            className="bg-[#0d99ff] hover:bg-[#0088ea] text-[#00284d] px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            title="Download Standalone Offline Prototype (.html)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Prototype</span>
          </button>

          <div className="w-[1px] h-4 bg-[#2d2d32] mx-1" />

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-[#89919e] hover:text-white rounded-lg hover:bg-[#202024] transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            className="p-2 text-[#89919e] hover:text-white rounded-lg hover:bg-[#202024] transition-colors ml-1"
            title="Close Prototype (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Interactive Stage */}
      <main
        onClick={handleStageClick}
        className="flex-1 overflow-auto flex items-center justify-center p-8 relative"
        style={{
          backgroundImage: 'radial-gradient(circle, #2d2d32 1.2px, transparent 1.2px)',
          backgroundSize: '24px 24px',
        }}
      >
        {device === 'desktop' ? (
          /* Desktop Browser Window Bezel */
          <div
            className={`w-[960px] h-[640px] bg-[#141416] rounded-xl shadow-2xl border border-[#2d2d32] flex flex-col overflow-hidden transition-all duration-300 ${
              flashKey ? 'ring-2 ring-[#0d99ff]/50' : ''
            }`}
          >
            {/* Window Header */}
            <div className="h-9 bg-[#1d1d21] border-b border-[#27272a] px-4 flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
                <div className="w-3 h-3 rounded-full bg-[#eab308]" />
                <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
              </div>
              <div className="flex-1 max-w-sm h-6 bg-[#111113] rounded-md border border-[#2a2a2e] flex items-center px-2.5 text-[11px] font-mono text-[#89919e]">
                https://zlab.app/preview/{projectTitle.toLowerCase().replace(/\s+/g, '-')}
              </div>
            </div>

            {/* Desktop Screen Content */}
            <div className="flex-1 overflow-auto bg-[#111113] text-[#e5e2e1] relative">
              <div className="flex items-center justify-between px-10 py-4 border-b border-[#1f1f23]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-gradient-to-br from-[#0d99ff] to-[#005299] flex items-center justify-center font-black text-white text-xs shadow border border-[#9fcaff]/30">
                    Z
                  </div>
                  <span className="font-semibold text-sm tracking-tight text-[#e5e2e1]">
                    ZLAB
                  </span>
                </div>
                <div className="flex items-center gap-6 text-xs text-[#89919e]">
                  <span
                    onClick={() => showToast('Navigated to: Overview')}
                    className="proto-hotspot text-[#e5e2e1] hover:text-[#9fcaff] cursor-pointer transition-colors"
                  >
                    Overview
                  </span>
                  <span
                    onClick={() => showToast('Navigated to: Features')}
                    className="proto-hotspot hover:text-[#e5e2e1] cursor-pointer transition-colors"
                  >
                    Features
                  </span>
                  <span
                    onClick={() => {
                      setDevice('mobile');
                      triggerSmartAnimate('welcome');
                    }}
                    className="proto-hotspot text-[#9fcaff] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    Welcome Screen ↗
                  </span>
                  <span
                    onClick={() => {
                      setDevice('mobile');
                      triggerSmartAnimate('signin');
                    }}
                    className="proto-hotspot text-[#9fcaff] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    Sign-In Screen ↗
                  </span>
                </div>
                <button
                  onClick={() => {
                    setDevice('mobile');
                    triggerSmartAnimate('signin');
                  }}
                  className="proto-hotspot bg-[#9fcaff] hover:bg-[#0d99ff] text-[#003259] px-4 py-2 rounded-lg text-xs font-semibold transition-all hover:scale-105"
                >
                  Sign In (Smart Animate)
                </button>
              </div>

              <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                <div className="inline-flex items-center gap-2 bg-[#1f1f23] px-3.5 py-1 rounded-full text-[11px] text-[#d2bbff] mb-4 border border-[#2d2d32]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Interactive Flow Simulator v2.4</span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white max-w-xl leading-tight mb-3">
                  {elements['main-hero-title']?.textContent ||
                    'Design at the speed of thought with Smart Animate.'}
                </h1>
                <p className="text-xs text-[#89919e] max-w-lg mb-6 leading-relaxed">
                  Experience seamless Figma-style screen transitions, smooth component morphing, and interactive tap triggers.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setDevice('mobile');
                      triggerSmartAnimate('welcome');
                    }}
                    className="proto-hotspot bg-[#9fcaff] hover:bg-[#0d99ff] text-[#003259] px-6 py-2.5 rounded-lg font-semibold text-xs transition-all shadow-lg hover:shadow-[#9fcaff]/30 flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Run Mobile Flow (Smart Animate)</span>
                  </button>
                  <button
                    onClick={() => {
                      setDevice('mobile');
                      triggerSmartAnimate('signin');
                    }}
                    className="proto-hotspot bg-[#1f1f23] hover:bg-[#27272b] text-white border border-[#2d2d32] px-5 py-2.5 rounded-lg font-medium text-xs transition-colors"
                  >
                    Go to Sign-In Screen
                  </button>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-3 gap-4 px-10 pb-10">
                <div
                  onClick={() => triggerSmartAnimate('welcome')}
                  className="proto-hotspot bg-[#161619] hover:bg-[#1c1c20] p-4 rounded-xl border border-[#232328] transition-all cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#0d99ff]/20 text-[#9fcaff] flex items-center justify-center font-bold text-xs mb-2">
                    ✦
                  </div>
                  <h4 className="text-xs font-semibold text-white">Smart Animate</h4>
                  <p className="text-[11px] text-[#89919e] mt-1">
                    Matching layers smoothly interpolate position, scale, and opacity.
                  </p>
                </div>
                <div
                  onClick={() => triggerSmartAnimate('signin')}
                  className="proto-hotspot bg-[#161619] hover:bg-[#1c1c20] p-4 rounded-xl border border-[#232328] transition-all cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#34d399]/20 text-[#34d399] flex items-center justify-center font-bold text-xs mb-2">
                    ⚡
                  </div>
                  <h4 className="text-xs font-semibold text-white">On Tap Triggers</h4>
                  <p className="text-[11px] text-[#89919e] mt-1">
                    Responsive tap and click gesture handlers with customizable easing curves.
                  </p>
                </div>
                <div
                  onClick={() => showToast('Design system tokens synchronized')}
                  className="proto-hotspot bg-[#161619] hover:bg-[#1c1c20] p-4 rounded-xl border border-[#232328] transition-all cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#d2bbff]/20 text-[#d2bbff] flex items-center justify-center font-bold text-xs mb-2">
                    🧩
                  </div>
                  <h4 className="text-xs font-semibold text-white">Figma Compatibility</h4>
                  <p className="text-[11px] text-[#89919e] mt-1">
                    Export offline interactive prototypes with native CSS animations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* MOBILE PHONE FRAME WITH SMART ANIMATE BETWEEN WELCOME SCREEN & SIGN-IN SCREEN */
          <div
            className={`w-[375px] h-[740px] bg-black rounded-[48px] shadow-2xl border-4 border-[#27272a] flex flex-col overflow-hidden relative transition-all duration-300 ${
              flashKey ? 'ring-2 ring-[#0d99ff]/60' : ''
            }`}
          >
            {/* Dynamic Island */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-40 flex items-center justify-between px-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#1e1e2d]" />
              <div className="w-2 h-2 rounded-full bg-[#0d99ff]/60 animate-pulse" />
            </div>

            {/* Status Bar */}
            <div className="h-12 px-7 pt-3 flex items-center justify-between text-xs font-semibold text-white z-30 shrink-0">
              <span>9:41</span>
              <div className="flex items-center gap-1.5 text-[11px]">
                <span>5G</span>
                <div className="w-4 h-2.5 border border-white rounded-sm p-0.5 flex items-center">
                  <div className="w-full h-full bg-white rounded-2xs" />
                </div>
              </div>
            </div>

            {/* Smart Animate Container Stage */}
            <div className="flex-1 overflow-hidden bg-[#121215] text-[#e5e2e1] relative flex flex-col p-6">
              {/* Back button (Only appears on Sign-In Screen with smooth slide/fade) */}
              <div
                style={{
                  transition: easingTransition,
                  opacity: mobileScreen === 'signin' ? 1 : 0,
                  transform: mobileScreen === 'signin' ? 'translateY(0)' : 'translateY(-14px)',
                  pointerEvents: mobileScreen === 'signin' ? 'auto' : 'none',
                }}
                className="mb-2 z-20"
              >
                <button
                  onClick={() => triggerSmartAnimate('welcome')}
                  className="proto-hotspot inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#201f1f] text-[#9fcaff] hover:bg-[#2a2a2a] text-xs font-semibold border border-[#353534] transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Welcome Screen</span>
                </button>
              </div>

              {/* Shared Element 1: Brand Emblem / Logo (Morphs smoothly between large center and compact top) */}
              <div
                style={{
                  transition: easingTransition,
                  transform:
                    mobileScreen === 'welcome'
                      ? 'translateY(40px) scale(1)'
                      : 'translateY(10px) scale(0.72)',
                }}
                className="flex items-center justify-center my-2"
              >
                <div
                  onClick={() => {
                    if (mobileScreen === 'welcome') triggerSmartAnimate('signin');
                    else triggerSmartAnimate('welcome');
                  }}
                  style={{
                    transition: easingTransition,
                    width: mobileScreen === 'welcome' ? '110px' : '72px',
                    height: mobileScreen === 'welcome' ? '110px' : '72px',
                    borderRadius: mobileScreen === 'welcome' ? '30px' : '20px',
                  }}
                  className="proto-hotspot bg-[#0d99ff] flex flex-col items-center justify-center text-white shadow-2xl relative cursor-pointer group hover:scale-105 transition-transform"
                >
                  <Sparkles
                    style={{
                      transition: easingTransition,
                      width: mobileScreen === 'welcome' ? '32px' : '22px',
                      height: mobileScreen === 'welcome' ? '32px' : '22px',
                    }}
                    className="text-white drop-shadow-md"
                  />
                  <span
                    style={{
                      transition: easingTransition,
                      fontSize: mobileScreen === 'welcome' ? '14px' : '10px',
                    }}
                    className="font-bold tracking-tight mt-1"
                  >
                    ZLab
                  </span>
                </div>
              </div>

              {/* Shared Element 2: Screen Title */}
              <div
                style={{
                  transition: easingTransition,
                  transform:
                    mobileScreen === 'welcome' ? 'translateY(50px)' : 'translateY(16px)',
                }}
                className="text-center"
              >
                <h2
                  style={{
                    transition: easingTransition,
                    fontSize: mobileScreen === 'welcome' ? '24px' : '20px',
                  }}
                  className="font-extrabold text-white tracking-tight"
                >
                  {mobileScreen === 'welcome'
                    ? 'Welcome to ZLab'
                    : 'Sign in to your workspace'}
                </h2>
                <p
                  style={{
                    transition: easingTransition,
                    opacity: mobileScreen === 'welcome' ? 1 : 0.85,
                    fontSize: '13px',
                  }}
                  className="text-[#89919e] mt-1"
                >
                  {mobileScreen === 'welcome'
                    ? 'Design smoothly with Smart Animate motion'
                    : 'Enter your credentials to continue to canvas'}
                </p>
              </div>

              {/* Welcome Screen Specific Content (Fades out when transitioning to Sign-In) */}
              <div
                style={{
                  transition: easingTransition,
                  opacity: mobileScreen === 'welcome' ? 1 : 0,
                  transform:
                    mobileScreen === 'welcome' ? 'translateY(80px)' : 'translateY(120px)',
                  pointerEvents: mobileScreen === 'welcome' ? 'auto' : 'none',
                  display: mobileScreen === 'welcome' ? 'block' : 'none',
                }}
                className="space-y-4 text-center mt-4"
              >
                <div className="bg-[#1c1c21] p-3.5 rounded-2xl border border-[#27272a] text-left space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-white">
                    <span className="w-2 h-2 rounded-full bg-[#34d399]" />
                    <span>Figma Prototype Trigger</span>
                  </div>
                  <p className="text-[11px] text-[#89919e]">
                    Trigger: <span className="text-[#9fcaff] font-mono">On tap</span>
                    <br />
                    Destination: <span className="text-[#9fcaff] font-mono">Sign-In Screen</span>
                    <br />
                    Animation: <span className="text-[#d2bbff] font-mono">Smart Animate ({animationDuration}ms)</span>
                  </p>
                </div>
              </div>

              {/* Sign-In Screen Specific Form Inputs (Smoothly slide up and fade in) */}
              <div
                style={{
                  transition: easingTransition,
                  opacity: mobileScreen === 'signin' ? 1 : 0,
                  transform:
                    mobileScreen === 'signin' ? 'translateY(36px)' : 'translateY(80px)',
                  pointerEvents: mobileScreen === 'signin' ? 'auto' : 'none',
                  display: mobileScreen === 'signin' ? 'block' : 'none',
                }}
                className="space-y-3.5 mt-2"
              >
                {/* Email Field */}
                <div>
                  <label className="text-[11px] text-[#89919e] font-medium block mb-1">
                    Email address
                  </label>
                  <div className="flex items-center gap-2.5 bg-[#1c1c21] px-3.5 py-3 rounded-xl border border-[#2d2d32] text-xs text-white">
                    <Mail className="w-4 h-4 text-[#89919e]" />
                    <input
                      type="email"
                      readOnly
                      value="designer@zlab.app"
                      className="bg-transparent text-white outline-none w-full font-medium"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="text-[11px] text-[#89919e] font-medium block mb-1">
                    Password
                  </label>
                  <div className="flex items-center gap-2.5 bg-[#1c1c21] px-3.5 py-3 rounded-xl border border-[#2d2d32] text-xs text-white">
                    <Lock className="w-4 h-4 text-[#89919e] shrink-0" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      readOnly
                      value={showPassword ? 'password123!' : '••••••••••••'}
                      className="bg-transparent text-white outline-none w-full font-medium font-mono"
                    />
                    <button
                      type="button"
                      id="btn-prototype-toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[#89919e] hover:text-[#e5e2e1] transition-colors p-0.5 cursor-pointer shrink-0"
                      title={showPassword ? 'Hide password' : 'Show password'}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Shared Element 3: Bottom Action CTA Button */}
              <div className="mt-auto pt-6 space-y-3">
                <button
                  onClick={() => {
                    if (mobileScreen === 'welcome') {
                      triggerSmartAnimate('signin');
                    } else {
                      showToast('Successfully signed in! Accessing canvas...');
                      setTimeout(() => {
                        onClose();
                        triggerSmartAnimate('welcome');
                      }, 1200);
                    }
                  }}
                  style={{
                    transition: easingTransition,
                    backgroundColor: mobileScreen === 'welcome' ? '#9fcaff' : '#0d99ff',
                    color: mobileScreen === 'welcome' ? '#003259' : '#ffffff',
                  }}
                  className="proto-hotspot w-full py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all hover:brightness-110 active:scale-98"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {mobileScreen === 'welcome'
                      ? 'Get Started (On Tap ➔ Smart Animate)'
                      : 'Sign In to Workspace'}
                  </span>
                </button>

                {mobileScreen === 'welcome' ? (
                  <button
                    onClick={() => triggerSmartAnimate('signin')}
                    className="proto-hotspot w-full text-center text-xs text-[#89919e] hover:text-[#9fcaff] py-1 transition-colors"
                  >
                    Already have an account? <span className="underline font-medium">Sign in</span>
                  </button>
                ) : (
                  <button
                    onClick={() => triggerSmartAnimate('welcome')}
                    className="proto-hotspot w-full text-center text-xs text-[#89919e] hover:text-white py-1 transition-colors"
                  >
                    ← Cancel and return to Welcome Screen
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Home Indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-[#52525b] rounded-full z-40" />
          </div>
        )}

        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="absolute bottom-6 bg-[#0d99ff] text-[#002f55] px-4 py-2 rounded-lg font-bold text-xs shadow-2xl animate-slideUp z-50 flex items-center gap-2 border border-white/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{toastMessage}</span>
          </div>
        )}
      </main>
    </div>
  );
};
