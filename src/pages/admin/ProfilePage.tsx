import { useAuthStore } from '@/store/authStore';
import Badge from '@/components/ui/Badge';
import { User, Mail, Phone, Shield } from 'lucide-react';

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-headline-md text-on-surface">Profil</h1>
        <p className="text-body-md text-on-surface-variant mt-1">Informasi akun Anda</p>
      </div>

      <div className="card p-8 max-w-2xl">
        {/* Avatar */}
        <div className="flex items-center gap-5 mb-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-on-primary text-3xl font-bold">
            {user?.nama_lengkap?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-title-lg text-on-surface">{user?.nama_lengkap || '-'}</h2>
            <Badge variant="primary" className="mt-1">{user?.role || '-'}</Badge>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg border border-outline-variant p-4">
            <User size={20} className="text-on-surface-variant shrink-0" />
            <div>
              <p className="text-xs text-on-surface-variant">Nama Lengkap</p>
              <p className="text-sm font-medium text-on-surface">{user?.nama_lengkap || '-'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-outline-variant p-4">
            <Mail size={20} className="text-on-surface-variant shrink-0" />
            <div>
              <p className="text-xs text-on-surface-variant">Email</p>
              <p className="text-sm font-medium text-on-surface">{user?.email || '-'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-outline-variant p-4">
            <Phone size={20} className="text-on-surface-variant shrink-0" />
            <div>
              <p className="text-xs text-on-surface-variant">No. Telepon</p>
              <p className="text-sm font-medium text-on-surface">{user?.no_telepon || 'Belum diisi'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-outline-variant p-4">
            <Shield size={20} className="text-on-surface-variant shrink-0" />
            <div>
              <p className="text-xs text-on-surface-variant">Status Akun</p>
              <Badge variant={user?.is_active ? 'success' : 'error'}>
                {user?.is_active ? 'Aktif' : 'Nonaktif'}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
