import { ShieldCheck } from 'lucide-react';

interface ShieldLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const sizeMap = {
  sm: { container: 'h-8 w-8', icon: 18, label: 'text-base' },
  md: { container: 'h-10 w-10', icon: 22, label: 'text-lg' },
  lg: { container: 'h-12 w-12', icon: 28, label: 'text-xl' },
};

export default function ShieldLogo({ size = 'md', showLabel = true }: ShieldLogoProps) {
  const s = sizeMap[size];

  return (
    <div className="inline-flex items-center gap-2.5">
      <div
        className={`flex ${s.container} items-center justify-center rounded-xl bg-primary/10`}
      >
        <ShieldCheck size={s.icon} className="text-primary" />
      </div>
      {showLabel && (
        <span className={`${s.label} font-bold text-on-surface`}>CertiPENS</span>
      )}
    </div>
  );
}
