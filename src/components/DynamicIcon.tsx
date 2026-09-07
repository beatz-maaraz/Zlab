import React from 'react';
import {
  Layers,
  Folder,
  Grid,
  Component,
  Globe,
  Compass,
  Plus,
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
  Image,
  Camera,
  Cpu,
  Activity,
  Terminal,
  TrendingUp,
  Square,
  Circle,
  HelpCircle,
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
  Image,
  Camera,
  Cpu,
  Activity,
  Terminal,
  TrendingUp,
  Square,
  Circle,
  HelpCircle,
};

interface DynamicIconProps extends LucideProps {
  name?: string;
  fallback?: React.FC<LucideProps>;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({
  name,
  fallback = Square,
  ...props
}) => {
  if (!name) {
    const FallbackComponent = fallback;
    return <FallbackComponent {...props} />;
  }

  const IconComponent = ICON_MAP[name] || fallback;
  return <IconComponent {...props} />;
};
