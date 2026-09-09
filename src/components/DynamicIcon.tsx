import React from 'react';
import {
  Layers,
  Folder,
  Grid,
  Component,
  Globe,
  Compass,
  Plus,
  Minus,
  Search,
  Sparkles,
  Zap,
  Sliders,
  Edit3,
  Copy,
  Download,
  Share2,
  Monitor,
  Smartphone,
  Laptop,
  Tablet,
  CheckCircle2,
  AlertTriangle,
  Info,
  Bell,
  Star,
  Heart,
  Shield,
  User,
  Users,
  MessageSquare,
  Mail,
  Play,
  Pause,
  Image,
  Camera,
  Cpu,
  Activity,
  Terminal,
  TrendingUp,
  Square,
  Circle,
  HelpCircle,
  Check,
  X,
  Trash2,
  Lock,
  Unlock,
  Pin,
  PinOff,
  Eye,
  EyeOff,
  Palette,
  Shapes,
  Maximize2,
  RotateCw,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  Type,
  MousePointerClick,
  MousePointer2,
  Tag,
  FileText,
  Layout,
  LayoutDashboard,
  Code,
  Code2,
  Settings,
  Crosshair,
  Move,
  ShoppingBag,
  ShoppingCart,
  Send,
  Phone,
  Bookmark,
  ExternalLink,
  Flame,
  Sun,
  Moon,
  LucideProps,
} from 'lucide-react';

const ICON_MAP: Record<string, React.FC<LucideProps>> = {
  Layers,
  Folder,
  Grid,
  Component,
  Globe,
  Compass,
  Plus,
  Minus,
  Search,
  Sparkles,
  Zap,
  Sliders,
  Edit3,
  Copy,
  Download,
  Share2,
  Monitor,
  Smartphone,
  Laptop,
  Tablet,
  CheckCircle2,
  AlertTriangle,
  Info,
  Bell,
  Star,
  Heart,
  Shield,
  User,
  Users,
  MessageSquare,
  Mail,
  Play,
  Pause,
  Image,
  Camera,
  Cpu,
  Activity,
  Terminal,
  TrendingUp,
  Square,
  Circle,
  HelpCircle,
  Check,
  X,
  Trash2,
  Lock,
  Unlock,
  Pin,
  PinOff,
  Eye,
  EyeOff,
  Palette,
  Shapes,
  Maximize2,
  RotateCw,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  Type,
  MousePointerClick,
  MousePointer2,
  Tag,
  FileText,
  Layout,
  LayoutDashboard,
  Code,
  Code2,
  Settings,
  Crosshair,
  Move,
  ShoppingBag,
  ShoppingCart,
  Send,
  Phone,
  Bookmark,
  ExternalLink,
  Flame,
  Sun,
  Moon,
};

// Aliases for common alternative names or template icon keys
const ICON_ALIASES: Record<string, string> = {
  dashboard: 'LayoutDashboard',
  phone_iphone: 'Smartphone',
  shopping_cart: 'ShoppingCart',
  bag: 'ShoppingBag',
  pen: 'Edit3',
  trash: 'Trash2',
  close: 'X',
  add: 'Plus',
  remove: 'Minus',
  stack: 'Layers',
  web: 'Globe',
  device: 'Monitor',
  mobile: 'Smartphone',
  desktop: 'Monitor',
  user_group: 'Users',
  profile: 'User',
  chat: 'MessageSquare',
  envelope: 'Mail',
  photo: 'Image',
  security: 'Shield',
  gear: 'Settings',
  options: 'Sliders',
};

// Case-insensitive normalized map lookup
const NORMALIZED_MAP: Record<string, React.FC<LucideProps>> = {};
Object.entries(ICON_MAP).forEach(([key, component]) => {
  NORMALIZED_MAP[key.toLowerCase().replace(/[-_]/g, '')] = component;
});

interface DynamicIconProps extends LucideProps {
  name?: string;
  fallback?: React.FC<LucideProps>;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({
  name,
  fallback = Sparkles,
  ...props
}) => {
  if (!name) {
    const FallbackComponent = fallback;
    return <FallbackComponent {...props} />;
  }

  // Direct lookup
  if (ICON_MAP[name]) {
    const ComponentToRender = ICON_MAP[name];
    return <ComponentToRender {...props} />;
  }

  // Alias lookup
  const aliasTarget = ICON_ALIASES[name.toLowerCase()];
  if (aliasTarget && ICON_MAP[aliasTarget]) {
    const ComponentToRender = ICON_MAP[aliasTarget];
    return <ComponentToRender {...props} />;
  }

  // Normalized case-insensitive lookup
  const normalizedKey = name.toLowerCase().replace(/[-_]/g, '');
  if (NORMALIZED_MAP[normalizedKey]) {
    const ComponentToRender = NORMALIZED_MAP[normalizedKey];
    return <ComponentToRender {...props} />;
  }

  const FallbackComponent = fallback;
  return <FallbackComponent {...props} />;
};
