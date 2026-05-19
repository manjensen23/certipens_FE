import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Building, Save, Pencil, X, Award } from 'lucide-react';
import api from '@/services/api';

export default function AsesorProfilePage() {
  const user = useAuthStore((s) => s.user);
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['profile-asesor'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me');
      return data.data;
    },
  });

  const [form, setForm] = useState({
    nama_lengkap: '',
    nip: '',
    bidang_keahlian: '',
    no_sertifikat_asesor: '',
    no_telepon: '',
  });

  const startEdit = () => {
    setForm({
      nama_lengkap: profile?.nama_lengkap || user?.nama_lengkap || '',
      nip: profile?.profil_asesor?.nip || '',
      bidang_keahlian: profile?.profil_asesor?.bidang_keahlian || '',
      no_sertifikat_asesor: profile?.profil_asesor?.no_sertifikat_asesor || '',
      no_telepon: profile?.profil_asesor?.no_telepon || '',
    });
    setIsEditing(true);
  };

  const saveMut = useMutation({
    mutationFn: async () => {
      await api.put('/profil/asesor', form);
    },
    onSuccess: () => {
      toast.success('Profil berhasil diperbarui');
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['profile-asesor'] });
    },
    onError: () => toast.error('Gagal memperbarui profil'),
  });

  const displayData = profile || user;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-md text-on-surface">Profil Asesor</h1>
          <p className="text-body-md text-on-surface-variant mt-1">Kelola informasi profil Anda</p>
        </div>
        {!isEditing ? (
          <Button onClick={startEdit}>
            <Pencil size={16} /> Edit Profil
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setIsEditing(false)}>
              <X size={16} /> Batal
            </Button>
            <Button onClick={() => saveMut.mutate()} isLoading={saveMut.isPending}>
              <Save size={16} /> Simpan
            </Button>
          </div>
        )}
      </div>

      <div className="card">
        {/* Header */}
        <div className="h-24 bg-gradient-to-r from-[#1a56db] to-[#2563eb] rounded-t-xl" />
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-10 mb-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white border-4 border-white shadow-md text-primary text-2xl font-bold">
              {(displayData?.nama_lengkap || 'A')[0].toUpperCase()}
            </div>
            {/* <div className="pb-1">
              <h2 className="text-lg font-bold text-on-surface">{displayData?.nama_lengkap || '-'}</h2>
              <p className="text-sm text-on-surface-variant">{displayData?.email || '-'} • Asesor</p>
            </div> */}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FieldRow
              icon={<User size={16} />} label="Nama Lengkap"
              value={displayData?.nama_lengkap} editValue={form.nama_lengkap}
              isEditing={isEditing} onChange={(v) => setForm((p) => ({ ...p, nama_lengkap: v }))}
            />
            <FieldRow
              icon={<Mail size={16} />} label="Email"
              value={displayData?.email} editValue="" isEditing={false} onChange={() => {}}
            />
            <FieldRow
              icon={<Building size={16} />} label="NIP"
              value={profile?.profil_asesor?.nip} editValue={form.nip}
              isEditing={isEditing} onChange={(v) => setForm((p) => ({ ...p, nip: v }))}
            />
            <FieldRow
              icon={<Award size={16} />} label="Bidang Keahlian"
              value={profile?.profil_asesor?.bidang_keahlian} editValue={form.bidang_keahlian}
              isEditing={isEditing} onChange={(v) => setForm((p) => ({ ...p, bidang_keahlian: v }))}
            />
            <FieldRow
              icon={<Award size={16} />} label="No. Sertifikat Asesor"
              value={profile?.profil_asesor?.no_sertifikat_asesor} editValue={form.no_sertifikat_asesor}
              isEditing={isEditing} onChange={(v) => setForm((p) => ({ ...p, no_sertifikat_asesor: v }))}
            />
            <FieldRow
              icon={<Phone size={16} />} label="No. Telepon"
              value={profile?.profil_asesor?.no_telepon} editValue={form.no_telepon}
              isEditing={isEditing} onChange={(v) => setForm((p) => ({ ...p, no_telepon: v }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldRow({ icon, label, value, editValue, isEditing, onChange }: {
  icon: React.ReactNode; label: string; value?: string | null;
  editValue: string; isEditing: boolean; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-medium text-on-surface-variant mb-1.5">
        {icon} {label}
      </label>
      {isEditing ? (
        <input type="text" value={editValue} onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
        />
      ) : (
        <p className="text-sm text-on-surface py-2">{value || '-'}</p>
      )}
    </div>
  );
}
