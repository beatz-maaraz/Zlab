import { CanvasElement, Collaborator, ProjectFile, TemplateItem, UserSettings } from './types';

export const INITIAL_COLLABORATORS: Collaborator[] = [
  {
    id: 'sc',
    name: 'Sarah Chen',
    initials: 'SC',
    color: '#9fcaff',
    cursorX: 420,
    cursorY: 280,
    currentElement: 'Main Hero Title',
  },
  {
    id: 'ar',
    name: 'Alex Rivera',
    initials: 'AR',
    color: '#d2bbff',
    cursorX: 680,
    cursorY: 540,
    currentElement: 'Feature Grid Container',
  },
  {
    id: 'you',
    name: 'Alex Creator (You)',
    initials: 'YOU',
    color: '#c8c6c5',
    cursorX: 200,
    cursorY: 150,
  },
];

export const INITIAL_SETTINGS: UserSettings = {
  theme: 'dark',
  language: 'English (US)',
  hardwareAcceleration: true,
  autoSaveInterval: 30,
  fullName: 'Alex Creator',
  email: 'alex.creator@zlab.io',
  username: 'alexcreator',
  avatarText: 'AC',
  plan: 'Creator Pro',
  planRenewal: 'November 12, 2025',
};

export const INITIAL_RECENT_FILES: ProjectFile[] = [];

export const TEMPLATES: TemplateItem[] = [
  {
    id: 'm3-full-kit',
    title: 'Google Material Design 3 (M3) Kit',
    description: 'Complete M3 UI system: filled & tonal buttons, FABs, text fields, chips, elevation cards, and app bars.',
    icon: 'dashboard',
    colorVariant: 'secondary',
  },
  {
    id: 'ios-full-kit',
    title: 'Apple iOS 18 (HIG) Material Kit',
    description: 'Cupertino system buttons, Dynamic Island, segmented controls, vibrancy materials, and navigation bars.',
    icon: 'phone_iphone',
    colorVariant: 'primary',
  },
  {
    id: 'all-materials-kit',
    title: 'Dual Design Systems (M3 + iOS)',
    description: 'Both Google Material 3 and Apple iOS 18 kits imported side-by-side on the infinite canvas.',
    icon: 'dashboard',
    colorVariant: 'tertiary',
  },
  {
    id: 'saas-dashboard',
    title: 'SaaS Dashboard UI Kit',
    description: 'Complete design system with dark and light mode tokens.',
    icon: 'dashboard',
    colorVariant: 'secondary',
  },
  {
    id: 'ios-starter',
    title: 'iOS Mobile Starter',
    description: 'Components, typography, and standard layout frames.',
    icon: 'phone_iphone',
    colorVariant: 'primary',
  },
  {
    id: 'ecommerce',
    title: 'E-Commerce Storefront',
    description: 'Ready-to-use product cards, checkout flows, and grids.',
    icon: 'shopping_cart',
    colorVariant: 'tertiary',
  },
];

export const INITIAL_ELEMENTS: Record<string, CanvasElement> = {
  'desktop-1440': {
    id: 'desktop-1440',
    name: 'Desktop - 1440',
    type: 'frame',
    x: 0,
    y: 0,
    width: 1440,
    height: 900,
    rotation: 0,
    borderRadius: 8,
    fill: '#131313',
    fillOpacity: 100,
    stroke: '#3f4753',
    strokeWidth: 1,
    shadowBlur: 24,
    shadowY: 8,
    shadowSpread: 0,
    visible: true,
    locked: false,
  },
  'mobile-app-view': {
    id: 'mobile-app-view',
    name: 'Mobile App View',
    type: 'frame',
    x: 1600,
    y: 0,
    width: 390,
    height: 844,
    rotation: 0,
    borderRadius: 44,
    fill: '#131313',
    fillOpacity: 100,
    stroke: '#3f4753',
    strokeWidth: 2,
    shadowBlur: 32,
    shadowY: 12,
    shadowSpread: 0,
    visible: true,
    locked: false,
  },
};
