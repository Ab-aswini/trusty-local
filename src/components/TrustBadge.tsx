import { Shield, ShieldCheck, ShieldAlert } from 'lucide-react';

interface TrustBadgeProps {
  level: 'low' | 'medium' | 'high';
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

const TrustBadge = ({ level, showLabel = true, size = 'md' }: TrustBadgeProps) => {
  const config = {
    low: {
      icon: ShieldAlert,
      label: 'Building Trust',
      bgColor: 'bg-muted',
      textColor: 'text-muted-foreground',
    },
    medium: {
      icon: Shield,
      label: 'Trusted',
      bgColor: 'bg-primary/10',
      textColor: 'text-primary',
    },
    high: {
      icon: ShieldCheck,
      label: 'Highly Trusted',
      bgColor: 'bg-emerald-100',
      textColor: 'text-emerald-600',
    },
  };

  const { icon: Icon, label, bgColor, textColor } = config[level];
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${bgColor} ${textColor} ${sizeClasses[size]}`}>
      <Icon className={iconSizes[size]} />
      {showLabel && label}
    </span>
  );
};

export default TrustBadge;
