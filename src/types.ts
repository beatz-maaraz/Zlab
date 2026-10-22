export type ToolMode = 'move' | 'frame' | 'rect' | 'pen' | 'text' | 'hand' | 'comment';

export type AppView = 'editor' | 'dashboard';

export type InspectorTab = 'design' | 'prototype' | 'inspect';

export type DevicePreview = 'desktop' | 'mobile';

export const DEVICE_PRESETS = {
  desktop: {
    width: 1440,
    height: 900,
    label: 'Desktop',
  },
  mobile: {
    width: 390,
    height: 844,
    label: 'Mobile',
  },
} as const;

export type DevicePresetKey = keyof typeof DEVICE_PRESETS;

export type SettingsTab =
  | 'general'
  | 'account'
  | 'appearance'
  | 'shortcuts'
  | 'plugins'
  | 'team'
  | 'billing';

export type CanvasElementType =
  | 'frame'
  | 'group'
  | 'rectangle'
  | 'text'
  | 'button'
  | 'grid'
  | 'component'
  | 'icon'
  | 'badge'
  | 'avatar'
  | 'card'
  | 'input'
  | 'shape';

export interface CanvasElement {
  id: string;
  name: string;
  type: CanvasElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  borderRadius: number;
  radius?: number;
  fill: string;
  fillOpacity: number;
  stroke: string;
  strokeColor?: string;
  strokeWidth: number;
  shadowBlur: number;
  shadowY: number;
  shadowSpread: number;
  presetTheme?: 'm3' | 'ios' | 'glass';
  visible: boolean;
  locked: boolean;
  fixed?: boolean;
  pinned?: boolean;
  parentId?: string;
  children?: CanvasElement[];
  textContent?: string;
  subText?: string;
  tag?: string;
  iconName?: string;
  textColor?: string;
  fontSize?: number;
  textAlign?: 'left' | 'center' | 'right';
  fontWeight?: string | number;
  variant?: string;
  backdropBlur?: number;
  glassEffect?: 'frosted' | 'neon' | 'smoke' | 'prism' | 'none';
  materialPreset?: 'm3' | 'ios' | 'glass' | 'none';
  prototype?: InteractionPrototype;
  // Dynamic Header & Input & Tab & Data Grid Properties
  placeholder?: string;
  label?: string;
  activeTab?: string;
  tabs?: { id: string; label: string; icon?: string; badge?: string }[];
  columns?: { key: string; label: string; width?: string }[];
  items?: any[];
  searchQuery?: string;
  helperText?: string;
  isFocused?: boolean;
  hasFloatingLabel?: boolean;
  typographyVariant?:
    | 'm3-display-lg'
    | 'm3-headline-md'
    | 'm3-title-md'
    | 'm3-body-md'
    | 'm3-label-lg'
    | 'ios-large-title'
    | 'ios-title-1'
    | 'ios-body'
    | 'ios-callout'
    | 'ios-caption';
  colorVariantToken?:
    | 'm3-primary'
    | 'm3-secondary-container'
    | 'm3-surface-variant'
    | 'm3-outline'
    | 'ios-system-blue'
    | 'ios-grouped-bg'
    | 'ios-vibrancy';
  // Auto-Layout Properties
  layoutMode?: 'none' | 'horizontal' | 'vertical';
  gap?: number;
  padding?: number;
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  justifyContent?: 'start' | 'center' | 'end' | 'space-between';
}

export interface InteractionPrototype {
  trigger: 'tap' | 'click' | 'hover' | 'drag' | 'delay';
  action: 'navigate' | 'overlay' | 'url' | 'back';
  destinationId: string;
  animation: 'smart_animate' | 'dissolve' | 'instant' | 'slide_in' | 'slide_out' | 'push';
  easing?: 'ease-out' | 'ease-in-out' | 'spring' | 'linear';
  duration?: number;
}

export interface LibraryComponentItem {
  id: string;
  name: string;
  category: string;
  description: string;
  defaultProps: Partial<CanvasElement>;
  system?: 'm3' | 'ios' | 'glass' | 'standard';
}

export interface LibraryAssetItem {
  id: string;
  name: string;
  category: 'icons' | 'shapes' | 'brand' | 'palettes';
  description: string;
  iconName?: string;
  shapeType?: 'circle' | 'pill' | 'hexagon' | 'star' | 'diamond' | 'triangle';
  colors?: string[];
  defaultProps: Partial<CanvasElement>;
}

export interface Collaborator {
  id: string;
  name: string;
  initials: string;
  color: string;
  cursorX: number;
  cursorY: number;
  currentElement?: string;
}

export interface CanvasComment {
  id: string;
  author: string;
  initials: string;
  avatarColor: string;
  text: string;
  x: number;
  y: number;
  timestamp: string;
  resolved: boolean;
}

export interface ProjectPage {
  id: string;
  name: string;
}

export interface Project {
  id: string;
  name: string;
  ownerId?: string;
  elements: Record<string, CanvasElement>;
  pageElements?: Record<string, Record<string, CanvasElement>>;
  pages: ProjectPage[];
  activePageId: string;
  previewType: 'desktop' | 'mobile';
  createdAt: string;
  updatedAt: string;
  thumbnail?: string;
  category?: string;
  tag?: string;
  status?: 'active' | 'trash' | 'shared';
  projectType?: string;
  description?: string;
  techStack?: string[];
  projectStatus?: string;
  githubUrl?: string;
  liveDemoUrl?: string;
}

export interface ProjectFile {
  id: string;
  title: string;
  lastEdited: string;
  previewType: 'desktop' | 'mobile' | 'components';
  category?: string;
  tag?: string;
  status?: 'active' | 'trash' | 'shared';
  projectType?: string;
  projectStatus?: string;
  elements?: Record<string, CanvasElement>;
}

export interface TemplateItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  colorVariant: 'secondary' | 'primary' | 'tertiary';
}

export interface UserSettings {
  theme: 'dark' | 'light' | 'system';
  language: string;
  hardwareAcceleration: boolean;
  autoSaveInterval: number; // in seconds
  fullName: string;
  email: string;
  username: string;
  avatarText: string;
  plan: string;
  planRenewal: string;
  gridDensity: number;
  snapToGrid: boolean;
  interfaceScale: 'small' | 'medium' | 'large';
  company?: string;
  role?: string;
  highContrast?: boolean;
  enableToolbarDrag?: boolean;
}
