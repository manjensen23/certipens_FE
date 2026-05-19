import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { User, Mail, Phone, MapPin, Building, Save, Pencil, X } from 'lucide-react';
import api from '@/services/api';

export default function AsesiProfilePage() {
  const user = useAuthStore((s) => s.user);
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['profile-asesi'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me');
      return data.data;
    },
  });

  const [form, setForm] = useState({
    nama_lengkap: '',
    no_telepon: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    jenis_kelamin: '',
    alamat: '',
    pendidikan_terakhir: '',
    jurusan: '',
    asal_instansi: '',
    jabatan: '',
  });

  const startEdit = () => {
    setForm({
      nama_lengkap: profile?.nama_lengkap || user?.nama_lengkap || '',
      no_telepon: profile?.profil_asesi?.no_telepon || '',
      tempat_lahir: profile?.profil_asesi?.tempat_lahir || '',
      tanggal_lahir: profile?.profil_asesi?.tanggal_lahir || '',
      jenis_kelamin: profile?.profil_asesi?.jenis_kelamin || '',
      alamat: profile?.profil_asesi?.alamat || '',
      pendidikan_terakhir: profile?.profil_asesi?.pendidikan_terakhir || '',
      jurusan: profile?.profil_asesi?.jurusan || '',
      asal_instansi: profile?.profil_asesi?.asal_instansi || '',
      jabatan: profile?.profil_asesi?.jabatan || '',
    });
    setIsEditing(true);
  };

  const cancelEdit = () => setIsEditing(false);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const saveMut = useMutation({
    mutationFn: async () => {
      await api.put('/profil/asesi', form);
    },
    onSuccess: () => {
      toast.success('Profil berhasil diperbarui');
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['profile-asesi'] });
    },
    onError: () => toast.error('Gagal memperbarui profil'),
  });

  const displayData = profile || user;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-md text-on-surface">Profil Saya</h1>
          <p className="text-body-md text-on-surface-variant mt-1">Kelola informasi profil Anda</p>
        </div>
        {!isEditing ? (
          <Button onClick={startEdit}>
            <Pencil size={16} /> Edit Profil
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={cancelEdit}>
              <X size={16} /> Batal
            </Button>
            <Button onClick={() => saveMut.mutate()} isLoading={saveMut.isPending}>
              <Save size={16} /> Simpan
            </Button>
          </div>
        )}
      </div>

      {/* Profile card */}
      <div className="card">
        {/* Header banner */}
        <div className="h-24 bg-gradient-to-r from-primary to-[#7c3aed] rounded-t-xl" />
        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="flex items-end gap-4 -mt-10 mb-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white border-4 border-white shadow-md text-primary text-2xl font-bold">
              {(displayData?.nama_lengkap || 'U')[0].toUpperCase()}
            </div>
            {/* <div className="pb-1">
              <h2 className="text-lg font-bold text-on-surface">{displayData?.nama_lengkap || '-'}</h2>
              <p className="text-sm text-on-surface-variant">{displayData?.email || '-'}</p>
            </div> */}
          </div>

          {/* Form fields */}
          <div className="grid gap-5 sm:grid-cols-2">
            <FieldRow
              icon={<User size={16} />}
              label="Nama Lengkap"
              value={displayData?.nama_lengkap}
              editValue={form.nama_lengkap}
              isEditing={isEditing}
              onChange={(v) => handleChange('nama_lengkap', v)}
            />
            <FieldRow
              icon={<Mail size={16} />}
              label="Email"
              value={displayData?.email}
              isEditing={false}
              editValue=""
              onChange={() => {}}
            />
            <FieldRow
              icon={<Phone size={16} />}
              label="No. Telepon"
              value={profile?.profil_asesi?.no_telepon}
              editValue={form.no_telepon}
              isEditing={isEditing}
              onChange={(v) => handleChange('no_telepon', v)}
            />
            <FieldRow
              icon={<MapPin size={16} />}
              label="Tempat Lahir"
              value={profile?.profil_asesi?.tempat_lahir}
              editValue={form.tempat_lahir}
              isEditing={isEditing}
              onChange={(v) => handleChange('tempat_lahir', v)}
            />
            <FieldRow
              icon={<MapPin size={16} />}
              label="Alamat"
              value={profile?.profil_asesi?.alamat}
              editValue={form.alamat}
              isEditing={isEditing}
              onChange={(v) => handleChange('alamat', v)}
            />
            <FieldRow
              icon={<Building size={16} />}
              label="Asal Instansi"
              value={profile?.profil_asesi?.asal_instansi}
              editValue={form.asal_instansi}
              isEditing={isEditing}
              onChange={(v) => handleChange('asal_instansi', v)}
            />
            <FieldRow
              icon={<Building size={16} />}
              label="Pendidikan Terakhir"
              value={profile?.profil_asesi?.pendidikan_terakhir}
              editValue={form.pendidikan_terakhir}
              isEditing={isEditing}
              onChange={(v) => handleChange('pendidikan_terakhir', v)}
            />
            <FieldRow
              icon={<Building size={16} />}
              label="Jurusan"
              value={profile?.profil_asesi?.jurusan}
              editValue={form.jurusan}
              isEditing={isEditing}
              onChange={(v) => handleChange('jurusan', v)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldRow({
  icon,
  label,
  value,
  editValue,
  isEditing,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  editValue: string;
  isEditing: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-medium text-on-surface-variant mb-1.5">
        {icon} {label}
      </label>
      {isEditing ? (
        <input
          type="text"
          value={editValue}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
        />
      ) : (
        <p className="text-sm text-on-surface py-2">{value || '-'}</p>
      )}
    </div>
  );
}
