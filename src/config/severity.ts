import { Severity } from '@/types';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

export interface SeverityConfig {
  icon: typeof AlertTriangle;
  bgClass: string;
  borderClass: string;
  textClass: string;
  label: string;
}

export const severityConfig: Record<Severity, SeverityConfig> = {
  high: {
    icon: AlertTriangle,
    bgClass: 'bg-red-500/10',
    borderClass: 'border-red-500/30',
    textClass: 'text-red-400',
    label: '高危',
  },
  medium: {
    icon: AlertCircle,
    bgClass: 'bg-orange-500/10',
    borderClass: 'border-orange-500/30',
    textClass: 'text-orange-400',
    label: '中危',
  },
  low: {
    icon: Info,
    bgClass: 'bg-blue-500/10',
    borderClass: 'border-blue-500/30',
    textClass: 'text-blue-400',
    label: '注意',
  },
};
