import type { ReactNode } from 'react';
import { InboxIcon } from 'lucide-react';
import Button from '../ui/Button';

interface EmptyStateProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon,
  title = 'Tidak ada data',
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-container-high text-on-surface-variant mb-4">
        {icon || <InboxIcon size={32} />}
      </div>
      <h3 className="text-lg font-semibold text-on-surface">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-on-surface-variant max-w-md">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
