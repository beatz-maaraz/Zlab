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
  Layers,
  LayoutDashboard,
  Users,
  Search,
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
  const [mobileScreen, setMobileScreen] = useState<'welcome' | 'signin' | 'projects'>('welcome');
  const [isMorphing, setIsMorphing] = useState(false);
  const [animationDuration, setAnimationDuration] = useState<number>(450);
  const [animationEasing, setAnimationEasing] = useState<'ease-out' | 'spring'>('ease-out');

  // Interactive prototype state variables
  const [protoSystem, setProtoSystem] = useState<'m3' | 'ios'>('ios');
  const [protoSearchQuery, setProtoSearchQuery] = useState('');
  const [protoActiveTab, setProtoActiveTab] = useState<'home' | 'grid' | 'search' | 'profile'>('home');
  const [protoEmail, setProtoEmail] = useState('alex.creator@zlab.app');
  const [protoPassword, setProtoPassword] = useState('password123!');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [selectedGridRow, setSelectedGridRow] = useState<string | null>(null);

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

  // Sample Adaptive Data Grid Items
  const gridItems = [
    { id: '1', title: 'Material 3 Top App Bar', category: 'Header', badge: 'M3 Tonal', time: '2 mins ago' },
    { id: '2', title: 'iOS 18 Translucent Footer Bar', category: 'Footer Tabs', badge: 'HIG Blur', time: '10 mins ago' },
    { id: '3', title: 'Interactive Floating Input', category: 'Form', badge: 'Validated', time: '1 hr ago' },
    { id: '4', title: 'Adaptive Data Grid View', category: 'List View', badge: 'Filterable', time: 'Yesterday' },
  ];

  const filteredGridItems = gridItems.filter(
    (item) =>
      !protoSearchQuery ||
      item.title.toLowerCase().includes(protoSearchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(protoSearchQuery.toLowerCase()) ||
      item.badge.toLowerCase().includes(protoSearchQuery.toLowerCase())
  );

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

        {/* Center: Device & System Switcher */}
        <div className="flex items-center gap-2">
          {/* System Guidelines Switcher */}
          <div className="flex items-center bg-[#202024] p-1 rounded-lg border border-[#2d2d32] text-xs">
            <button
              onClick={() => {
                setProtoSystem('ios');
                showToast('Switched to Apple iOS 18 (HIG) Guidelines');
              }}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                protoSystem === 'ios' ? 'bg-[#007aff] text-white shadow font-semibold' : 'text-[#89919e] hover:text-white'
              }`}
            >
              iOS 18 HIG
            </button>
            <button
              onClick={() => {
                setProtoSystem('m3');
                showToast('Switched to Google Material 3 (M3) Guidelines');
              }}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                protoSystem === 'm3' ? 'bg-[#d0bcff] text-[#381e72] shadow font-bold' : 'text-[#89919e] hover:text-white'
              }`}
            >
              Android M3
            </button>
          </div>

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
              <span>Mobile</span>
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
                Welcome
              </button>
              <button
                onClick={() => triggerSmartAnimate('signin')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  mobileScreen === 'signin'
                    ? 'bg-[#0d99ff] text-[#002f55] font-bold shadow'
                    : 'text-[#89919e] hover:text-white'
                }`}
              >
                Sign-In Form
              </button>
              <button
                onClick={() => triggerSmartAnimate('projects')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  mobileScreen === 'projects'
                    ? 'bg-[#0d99ff] text-[#002f55] font-bold shadow'
                    : 'text-[#89919e] hover:text-white'
                }`}
              >
                Data Grid
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
            <div className="h-9 bg-[#1d1d21] border-b border-[#27272a] px-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
                  <div className="w-3 h-3 rounded-full bg-[#eab308]" />
                  <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
                </div>
                <div className="w-72 h-6 bg-[#111113] rounded-md border border-[#2a2a2e] flex items-center px-2.5 text-[11px] font-mono text-[#89919e]">
                  https://zlab.app/preview/{projectTitle.toLowerCase().replace(/\s+/g, '-')}
                </div>
              </div>

              {/* Dynamic Search Header Action in Desktop Window */}
              <div className="flex items-center gap-2 bg-[#111113] px-3 py-1 rounded-md border border-[#2a2a2e] text-xs">
                <Search className="w-3 h-3 text-[#89919e]" />
                <input
                  type="text"
                  value={protoSearchQuery}
                  onChange={(e) => setProtoSearchQuery(e.target.value)}
                  placeholder="Search prototype data grid..."
                  className="bg-transparent text-white placeholder-[#89919e] outline-none text-xs w-48 font-medium"
                />
              </div>
            </div>

            {/* Desktop Screen Content */}
            <div className="flex-1 overflow-auto bg-[#111113] text-[#e5e2e1] relative flex flex-col">
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
                    Sign-In Form ↗
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

              {/* Desktop Adaptive Data Grid */}
              <div className="p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-white">Adaptive Data Grid View</h3>
                  <span className="text-xs text-[#89919e]">Showing {filteredGridItems.length} elements</span>
                </div>
                <div className="bg-[#17171a] rounded-xl border border-[#27272a] overflow-hidden">
                  <table className="w-full text-left text-xs text-[#e5e2e1]">
                    <thead className="bg-[#202024] text-[#89919e] font-mono text-[11px] border-b border-[#27272a]">
                      <tr>
                        <th className="p-3">Component Title</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Design Token</th>
                        <th className="p-3">Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredGridItems.map((item) => (
                        <tr key={item.id} className="border-b border-[#27272a]/50 hover:bg-[#202024] cursor-pointer">
                          <td className="p-3 font-semibold text-white">{item.title}</td>
                          <td className="p-3 text-[#9fcaff]">{item.category}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#d0bcff]/20 text-[#d0bcff] font-mono">
                              {item.badge}
                            </span>
                          </td>
                          <td className="p-3 text-[#89919e] font-mono">{item.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* MOBILE PHONE FRAME WITH SMART ANIMATE BETWEEN WELCOME, SIGNIN & DATA GRID SCREENS */
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
                <span className="font-mono text-[10px] bg-[#27272a] px-1.5 py-0.5 rounded text-[#9fcaff]">
                  {protoSystem === 'm3' ? 'Android M3' : 'iOS 18 HIG'}
                </span>
                <span>5G</span>
                <div className="w-4 h-2.5 border border-white rounded-sm p-0.5 flex items-center">
                  <div className="w-full h-full bg-white rounded-2xs" />
                </div>
              </div>
            </div>

            {/* Smart Animate Container Stage */}
            <div className="flex-1 overflow-hidden bg-[#121215] text-[#e5e2e1] relative flex flex-col p-5">
              {/* Back button (Appears on Sign-In & Projects Screens) */}
              <div
                style={{
                  transition: easingTransition,
                  opacity: mobileScreen !== 'welcome' ? 1 : 0,
                  transform: mobileScreen !== 'welcome' ? 'translateY(0)' : 'translateY(-14px)',
                  pointerEvents: mobileScreen !== 'welcome' ? 'auto' : 'none',
                }}
                className="mb-2 z-20 flex items-center justify-between"
              >
                <button
                  onClick={() => triggerSmartAnimate('welcome')}
                  className="proto-hotspot inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#201f1f] text-[#9fcaff] hover:bg-[#2a2a2a] text-xs font-semibold border border-[#353534] transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Welcome</span>
                </button>
                <span className="text-xs font-bold text-white tracking-tight">
                  {mobileScreen === 'signin' ? 'Interactive Form' : 'Adaptive Data Grid'}
                </span>
              </div>

              {/* Shared Element 1: Brand Emblem / Logo */}
              <div
                style={{
                  transition: easingTransition,
                  transform:
                    mobileScreen === 'welcome'
                      ? 'translateY(30px) scale(1)'
                      : 'translateY(0px) scale(0.65)',
                }}
                className="flex items-center justify-center my-1"
              >
                <div
                  onClick={() => {
                    if (mobileScreen === 'welcome') triggerSmartAnimate('signin');
                    else triggerSmartAnimate('welcome');
                  }}
                  style={{
                    transition: easingTransition,
                    width: mobileScreen === 'welcome' ? '100px' : '64px',
                    height: mobileScreen === 'welcome' ? '100px' : '64px',
                    borderRadius: mobileScreen === 'welcome' ? '28px' : '18px',
                    backgroundColor: protoSystem === 'm3' ? '#d0bcff' : '#007aff',
                  }}
                  className="proto-hotspot flex flex-col items-center justify-center text-white shadow-2xl relative cursor-pointer group hover:scale-105 transition-transform"
                >
                  <Sparkles
                    style={{
                      transition: easingTransition,
                      width: mobileScreen === 'welcome' ? '30px' : '20px',
                      height: mobileScreen === 'welcome' ? '30px' : '20px',
                    }}
                    className={protoSystem === 'm3' ? 'text-[#381e72]' : 'text-white'}
                  />
                  <span
                    style={{
                      transition: easingTransition,
                      fontSize: mobileScreen === 'welcome' ? '13px' : '9px',
                      color: protoSystem === 'm3' ? '#381e72' : '#ffffff',
                    }}
                    className="font-bold tracking-tight mt-0.5"
                  >
                    ZLab
                  </span>
                </div>
              </div>

              {/* Welcome Screen Content */}
              <div
                style={{
                  transition: easingTransition,
                  opacity: mobileScreen === 'welcome' ? 1 : 0,
                  transform: mobileScreen === 'welcome' ? 'translateY(40px)' : 'translateY(80px)',
                  pointerEvents: mobileScreen === 'welcome' ? 'auto' : 'none',
                  display: mobileScreen === 'welcome' ? 'block' : 'none',
                }}
                className="space-y-4 text-center mt-2"
              >
                <h2 className="text-2xl font-extrabold text-white tracking-tight">
                  Welcome to ZLab Prototype
                </h2>
                <p className="text-xs text-[#89919e] max-w-xs mx-auto">
                  Interactive Material 3 & Apple iOS 18 component suite with dynamic headers, floating label forms, footer tabs, and data grids.
                </p>
                <div className="bg-[#1c1c21] p-3 rounded-2xl border border-[#27272a] text-left text-xs space-y-1">
                  <div className="flex items-center justify-between text-[#9fcaff] font-semibold">
                    <span>Guidelines Standard</span>
                    <span className="font-mono">{protoSystem === 'm3' ? 'Android M3' : 'Apple HIG'}</span>
                  </div>
                  <p className="text-[11px] text-[#89919e]">
                    Floating labels elevate on focus. Dynamic headers filter list views real-time.
                  </p>
                </div>
              </div>

              {/* Interactive Sign-In Screen Form with Floating Labels */}
              <div
                style={{
                  transition: easingTransition,
                  opacity: mobileScreen === 'signin' ? 1 : 0,
                  transform: mobileScreen === 'signin' ? 'translateY(10px)' : 'translateY(60px)',
                  pointerEvents: mobileScreen === 'signin' ? 'auto' : 'none',
                  display: mobileScreen === 'signin' ? 'block' : 'none',
                }}
                className="space-y-3 mt-1"
              >
                {/* Floating Label Email Input */}
                <div
                  className={`bg-[#1c1c21] px-3.5 py-2 rounded-xl border transition-all relative ${
                    emailFocused
                      ? protoSystem === 'm3'
                        ? 'border-[#d0bcff] ring-2 ring-[#d0bcff]/30'
                        : 'border-[#007aff] ring-2 ring-[#007aff]/30'
                      : 'border-[#2d2d32]'
                  }`}
                >
                  <label
                    style={{
                      transition: 'all 0.2s ease-out',
                      transform: emailFocused || protoEmail.length > 0 ? 'translateY(-2px) scale(0.85)' : 'translateY(8px) scale(1)',
                      transformOrigin: 'left top',
                      color: emailFocused ? (protoSystem === 'm3' ? '#d0bcff' : '#007aff') : '#89919e',
                    }}
                    className="text-[11px] font-semibold block pointer-events-none"
                  >
                    Email Address (Floating Label)
                  </label>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Mail className="w-4 h-4 text-[#89919e] shrink-0" />
                    <input
                      type="email"
                      value={protoEmail}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                      onChange={(e) => setProtoEmail(e.target.value)}
                      className="bg-transparent text-white outline-none w-full text-xs font-medium"
                    />
                  </div>
                </div>

                {/* Floating Label Password Input */}
                <div
                  className={`bg-[#1c1c21] px-3.5 py-2 rounded-xl border transition-all relative ${
                    passwordFocused
                      ? protoSystem === 'm3'
                        ? 'border-[#d0bcff] ring-2 ring-[#d0bcff]/30'
                        : 'border-[#007aff] ring-2 ring-[#007aff]/30'
                      : 'border-[#2d2d32]'
                  }`}
                >
                  <label
                    style={{
                      transition: 'all 0.2s ease-out',
                      transform: passwordFocused || protoPassword.length > 0 ? 'translateY(-2px) scale(0.85)' : 'translateY(8px) scale(1)',
                      transformOrigin: 'left top',
                      color: passwordFocused ? (protoSystem === 'm3' ? '#d0bcff' : '#007aff') : '#89919e',
                    }}
                    className="text-[11px] font-semibold block pointer-events-none"
                  >
                    Password (Floating Label)
                  </label>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Lock className="w-4 h-4 text-[#89919e] shrink-0" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={protoPassword}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      onChange={(e) => setProtoPassword(e.target.value)}
                      className="bg-transparent text-white outline-none w-full text-xs font-medium font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[#89919e] hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#89919e]">
                  <span className="flex items-center gap-1 text-[#34d399]">
                    <CheckCircle className="w-3 h-3" /> Valid credentials
                  </span>
                  <span className="hover:text-[#9fcaff] cursor-pointer">Forgot password?</span>
                </div>
              </div>

              {/* Interactive Projects / Adaptive Data Grid Screen */}
              <div
                style={{
                  transition: easingTransition,
                  opacity: mobileScreen === 'projects' ? 1 : 0,
                  transform: mobileScreen === 'projects' ? 'translateY(6px)' : 'translateY(60px)',
                  pointerEvents: mobileScreen === 'projects' ? 'auto' : 'none',
                  display: mobileScreen === 'projects' ? 'block' : 'none',
                }}
                className="space-y-3 mt-1 flex-1 flex flex-col min-h-0"
              >
                {/* Dynamic Header Integrated Search */}
                <div className="bg-[#1c1c21] p-2 rounded-xl border border-[#2d2d32] flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-[#89919e] shrink-0 ml-1" />
                  <input
                    type="text"
                    value={protoSearchQuery}
                    onChange={(e) => setProtoSearchQuery(e.target.value)}
                    placeholder="Search data grid..."
                    className="bg-transparent text-white outline-none text-xs w-full placeholder-[#89919e]"
                  />
                  {protoSearchQuery && (
                    <button onClick={() => setProtoSearchQuery('')} className="text-[#89919e]">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Adaptive Data Grid List */}
                <div className="space-y-2 flex-1 overflow-auto">
                  {filteredGridItems.length === 0 ? (
                    <div className="text-center py-6 text-[#89919e] text-xs">
                      No matching records for &quot;{protoSearchQuery}&quot;
                    </div>
                  ) : (
                    filteredGridItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setSelectedGridRow(item.id);
                          showToast(`Selected grid item: ${item.title}`);
                        }}
                        className={`flex items-center gap-3 p-2.5 rounded-xl border transition-colors cursor-pointer ${
                          selectedGridRow === item.id
                            ? protoSystem === 'm3'
                              ? 'bg-[#d0bcff]/20 border-[#d0bcff]'
                              : 'bg-[#007aff]/20 border-[#007aff]'
                            : 'bg-[#1c1c21] border-[#2d2d32] hover:border-[#89919e]'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#27272a] flex items-center justify-center text-xs font-bold text-white">
                          {item.id}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <div className="text-xs font-semibold text-white truncate">{item.title}</div>
                          <div className="text-[10px] text-[#89919e] flex items-center gap-2">
                            <span>{item.category}</span>
                            <span>•</span>
                            <span className="font-mono text-[#9fcaff]">{item.badge}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer Navigation Tabs */}
                <div className="flex items-center justify-around w-full pt-2 border-t border-[#2d2d32] text-[10px] text-[#89919e]">
                  <button
                    onClick={() => {
                      setProtoActiveTab('home');
                      triggerSmartAnimate('welcome');
                    }}
                    className={`flex flex-col items-center gap-1 ${
                      protoActiveTab === 'home'
                        ? protoSystem === 'm3'
                          ? 'text-[#d0bcff] font-bold'
                          : 'text-[#007aff] font-bold'
                        : ''
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Home</span>
                  </button>
                  <button
                    onClick={() => {
                      setProtoActiveTab('grid');
                      triggerSmartAnimate('projects');
                    }}
                    className={`flex flex-col items-center gap-1 ${
                      protoActiveTab === 'grid'
                        ? protoSystem === 'm3'
                          ? 'text-[#d0bcff] font-bold'
                          : 'text-[#007aff] font-bold'
                        : ''
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    <span>Grid</span>
                  </button>
                  <button
                    onClick={() => {
                      setProtoActiveTab('search');
                      triggerSmartAnimate('projects');
                    }}
                    className={`flex flex-col items-center gap-1 ${
                      protoActiveTab === 'search'
                        ? protoSystem === 'm3'
                          ? 'text-[#d0bcff] font-bold'
                          : 'text-[#007aff] font-bold'
                        : ''
                    }`}
                  >
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </button>
                </div>
              </div>

              {/* Bottom Primary Action Button */}
              <div className="mt-auto pt-3">
                <button
                  onClick={() => {
                    if (mobileScreen === 'welcome') {
                      triggerSmartAnimate('signin');
                    } else if (mobileScreen === 'signin') {
                      showToast('Successfully signed in! Navigating to Data Grid...');
                      triggerSmartAnimate('projects');
                    } else {
                      triggerSmartAnimate('welcome');
                    }
                  }}
                  style={{
                    transition: easingTransition,
                    backgroundColor:
                      mobileScreen === 'welcome'
                        ? protoSystem === 'm3'
                          ? '#d0bcff'
                          : '#007aff'
                        : mobileScreen === 'projects'
                        ? '#201f1f'
                        : '#0d99ff',
                    color:
                      mobileScreen === 'welcome'
                        ? protoSystem === 'm3'
                          ? '#381e72'
                          : '#ffffff'
                        : '#ffffff',
                  }}
                  className="proto-hotspot w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all hover:brightness-110 active:scale-98"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {mobileScreen === 'welcome'
                      ? 'Get Started (Interactive Prototype)'
                      : mobileScreen === 'projects'
                      ? 'Return to Welcome Screen'
                      : 'Sign In to Workspace'}
                  </span>
                </button>
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
