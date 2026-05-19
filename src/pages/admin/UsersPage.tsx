import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '@/services/users.service';
import type { CreateUserPayload, CreateUserResponse } from '@/services/users.service';
import Table from '@/components/ui/Table';
import type { Column } from '@/components/ui/Table';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Pagination from '@/components/ui/Pagination';
import toast from 'react-hot-toast';
import { Plus, Search, Trash2, ToggleLeft, ToggleRight, Copy, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import type { User } from '@/types';

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [deleteItem, setDeleteItem] = useState<User | null>(null);
  const [createdUser, setCreatedUser] = useState<CreateUserResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState<CreateUserPayload>({
    email: '', nama_lengkap: '', role: 'asesi', no_telepon: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, roleFilter, search],
    queryFn: () => usersService.list({
      page, limit: 10,
      role: roleFilter || undefined,
      search: search || undefined,
    }),
  });

  const createMut = useMutation({
    mutationFn: usersService.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setShowForm(false);
      setCreatedUser(data);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Gagal membuat akun'),
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) => usersService.toggleActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Status user diperbarui');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Gagal mengubah status'),
  });

  const deleteMut = useMutation({
    mutationFn: usersService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User berhasil dihapus');
      setDeleteItem(null);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Gagal menghapus user'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMut.mutate(formData);
  };

  const handleCopyPassword = async () => {
    if (!createdUser?.generated_password) return;
    await navigator.clipboard.writeText(createdUser.generated_password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openCreate = () => {
    setFormData({ email: '', nama_lengkap: '', role: 'asesi', no_telepon: '' });
    setShowForm(true);
  };

  const roleBadge = (role: string) => {
    const styles: Record<string, string> = {
      admin: 'bg-purple-100 text-purple-700',
      asesi: 'bg-blue-100 text-blue-700',
      asesor: 'bg-amber-100 text-amber-700',
    };
    return (
      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${styles[role] || 'bg-gray-100 text-gray-700'}`}>
        {role}
      </span>
    );
  };

  const columns: Column<User>[] = [
    {
      key: 'nama', label: 'Nama',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-alpha-10 text-primary text-xs font-bold shrink-0">
            {item.nama_lengkap?.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <p className="text-sm font-medium text-on-surface">{item.nama_lengkap}</p>
            <p className="text-xs text-on-surface-variant">{item.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role', label: 'Role',
      render: (item) => roleBadge(item.role),
    },
    {
      key: 'status', label: 'Status',
      render: (item) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${item.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
          {item.is_active ? 'Aktif' : 'Nonaktif'}
        </span>
      ),
    },
    {
      key: 'created_at', label: 'Terdaftar',
      render: (item) => item.created_at ? format(new Date(item.created_at), 'd MMM yyyy', { locale: idLocale }) : '-',
    },
    {
      key: 'actions', label: 'Aksi',
      render: (item) => (
        <div className="flex gap-1">
          <button
            onClick={() => toggleMut.mutate({ id: item.id_user, isActive: !item.is_active })}
            className={`btn btn-ghost btn-sm ${item.is_active ? 'text-status-pending' : 'text-status-verified'}`}
            title={item.is_active ? 'Nonaktifkan' : 'Aktifkan'}
          >
            {item.is_active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
          </button>
          {item.role !== 'admin' && (
            <button
              onClick={() => setDeleteItem(item)}
              className="btn btn-ghost btn-sm text-error"
              title="Hapus"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline" />
          <input
            className="input-field pl-9"
            placeholder="Cari nama atau email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="input-field w-auto"
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
        >
          <option value="">Semua Role</option>
          <option value="asesi">Asesi</option>
          <option value="asesor">Asesor</option>
          <option value="admin">Admin</option>
        </select>
        <Button icon={<Plus size={18} />} onClick={openCreate}>Tambah Akun</Button>
      </div>

      <Table columns={columns} data={data?.data || []} keyExtractor={(item) => item.id_user} isLoading={isLoading} />
      <Pagination currentPage={page} totalPages={data?.meta?.totalPages || 1} onPageChange={setPage} />

      {/* Create User Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Tambah Akun Baru">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Lengkap"
            value={formData.nama_lengkap}
            onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Role</label>
            <select
              className="input-field"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'asesi' | 'asesor' })}
              required
            >
              <option value="asesi">Asesi</option>
              <option value="asesor">Asesor</option>
            </select>
          </div>
          <Input
            label="No. Telepon (opsional)"
            value={formData.no_telepon || ''}
            onChange={(e) => setFormData({ ...formData, no_telepon: e.target.value })}
          />

          <div className="rounded-lg bg-surface-container/60 p-3 text-xs text-on-surface-variant">
            <p className="font-medium text-on-surface mb-1">ℹ️ Password</p>
            <p>Password akan digenerate otomatis dan ditampilkan setelah akun dibuat. Pastikan untuk menyalin dan menyimpannya.</p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Batal</Button>
            <Button type="submit" isLoading={createMut.isPending}>Buat Akun</Button>
          </div>
        </form>
      </Modal>

      {/* Password Result Modal */}
      <Modal
        isOpen={!!createdUser}
        onClose={() => setCreatedUser(null)}
        title="Akun Berhasil Dibuat"
      >
        {createdUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle size={24} className="text-status-verified" />
              <p className="text-sm font-medium text-on-surface">
                Akun untuk <strong>{createdUser.nama_lengkap}</strong> berhasil dibuat
              </p>
            </div>

            <div className="space-y-3">
              <div className="rounded-lg bg-surface-container/60 p-3">
                <p className="text-xs text-on-surface-variant mb-1">Email</p>
                <p className="text-sm font-mono font-medium text-on-surface">{createdUser.email}</p>
              </div>
              <div className="rounded-lg bg-surface-container/60 p-3">
                <p className="text-xs text-on-surface-variant mb-1">Role</p>
                <p className="text-sm font-medium text-on-surface capitalize">{createdUser.role}</p>
              </div>
              <div className="rounded-lg border-2 border-primary/20 bg-primary-alpha-10 p-3">
                <p className="text-xs text-on-surface-variant mb-1">Password (hanya ditampilkan sekali!)</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm font-mono font-bold text-primary select-all">
                    {createdUser.generated_password}
                  </code>
                  <button
                    onClick={handleCopyPassword}
                    className="rounded-md p-1.5 hover:bg-primary/10 transition-colors text-primary"
                    title="Salin password"
                  >
                    {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-status-pending-bg p-3 text-xs text-status-pending">
              ⚠️ Simpan password ini sekarang! Password tidak akan ditampilkan lagi setelah modal ini ditutup.
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => setCreatedUser(null)}>Tutup</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={() => deleteItem && deleteMut.mutate(deleteItem.id_user)}
        title="Hapus User"
        message={`Apakah Anda yakin ingin menghapus akun "${deleteItem?.nama_lengkap}"? Tindakan ini tidak bisa dibatalkan.`}
        confirmLabel="Hapus"
        variant="danger"
        isLoading={deleteMut.isPending}
      />
    </div>
  );
}
