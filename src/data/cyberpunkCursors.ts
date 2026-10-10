/**
 * ZLAB Cyberpunk HUD Cursor Design System
 * Sleek dark metallic obsidian with glowing cyan neon edges and glassmorphism transparency.
 */

import { CanvasElement } from '../types';

export interface CyberpunkCursor {
  id: string;
  category: 'Default Pointers' | 'Selection' | 'Text Input' | 'Wait & Progress' | 'Resize' | 'Precision & Editing';
  name: string;
  codeName: string;
  description: string;
  hotspot: { x: number; y: number };
  svgRaw: string;
  svgDataUri: string;
  specs: {
    baseMaterial: string;
    neonGlow: string;
    opticalIndex: string;
    scale: string;
  };
}

// Helpers to encode SVGs for cursor: url()
function createCursorDataUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim().replace(/\s+/g, ' '))}`;
}

export const CYBERPUNK_CURSORS: CyberpunkCursor[] = [
  // 1. Multiple Directional Default Arrow Pointers
  {
    id: 'pointer-chevron-prime',
    category: 'Default Pointers',
    name: 'Angled Chevron Prime',
    codeName: 'PTR_CHEVRON_v4',
    description: 'Sleek angled chevron with obsidian carbon-fiber chassis and glowing cyan plasma tip',
    hotspot: { x: 2, y: 2 },
    specs: {
      baseMaterial: 'Obsidian #080c14 / Carbon Mesh',
      neonGlow: 'Cyan Plasma #00f0ff (0 0 8px)',
      opticalIndex: 'IOR 1.48 Glass Finish',
      scale: '32 × 32 px (8K HiDPI Vector)',
    },
    svgRaw: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
      <defs>
        <filter id="glow-cyan" x="-20%" y="-20%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="obsidian-grad-1" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#182335" stop-opacity="0.95" />
          <stop offset="60%" stop-color="#090d15" stop-opacity="0.95" />
          <stop offset="100%" stop-color="#05080f" stop-opacity="0.98" />
        </linearGradient>
      </defs>
      <!-- Drop Shadow -->
      <path d="M4 2 L22 17 L14 18 L19 28 L14 30 L9 20 L4 25 Z" fill="#000" opacity="0.6" transform="translate(1, 1.5)" />
      <!-- Main Metallic Body -->
      <path d="M4 2 L22 17 L14 18 L19 28 L14 30 L9 20 L4 25 Z" fill="url(#obsidian-grad-1)" stroke="#00f0ff" stroke-width="1.2" stroke-linejoin="round" filter="url(#glow-cyan)" />
      <!-- Inner Core Neon Accent -->
      <path d="M6 5 L18 15 L12 16 L16 25 L13 26.5 L9.5 18 L6 21 Z" fill="#00f0ff" fill-opacity="0.18" />
      <!-- Cyan Laser Emitter Tip -->
      <circle cx="4" cy="2" r="2.2" fill="#ffffff" stroke="#00f0ff" stroke-width="1" filter="url(#glow-cyan)" />
      <circle cx="4" cy="2" r="1" fill="#00f0ff" />
      <!-- Futuristic Accent Tick -->
      <line x1="12" y1="18" x2="16" y2="26" stroke="#00f0ff" stroke-width="0.8" stroke-dasharray="1 2" />
    </svg>`,
    svgDataUri: '',
  },
  {
    id: 'pointer-stealth-dart',
    category: 'Default Pointers',
    name: 'Stealth Dart Chevrons',
    codeName: 'PTR_DART_AERO',
    description: 'High-velocity aerodynamic stealth pointer with trailing cyan photon beacon',
    hotspot: { x: 3, y: 3 },
    specs: {
      baseMaterial: 'Matte Obsidian Alloy',
      neonGlow: 'Vibrant Aqua #00e5ff (0 0 6px)',
      opticalIndex: 'Low Refraction Stealth Specular',
      scale: '32 × 32 px Vector',
    },
    svgRaw: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
      <defs>
        <filter id="glow-dart" x="-20%" y="-20%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="dart-grad" x1="0" y1="0" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#1d283a" />
          <stop offset="100%" stop-color="#0a0d13" />
        </linearGradient>
      </defs>
      <!-- Shadow -->
      <path d="M3 3 L23 13 L15 15 L17 25 L13 26 L10 17 L3 20 Z" fill="#000" opacity="0.6" transform="translate(1, 1)" />
      <!-- Obsidian Body -->
      <path d="M3 3 L23 13 L15 15 L17 25 L13 26 L10 17 L3 20 Z" fill="url(#dart-grad)" stroke="#00e5ff" stroke-width="1.2" stroke-linejoin="round" filter="url(#glow-dart)" />
      <!-- Laser Edge Notch -->
      <line x1="3" y1="3" x2="23" y2="13" stroke="#ffffff" stroke-width="0.8" opacity="0.8" />
      <circle cx="3" cy="3" r="1.8" fill="#ffffff" stroke="#00e5ff" stroke-width="1" />
      <circle cx="15" cy="15" r="1.2" fill="#00e5ff" />
      <line x1="10" y1="17" x2="16" y2="25" stroke="#00e5ff" stroke-width="0.75" />
    </svg>`,
    svgDataUri: '',
  },
  {
    id: 'pointer-subnode-chevron',
    category: 'Default Pointers',
    name: 'Sub-Node Micro Chevron',
    codeName: 'PTR_SUBNODE_45',
    description: 'Precision 45-degree micro-chevron with tactical coordinate lock-on brackets',
    hotspot: { x: 4, y: 4 },
    specs: {
      baseMaterial: 'Deep Obsidian Titanium',
      neonGlow: 'Electric Neon Cyan #00f0ff',
      opticalIndex: 'Anti-Glare Polarized',
      scale: '32 × 32 px Vector',
    },
    svgRaw: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
      <defs>
        <filter id="glow-sub" x="-20%" y="-20%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.2" result="b" /><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <path d="M4 4 L21 15 L13 16 L17 26 L13 27 L9 18 L4 22 Z" fill="#0c111c" stroke="#00f0ff" stroke-width="1.4" filter="url(#glow-sub)" stroke-linejoin="round"/>
      <circle cx="4" cy="4" r="2.5" fill="#00f0ff" fill-opacity="0.3"/>
      <circle cx="4" cy="4" r="1.2" fill="#fff"/>
      <!-- Target Corner Brackets -->
      <path d="M22 6 L26 6 L26 10" stroke="#00f0ff" stroke-width="0.8" opacity="0.7"/>
      <circle cx="24" cy="8" r="0.8" fill="#00f0ff"/>
    </svg>`,
    svgDataUri: '',
  },

  // 2. Selection Cursors
  {
    id: 'select-cybernetic-hand',
    category: 'Selection',
    name: 'Cybernetic Hand (Index Pointer)',
    codeName: 'SEL_CYBER_HAND',
    description: 'Sleek robotic exo-skeleton hand with glowing cyan index finger emitter and joint telemetry',
    hotspot: { x: 8, y: 2 },
    specs: {
      baseMaterial: 'Articulated Obsidian Metal',
      neonGlow: 'Index Laser Emitter #00f0ff',
      opticalIndex: 'Haptic Feedback Pulse Rings',
      scale: '32 × 32 px Vector',
    },
    svgRaw: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
      <defs>
        <filter id="glow-hand" x="-20%" y="-20%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <linearGradient id="hand-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#1a2538" />
          <stop offset="100%" stop-color="#080c14" />
        </linearGradient>
      </defs>
      <!-- Shadow -->
      <path d="M8 2 L12 2 L12 12 L15 12 L15 14 L18 14 L18 16 L21 16 L21 21 C21 26 18 29 12 29 C7 29 5 26 5 21 L5 15 L8 15 Z" fill="#000" opacity="0.6" transform="translate(1, 1.5)" />
      <!-- Cybernetic Hand Contour -->
      <path d="M8 2 L12 2 L12 12 L15 12 L15 14 L18 14 L18 16 L21 16 L21 21 C21 26 18 29 12 29 C7 29 5 21 5 19 L5 15 L8 15 Z" fill="url(#hand-grad)" stroke="#00f0ff" stroke-width="1.2" stroke-linejoin="round" filter="url(#glow-hand)" />
      <!-- Glowing Index Finger Emitter -->
      <line x1="10" y1="2" x2="10" y2="12" stroke="#ffffff" stroke-width="1.2" />
      <circle cx="10" cy="2" r="2.2" fill="#ffffff" stroke="#00f0ff" stroke-width="1" filter="url(#glow-hand)" />
      <circle cx="10" cy="2" r="1" fill="#00f0ff" />
      <!-- Articulated Joint Knuckles -->
      <circle cx="10" cy="8" r="1" fill="#00f0ff" />
      <circle cx="13.5" cy="14" r="0.9" fill="#00f0ff" />
      <circle cx="16.5" cy="16" r="0.9" fill="#00f0ff" />
      <circle cx="19.5" cy="18" r="0.9" fill="#00f0ff" />
      <!-- Palm Repulsor Core -->
      <circle cx="12" cy="23" r="2" fill="#00f0ff" fill-opacity="0.4" stroke="#00f0ff" stroke-width="0.75" />
      <circle cx="12" cy="23" r="0.8" fill="#fff" />
    </svg>`,
    svgDataUri: '',
  },
  {
    id: 'select-repulsor-pan',
    category: 'Selection',
    name: 'Repulsor Palm (Pan Mode)',
    codeName: 'SEL_REPULSOR_OPEN',
    description: 'Open cybernetic robotic palm with glowing palm reactor coil for panning & dragging',
    hotspot: { x: 16, y: 16 },
    specs: {
      baseMaterial: 'Exo-Alloy Composite Plates',
      neonGlow: 'Dual Cyan Glow Ring #00ffa3',
      opticalIndex: 'Kinetic Drag Stabilizer',
      scale: '32 × 32 px Vector',
    },
    svgRaw: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
      <defs>
        <filter id="glow-rep" x="-20%" y="-20%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <!-- Palm Outline -->
      <path d="M8 8 L10 4 L13 4 L13 10 L15 3 L18 3 L18 10 L20 4 L23 4 L23 12 L25 8 L27 9 L26 17 C25 24 20 28 14 28 C9 28 6 24 6 18 L6 13 L8 12 Z" fill="#090d15" stroke="#00f0ff" stroke-width="1.2" stroke-linejoin="round" filter="url(#glow-rep)" />
      <!-- Glowing Palm Coil -->
      <circle cx="16" cy="19" r="3.5" fill="#00f0ff" fill-opacity="0.3" stroke="#00f0ff" stroke-width="1" />
      <circle cx="16" cy="19" r="1.5" fill="#ffffff" />
      <line x1="16" y1="13" x2="16" y2="16" stroke="#00f0ff" stroke-width="0.8" />
    </svg>`,
    svgDataUri: '',
  },
  {
    id: 'select-clench-fist',
    category: 'Selection',
    name: 'Hydraulic Clench (Grabbing)',
    codeName: 'SEL_CLENCH_FIST',
    description: 'Pressurized cybernetic fist with glowing interlocked knuckles for active grab states',
    hotspot: { x: 16, y: 16 },
    specs: {
      baseMaterial: 'Tempered Obsidian Chrome',
      neonGlow: 'Cyan High-Torque Aura',
      opticalIndex: 'Shock Absorption Lattice',
      scale: '32 × 32 px Vector',
    },
    svgRaw: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
      <defs>
        <filter id="glow-clench" x="-20%" y="-20%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <rect x="7" y="9" width="18" height="15" rx="5" fill="#080d16" stroke="#00f0ff" stroke-width="1.3" filter="url(#glow-clench)" />
      <!-- Knuckle Segments -->
      <line x1="12" y1="9" x2="12" y2="19" stroke="#00f0ff" stroke-width="0.8" stroke-dasharray="2 1" />
      <line x1="16" y1="9" x2="16" y2="19" stroke="#00f0ff" stroke-width="0.8" stroke-dasharray="2 1" />
      <line x1="20" y1="9" x2="20" y2="19" stroke="#00f0ff" stroke-width="0.8" stroke-dasharray="2 1" />
      <circle cx="16" cy="15" r="2.2" fill="#00f0ff" fill-opacity="0.4" stroke="#00f0ff" stroke-width="0.8" />
      <circle cx="16" cy="15" r="1" fill="#ffffff" />
    </svg>`,
    svgDataUri: '',
  },

  // 3. Text Input Cursors
  {
    id: 'text-laser-ibeam',
    category: 'Text Input',
    name: 'Laser Plasma I-Beam',
    codeName: 'TXT_LASER_IBEAM',
    description: 'Twin magnetic stabilizer rails with pulsing neon cyan plasma beam and center reticle',
    hotspot: { x: 16, y: 16 },
    specs: {
      baseMaterial: 'Titanium Magnetic Stabilizers',
      neonGlow: 'Continuous Cyan Plasma Beam #00f0ff',
      opticalIndex: 'Micro-Coordinate Vernier Scale',
      scale: '32 × 32 px Vector',
    },
    svgRaw: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
      <defs>
        <filter id="glow-beam" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <!-- Top Rail Bar -->
      <path d="M10 5 L22 5 L20 8 L12 8 Z" fill="#0c121e" stroke="#00f0ff" stroke-width="1.2" filter="url(#glow-beam)" />
      <!-- Bottom Rail Bar -->
      <path d="M10 27 L22 27 L20 24 L12 24 Z" fill="#0c121e" stroke="#00f0ff" stroke-width="1.2" filter="url(#glow-beam)" />
      <!-- Central Laser Plasma Beam -->
      <line x1="16" y1="7" x2="16" y2="25" stroke="#00f0ff" stroke-width="2" filter="url(#glow-beam)" />
      <line x1="16" y1="7" x2="16" y2="25" stroke="#ffffff" stroke-width="0.9" />
      <!-- Center Precision Target Cross -->
      <line x1="13" y1="16" x2="19" y2="16" stroke="#00f0ff" stroke-width="1" />
      <circle cx="16" cy="16" r="1.5" fill="#ffffff" />
      <!-- End Nodes -->
      <circle cx="16" cy="6" r="1.2" fill="#00f0ff" />
      <circle cx="16" cy="26" r="1.2" fill="#00f0ff" />
    </svg>`,
    svgDataUri: '',
  },
  {
    id: 'text-precision-brackets',
    category: 'Text Input',
    name: 'Precision Optical Brackets',
    codeName: 'TXT_CALIPER_HUD',
    description: 'Futuristic optical HUD calipers with glowing cursor center, coordinate ticks, and font-metrics alignment',
    hotspot: { x: 16, y: 16 },
    specs: {
      baseMaterial: 'Obsidian Caliper Shroud',
      neonGlow: 'Dual Cyan Guides #00f0ff',
      opticalIndex: 'Typography Baseline Calibrator',
      scale: '32 × 32 px Vector',
    },
    svgRaw: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
      <defs>
        <filter id="glow-brack" x="-20%" y="-20%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <!-- Left Caliper Bracket -->
      <path d="M12 6 L8 6 L8 26 L12 26" stroke="#00f0ff" stroke-width="1.4" stroke-linecap="round" filter="url(#glow-brack)" />
      <!-- Right Caliper Bracket -->
      <path d="M20 6 L24 6 L24 26 L20 26" stroke="#00f0ff" stroke-width="1.4" stroke-linecap="round" filter="url(#glow-brack)" />
      <!-- Center Laser Insertion Line -->
      <line x1="16" y1="8" x2="16" y2="24" stroke="#00f0ff" stroke-width="1.2" stroke-dasharray="3 2" />
      <circle cx="16" cy="16" r="1.8" fill="#ffffff" stroke="#00f0ff" stroke-width="0.8" />
    </svg>`,
    svgDataUri: '',
  },

  // 4. Wait and Progress Indicators
  {
    id: 'wait-quantum-ring',
    category: 'Wait & Progress',
    name: 'Rotating Quantum Data Ring',
    codeName: 'WAIT_QUANTUM_ORBIT',
    description: 'Dual concentric gyro data rings with segmented telemetry buffer and rotating cyan orbital nodes',
    hotspot: { x: 16, y: 16 },
    specs: {
      baseMaterial: 'Obsidian Gyro Suspension',
      neonGlow: 'High-Frequency Neon Cyan #00f0ff',
      opticalIndex: '360° Rotational Gyroscope',
      scale: '32 × 32 px Animated/Vector',
    },
    svgRaw: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
      <defs>
        <filter id="glow-ring" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <!-- Outer Dark Ring Base -->
      <circle cx="16" cy="16" r="13" stroke="#0e1726" stroke-width="2.5" />
      <!-- Glowing Cyan Progress Arc -->
      <circle cx="16" cy="16" r="13" stroke="#00f0ff" stroke-width="2" stroke-dasharray="45 25" stroke-linecap="round" filter="url(#glow-ring)" />
      <!-- Inner Ring -->
      <circle cx="16" cy="16" r="7" stroke="#00f0ff" stroke-width="1" stroke-dasharray="10 8" opacity="0.8" />
      <!-- Core Pulsing Node -->
      <circle cx="16" cy="16" r="2.5" fill="#ffffff" stroke="#00f0ff" stroke-width="1" filter="url(#glow-ring)" />
      <!-- Orbiting Satellite Data Bead -->
      <circle cx="28" cy="13" r="1.5" fill="#00ffa3" />
      <circle cx="4" cy="19" r="1.2" fill="#00f0ff" />
    </svg>`,
    svgDataUri: '',
  },
  {
    id: 'wait-cyber-hourglass',
    category: 'Wait & Progress',
    name: 'Digital Cyber-Hourglass',
    codeName: 'WAIT_CHRONO_CELL',
    description: 'Futuristic digital chronometer with downward-streaming cyan chroniton particle data flow',
    hotspot: { x: 16, y: 16 },
    specs: {
      baseMaterial: 'Obsidian Casing Glass Capsule',
      neonGlow: 'Chroniton Flux #00e5ff',
      opticalIndex: 'Dual-Chamber Particle Simulation',
      scale: '32 × 32 px Vector',
    },
    svgRaw: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
      <defs>
        <filter id="glow-chrono" x="-20%" y="-20%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <!-- Hourglass Geometric Chassis -->
      <path d="M8 5 L24 5 L18 16 L24 27 L8 27 L14 16 Z" fill="#070b13" stroke="#00f0ff" stroke-width="1.3" stroke-linejoin="round" filter="url(#glow-chrono)" />
      <!-- Upper Data Fluid Chamber -->
      <path d="M10 8 L22 8 L18 14 L14 14 Z" fill="#00f0ff" fill-opacity="0.35" />
      <!-- Lower Data Pool Chamber -->
      <path d="M11 25 L21 25 L18 20 L14 20 Z" fill="#00f0ff" fill-opacity="0.75" />
      <!-- Particle Stream Center -->
      <line x1="16" y1="14" x2="16" y2="20" stroke="#ffffff" stroke-width="1.2" stroke-dasharray="1.5 1" />
      <circle cx="16" cy="16" r="1" fill="#fff" />
    </svg>`,
    svgDataUri: '',
  },

  // 5. Resize Arrows
  {
    id: 'resize-horizontal-spear',
    category: 'Resize',
    name: 'Horizontal Expansion Beam',
    codeName: 'RSZ_EW_SPEAR',
    description: 'Bi-directional laser spears with chevron arrowheads, obsidian center lock, and dimension indicators',
    hotspot: { x: 16, y: 16 },
    specs: {
      baseMaterial: 'Obsidian Lock Hub',
      neonGlow: 'Twin Lateral Cyan Emitters',
      opticalIndex: 'Horizontal Width Constrained',
      scale: '32 × 32 px Vector',
    },
    svgRaw: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
      <defs>
        <filter id="glow-rsz-h" x="-20%" y="-20%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <!-- Horizontal Connecting Rail -->
      <line x1="5" y1="16" x2="27" y2="16" stroke="#00f0ff" stroke-width="1.8" filter="url(#glow-rsz-h)" />
      <line x1="5" y1="16" x2="27" y2="16" stroke="#ffffff" stroke-width="0.8" />
      <!-- Left Arrowhead -->
      <path d="M9 11 L3 16 L9 21 L8 16 Z" fill="#080d17" stroke="#00f0ff" stroke-width="1.2" stroke-linejoin="round" />
      <!-- Right Arrowhead -->
      <path d="M23 11 L29 16 L23 21 L24 16 Z" fill="#080d17" stroke="#00f0ff" stroke-width="1.2" stroke-linejoin="round" />
      <!-- Center Lock Hub -->
      <rect x="13" y="12" width="6" height="8" rx="2" fill="#080d17" stroke="#00f0ff" stroke-width="1.2" />
      <circle cx="16" cy="16" r="1.2" fill="#ffffff" />
    </svg>`,
    svgDataUri: '',
  },
  {
    id: 'resize-vertical-spear',
    category: 'Resize',
    name: 'Vertical Expansion Beam',
    codeName: 'RSZ_NS_SPEAR',
    description: 'Bi-directional optical guides with glowing neon tips and vertical height dimension ticks',
    hotspot: { x: 16, y: 16 },
    specs: {
      baseMaterial: 'Obsidian Lock Hub',
      neonGlow: 'Twin Vertical Cyan Emitters',
      opticalIndex: 'Vertical Height Constrained',
      scale: '32 × 32 px Vector',
    },
    svgRaw: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
      <defs>
        <filter id="glow-rsz-v" x="-20%" y="-20%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <!-- Vertical Rail -->
      <line x1="16" y1="5" x2="16" y2="27" stroke="#00f0ff" stroke-width="1.8" filter="url(#glow-rsz-v)" />
      <line x1="16" y1="5" x2="16" y2="27" stroke="#ffffff" stroke-width="0.8" />
      <!-- Top Arrowhead -->
      <path d="M11 9 L16 3 L21 9 L16 8 Z" fill="#080d17" stroke="#00f0ff" stroke-width="1.2" stroke-linejoin="round" />
      <!-- Bottom Arrowhead -->
      <path d="M11 23 L16 29 L21 23 L16 24 Z" fill="#080d17" stroke="#00f0ff" stroke-width="1.2" stroke-linejoin="round" />
      <!-- Center Lock Hub -->
      <rect x="12" y="13" width="8" height="6" rx="2" fill="#080d17" stroke="#00f0ff" stroke-width="1.2" />
      <circle cx="16" cy="16" r="1.2" fill="#ffffff" />
    </svg>`,
    svgDataUri: '',
  },
  {
    id: 'resize-diagonal-nwse',
    category: 'Resize',
    name: 'Diagonal 45° Dual-Axis Guide',
    codeName: 'RSZ_DIAG_NWSE',
    description: '45-degree angled holographic dimension arrows for corner scaling and aspect-ratio preservation',
    hotspot: { x: 16, y: 16 },
    specs: {
      baseMaterial: 'Corner Precision Shroud',
      neonGlow: 'Dual Cyan Thrust #00f0ff',
      opticalIndex: 'Aspect Proportional Lock',
      scale: '32 × 32 px Vector',
    },
    svgRaw: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
      <defs>
        <filter id="glow-diag" x="-20%" y="-20%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <line x1="7" y1="7" x2="25" y2="25" stroke="#00f0ff" stroke-width="1.8" filter="url(#glow-diag)" />
      <line x1="7" y1="7" x2="25" y2="25" stroke="#fff" stroke-width="0.8" />
      <!-- Top-Left Head -->
      <path d="M6 14 L6 6 L14 6 L10 10 Z" fill="#080d17" stroke="#00f0ff" stroke-width="1.2" stroke-linejoin="round" />
      <!-- Bottom-Right Head -->
      <path d="M26 18 L26 26 L18 26 L22 22 Z" fill="#080d17" stroke="#00f0ff" stroke-width="1.2" stroke-linejoin="round" />
      <!-- Center Lock -->
      <circle cx="16" cy="16" r="3" fill="#080d17" stroke="#00f0ff" stroke-width="1.2" />
      <circle cx="16" cy="16" r="1.2" fill="#fff" />
    </svg>`,
    svgDataUri: '',
  },
  {
    id: 'resize-omni-move',
    category: 'Resize',
    name: 'Omnidirectional 4-Way Thruster',
    codeName: 'RSZ_OMNI_MOVE',
    description: 'Four-point plasma thruster cross with center target bead for multi-directional element dragging',
    hotspot: { x: 16, y: 16 },
    specs: {
      baseMaterial: 'Quad-Vector Obsidian Hub',
      neonGlow: 'Full 360° Cyan Thrust Array',
      opticalIndex: 'Cartesian Coordinate Panner',
      scale: '32 × 32 px Vector',
    },
    svgRaw: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
      <defs>
        <filter id="glow-omni" x="-20%" y="-20%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <!-- Cross Arms -->
      <line x1="5" y1="16" x2="27" y2="16" stroke="#00f0ff" stroke-width="1.6" filter="url(#glow-omni)" />
      <line x1="16" y1="5" x2="16" y2="27" stroke="#00f0ff" stroke-width="1.6" filter="url(#glow-omni)" />
      <!-- Arrow Heads -->
      <path d="M16 2 L12 7 L20 7 Z" fill="#00f0ff" />
      <path d="M16 30 L12 25 L20 25 Z" fill="#00f0ff" />
      <path d="M2 16 L7 12 L7 20 Z" fill="#00f0ff" />
      <path d="M30 16 L25 12 L25 20 Z" fill="#00f0ff" />
      <!-- Center Reactor Core -->
      <circle cx="16" cy="16" r="3.5" fill="#080c14" stroke="#00f0ff" stroke-width="1.4" />
      <circle cx="16" cy="16" r="1.5" fill="#ffffff" />
    </svg>`,
    svgDataUri: '',
  },

  // 6. Precision & Editing Crosshairs
  {
    id: 'precision-tactical-reticle',
    category: 'Precision & Editing',
    name: 'Targeted Tactical Reticle',
    codeName: 'RETICLE_TACTICAL_HUD',
    description: 'Precision crosshair with circular targeting perimeter, corner bracket ticks, and sub-pixel center dot',
    hotspot: { x: 16, y: 16 },
    specs: {
      baseMaterial: 'Optical Micro-Machined Reticle',
      neonGlow: 'Sub-Pixel Cyan Laser #00f0ff',
      opticalIndex: 'Zero Parallax Calibration',
      scale: '32 × 32 px Vector',
    },
    svgRaw: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
      <defs>
        <filter id="glow-ret" x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="1.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <!-- Circular Perimeter -->
      <circle cx="16" cy="16" r="11" stroke="#00f0ff" stroke-width="1.2" stroke-dasharray="4 3" filter="url(#glow-ret)" />
      <!-- Inner Inner Ring -->
      <circle cx="16" cy="16" r="5" stroke="#00f0ff" stroke-width="0.8" opacity="0.6" />
      <!-- Crosshairs with Center Gap -->
      <line x1="16" y1="3" x2="16" y2="10" stroke="#00f0ff" stroke-width="1.4" />
      <line x1="16" y1="22" x2="16" y2="29" stroke="#00f0ff" stroke-width="1.4" />
      <line x1="3" y1="16" x2="10" y2="16" stroke="#00f0ff" stroke-width="1.4" />
      <line x1="22" y1="16" x2="29" y2="16" stroke="#00f0ff" stroke-width="1.4" />
      <!-- Center Pinpoint Red Dot -->
      <circle cx="16" cy="16" r="1.5" fill="#ffffff" stroke="#00f0ff" stroke-width="1" filter="url(#glow-ret)" />
    </svg>`,
    svgDataUri: '',
  },
  {
    id: 'precision-vector-pen',
    category: 'Precision & Editing',
    name: 'Vector Pen Node Emitter',
    codeName: 'PEN_VECTOR_NODE',
    description: 'Architectural vector pen nib with glowing laser emitter tip and tangent bezier handle calibrators',
    hotspot: { x: 2, y: 30 },
    specs: {
      baseMaterial: 'Sculpted Obsidian Pen Nib',
      neonGlow: 'Vector Node Laser Tip',
      opticalIndex: 'Cubic Bezier Alignment',
      scale: '32 × 32 px Vector',
    },
    svgRaw: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
      <defs>
        <filter id="glow-pen" x="-20%" y="-20%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <linearGradient id="pen-grad" x1="30" y1="2" x2="5" y2="27" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#192437" />
          <stop offset="100%" stop-color="#080c14" />
        </linearGradient>
      </defs>
      <!-- Pen Body -->
      <path d="M29 3 L22 10 L13 19 L12 24 L7 29 L3 30 L4 26 L9 21 L14 20 L23 11 Z" fill="url(#pen-grad)" stroke="#00f0ff" stroke-width="1.2" stroke-linejoin="round" filter="url(#glow-pen)" />
      <!-- Split Nib Center -->
      <line x1="3" y1="30" x2="12" y2="21" stroke="#00f0ff" stroke-width="0.8" />
      <!-- Laser Emitter Bead at Pen Tip -->
      <circle cx="3" cy="30" r="2" fill="#ffffff" stroke="#00f0ff" stroke-width="1" filter="url(#glow-pen)" />
      <!-- Breather Hole -->
      <circle cx="12" cy="21" r="1.2" fill="#00f0ff" />
      <!-- Tangent Handle Indicator Line -->
      <line x1="20" y1="6" x2="27" y2="13" stroke="#00f0ff" stroke-width="0.75" stroke-dasharray="1 1" />
    </svg>`,
    svgDataUri: '',
  },
  {
    id: 'precision-snap-caliper',
    category: 'Precision & Editing',
    name: 'Magnetic Snap Caliper',
    codeName: 'SNAP_LOCK_CALIPER',
    description: 'Target lock HUD brackets for smart guide snapping, anchor locking, and distance measurement',
    hotspot: { x: 16, y: 16 },
    specs: {
      baseMaterial: 'Obsidian Lock Frame',
      neonGlow: 'Dual Cyan Magnetic Brackets',
      opticalIndex: 'Smart Guide Grid Lock',
      scale: '32 × 32 px Vector',
    },
    svgRaw: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
      <defs>
        <filter id="glow-snap" x="-20%" y="-20%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <!-- Top Left Bracket -->
      <path d="M7 13 L7 7 L13 7" stroke="#00f0ff" stroke-width="1.8" stroke-linecap="round" filter="url(#glow-snap)" />
      <!-- Top Right Bracket -->
      <path d="M25 13 L25 7 L19 7" stroke="#00f0ff" stroke-width="1.8" stroke-linecap="round" filter="url(#glow-snap)" />
      <!-- Bottom Left Bracket -->
      <path d="M7 19 L7 25 L13 25" stroke="#00f0ff" stroke-width="1.8" stroke-linecap="round" filter="url(#glow-snap)" />
      <!-- Bottom Right Bracket -->
      <path d="M25 19 L25 25 L19 25" stroke="#00f0ff" stroke-width="1.8" stroke-linecap="round" filter="url(#glow-snap)" />
      <!-- Target Center Cross -->
      <circle cx="16" cy="16" r="2.2" fill="#ffffff" stroke="#00f0ff" stroke-width="1" filter="url(#glow-snap)" />
      <circle cx="16" cy="16" r="0.8" fill="#00f0ff" />
    </svg>`,
    svgDataUri: '',
  },
];

