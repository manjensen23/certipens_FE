interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'badge-draft' },
  pending: { label: 'Pending', className: 'badge-pending' },
  diverifikasi: { label: 'Diverifikasi', className: 'badge-verified' },
  ditolak: { label: 'Ditolak', className: 'badge-rejected' },
  valid: { label: 'Valid', className: 'badge-verified' },
  tidak_valid: { label: 'Tidak Valid', className: 'badge-rejected' },
  published: { label: 'Published', className: 'badge-verified' },
  selesai: { label: 'Selesai', className: 'badge-primary' },
};

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: 'badge-draft' };

  return (
    <span className={`badge ${config.className} ${className}`}>
      {config.label}
    </span>
  );
}