// Populate data URIs
CYBERPUNK_CURSORS.forEach((c) => {
  c.svgDataUri = createCursorDataUri(c.svgRaw);
});

/**
 * Generate Canvas Elements for the ZLAB Cyberpunk HUD Cursor Design System Sheet
 * This inserts a full-fledged master artboard on the canvas.
 */
export function getCyberpunkCursorKitElements(startX = 0, startY = 0): Record<string, CanvasElement> {
  const elements: Record<string, CanvasElement> = {};

  const masterFrameId = 'desktop-1440';
  // Master Desktop Artboard Frame (1440x900)
  elements[masterFrameId] = {
    id: masterFrameId,
    name: 'ZLAB // Cyberpunk HUD Cursor System (8K Master)',
    type: 'frame',
    x: startX,
    y: startY,
    width: 1440,
    height: 900,
    rotation: 0,
    borderRadius: 8,
    fill: '#06090e',
    fillOpacity: 100,
    stroke: '#00f0ff',
    strokeWidth: 1.5,
    shadowBlur: 36,
    shadowY: 12,
    shadowSpread: 2,
    visible: true,
    locked: false,
  };

  // Mobile App View Frame (390x844) for seamless mobile preview switching
  elements['mobile-app-view'] = {
    id: 'mobile-app-view',
    name: 'Cyberpunk Mobile HUD',
    type: 'frame',
    x: 0,
    y: 0,
    width: 390,
    height: 844,
    rotation: 0,
    borderRadius: 44,
    fill: '#06090e',
    fillOpacity: 100,
    stroke: '#00f0ff',
    strokeWidth: 2,
    shadowBlur: 32,
    shadowY: 12,
    shadowSpread: 0,
    visible: true,
    locked: false,
  };

  // Top Cyberpunk HUD Header Banner (Desktop)
  elements['hud-header-bar'] = {
    id: 'hud-header-bar',
    name: 'Console Header & Telemetry Bar',
    type: 'component',
    x: startX + 32,
    y: startY + 24,
    width: 1376,
    height: 72,
    rotation: 0,
    borderRadius: 14,
    fill: '#0c121d',
    fillOpacity: 95,
    stroke: '#00f0ff',
    strokeWidth: 1,
    shadowBlur: 16,
    shadowY: 4,
    shadowSpread: 0,
    visible: true,
    locked: false,
    parentId: masterFrameId,
    textContent: 'ZLAB // CYBERPUNK HUD CURSOR DESIGN SYSTEM [v4.2]',
    subText: 'Obsidian Metallic Matrix • Glowing Cyan Neon (#00f0ff) • 8K Sub-Pixel Calibration • Glassmorphic Depth',
    textColor: '#00f0ff',
    fontSize: 16,
  };

  // 6 Category Bento Panels inside the 1440x900 Artboard (Row 1: y=112, Row 2: y=485)
  const categories = [
    { title: '01. DIRECTIONAL DEFAULT POINTERS', desc: 'Angled Chevrons & Stealth Darts with Glowing Plasma Tips', x: 32, y: 112, w: 432, h: 350 },
    { title: '02. SELECTION CURSORS', desc: 'Cybernetic Robotic Hands with Glowing Index Emitters', x: 496, y: 112, w: 432, h: 350 },
    { title: '03. TEXT INPUT CURSORS', desc: 'Laser Plasma I-Beams & Precision Optical Vernier Calipers', x: 960, y: 112, w: 432, h: 350 },
    { title: '04. WAIT & PROGRESS INDICATORS', desc: 'Rotating Quantum Data Rings & Chroniton Particle Hourglasses', x: 32, y: 485, w: 432, h: 385 },
    { title: '05. RESIZE ARROWS', desc: 'Bi-Directional Expansion Spears & Omnidirectional Thrusters', x: 496, y: 485, w: 432, h: 385 },
    { title: '06. PRECISION & EDITING CROSSHAIRS', desc: 'Tactical Reticles, Vector Pen Emitters & Magnetic Snap Calipers', x: 960, y: 485, w: 432, h: 385 },
  ];

  categories.forEach((cat, index) => {
    const panelId = `hud-panel-${index + 1}`;
    elements[panelId] = {
      id: panelId,
      name: cat.title,
      type: 'card',
      x: startX + cat.x,
      y: startY + cat.y,
      width: cat.w,
      height: cat.h,
      rotation: 0,
      borderRadius: 12,
      fill: '#080d15',
      fillOpacity: 92,
      stroke: '#00f0ff',
      strokeWidth: 1,
      shadowBlur: 14,
      shadowY: 4,
      shadowSpread: 0,
      visible: true,
      locked: false,
      parentId: masterFrameId,
      textContent: cat.title,
      subText: cat.desc,
      textColor: '#e5e2e1',
      fontSize: 13,
    };
  });

  // Mobile elements for mobile-app-view preview
  elements['mobile-hud-header'] = {
    id: 'mobile-hud-header',
    name: 'Mobile Cyberpunk Header',
    type: 'component',
    x: 20,
    y: 56,
    width: 350,
    height: 60,
    rotation: 0,
    borderRadius: 14,
    fill: '#0c121d',
    fillOpacity: 95,
    stroke: '#00f0ff',
    strokeWidth: 1,
    shadowBlur: 14,
    shadowY: 4,
    shadowSpread: 0,
    visible: true,
    locked: false,
    parentId: 'mobile-app-view',
    textContent: 'ZLAB // CYBERPUNK HUD [v4.2]',
    subText: 'Tactical Mobile Matrix Console',
    textColor: '#00f0ff',
    fontSize: 13,
  };

  elements['mobile-hud-card-1'] = {
    id: 'mobile-hud-card-1',
    name: '01. Directional Pointers',
    type: 'card',
    x: 20,
    y: 132,
    width: 350,
    height: 155,
    rotation: 0,
    borderRadius: 14,
    fill: '#080d15',
    fillOpacity: 92,
    stroke: '#00f0ff',
    strokeWidth: 1,
    shadowBlur: 12,
    shadowY: 4,
    shadowSpread: 0,
    visible: true,
    locked: false,
    parentId: 'mobile-app-view',
    textContent: '01. DIRECTIONAL CHEVRONS',
    subText: 'Angled Chevrons & Stealth Darts with Glowing Plasma Tips',
    textColor: '#00f0ff',
    fontSize: 13,
  };

  elements['mobile-hud-card-2'] = {
    id: 'mobile-hud-card-2',
    name: '02. Selection Hands',
    type: 'card',
    x: 20,
    y: 302,
    width: 350,
    height: 155,
    rotation: 0,
    borderRadius: 14,
    fill: '#080d15',
    fillOpacity: 92,
    stroke: '#00f0ff',
    strokeWidth: 1,
    shadowBlur: 12,
    shadowY: 4,
    shadowSpread: 0,
    visible: true,
    locked: false,
    parentId: 'mobile-app-view',
    textContent: '02. ROBOTIC SELECTION HANDS',
    subText: 'Cybernetic Hands with Glowing Index Emitters',
    textColor: '#00f0ff',
    fontSize: 13,
  };

  elements['mobile-hud-card-3'] = {
    id: 'mobile-hud-card-3',
    name: '03. Tactical Reticles',
    type: 'card',
    x: 20,
    y: 472,
    width: 350,
    height: 155,
    rotation: 0,
    borderRadius: 14,
    fill: '#080d15',
    fillOpacity: 92,
    stroke: '#00f0ff',
    strokeWidth: 1,
    shadowBlur: 12,
    shadowY: 4,
    shadowSpread: 0,
    visible: true,
    locked: false,
    parentId: 'mobile-app-view',
    textContent: '03. TACTICAL RETICLES',
    subText: 'Precision Vernier Crosshairs & Optical Sensors',
    textColor: '#00f0ff',
    fontSize: 13,
  };

  elements['mobile-hud-card-4'] = {
    id: 'mobile-hud-card-4',
    name: '04. Quantum Rings',
    type: 'card',
    x: 20,
    y: 642,
    width: 350,
    height: 155,
    rotation: 0,
    borderRadius: 14,
    fill: '#080d15',
    fillOpacity: 92,
    stroke: '#00f0ff',
    strokeWidth: 1,
    shadowBlur: 12,
    shadowY: 4,
    shadowSpread: 0,
    visible: true,
    locked: false,
    parentId: 'mobile-app-view',
    textContent: '04. WAIT & PROGRESS RINGS',
    subText: 'Rotating Quantum Data Rings & Chroniton Particle Hourglasses',
    textColor: '#00f0ff',
    fontSize: 13,
  };

  return elements;
}
