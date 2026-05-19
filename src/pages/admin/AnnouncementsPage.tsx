import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { announcementsService } from '@/services/announcements.service';
import Table from '@/components/ui/Table';
import type { Column } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Pagination from '@/components/ui/Pagination';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Send } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import type { Pengumuman } from '@/types';

export default function AnnouncementsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Pengumuman | null>(null);
  const [deleteItem, setDeleteItem] = useState<Pengumuman | null>(null);
  const [formData, setFormData] = useState({
    judul: '', konten: '', target_role: 'all' as const, is_published: false,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['announcements', page],
    queryFn: () => announcementsService.list({ page, limit: 10 }),
  });

  const createMut = useMutation({
    mutationFn: announcementsService.create,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['announcements'] }); toast.success('Pengumuman dibuat'); closeForm(); },
    onError: () => toast.error('Gagal membuat pengumuman'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, ...p }: { id: number } & Parameters<typeof announcementsService.update>[1]) => announcementsService.update(id, p),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['announcements'] }); toast.success('Pengumuman diupdate'); closeForm(); },
    onError: () => toast.error('Gagal update'),
  });

  const deleteMut = useMutation({
    mutationFn: announcementsService.delete,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['announcements'] }); toast.success('Pengumuman dihapus'); setDeleteItem(null); },
    onError: () => toast.error('Gagal menghapus'),
  });

  const publishMut = useMutation({
    mutationFn: announcementsService.publish,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['announcements'] }); toast.success('Pengumuman dipublish'); },
    onError: () => toast.error('Gagal publish'),
  });

  const openCreate = () => { setEditItem(null); setFormData({ judul: '', konten: '', target_role: 'all', is_published: false }); setShowForm(true); };
  const openEdit = (item: Pengumuman) => { setEditItem(item); setFormData({ judul: item.judul, konten: item.konten, target_role: item.target_role as 'all', is_published: item.is_published }); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditItem(null); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editItem) { updateMut.mutate({ id: editItem.id_pengumuman, ...formData }); }
    else { createMut.mutate(formData); }
  };

  const columns: Column<Pengumuman>[] = [
    { key: 'judul', label: 'Judul', render: (i) => <span className="font-medium">{i.judul}</span> },
    { key: 'target_role', label: 'Target', render: (i) => <Badge>{i.target_role}</Badge> },
    { key: 'is_published', label: 'Status', render: (i) => <Badge variant={i.is_published ? 'success' : 'secondary'}>{i.is_published ? 'Published' : 'Draft'}</Badge> },
    { key: 'created_at', label: 'Tanggal', render: (i) => i.created_at ? format(new Date(i.created_at), 'd MMM yyyy', { locale: idLocale }) : '-' },
    {
      key: 'actions', label: 'Aksi',
      render: (i) => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(i)} className="btn btn-ghost btn-sm"><Pencil size={16} /></button>
          {!i.is_published && <button onClick={() => publishMut.mutate(i.id_pengumuman)} className="btn btn-ghost btn-sm text-primary"><Send size={16} /></button>}
          <button onClick={() => setDeleteItem(i)} className="btn btn-ghost btn-sm text-error"><Trash2 size={16} /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-headline-md text-on-surface">Pengumuman</h1><p className="text-body-md text-on-surface-variant mt-1">Buat dan kelola pengumuman</p></div>
        <Button icon={<Plus size={18} />} onClick={openCreate}>Buat Pengumuman</Button>
      </div>

      <Table columns={columns} data={data?.data || []} keyExtractor={(i) => i.id_pengumuman} isLoading={isLoading} />
      <Pagination currentPage={page} totalPages={data?.meta?.totalPages || 1} onPageChange={setPage} />

      <Modal isOpen={showForm} onClose={closeForm} title={editItem ? 'Edit Pengumuman' : 'Buat Pengumuman'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Judul" value={formData.judul} onChange={(e) => setFormData({ ...formData, judul: e.target.value })} required />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Konten</label>
            <textarea className="input-field min-h-[160px] resize-y" value={formData.konten} onChange={(e) => setFormData({ ...formData, konten: e.target.value })} required placeholder="Isi pengumuman..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">Target</label>
              <select className="input-field" value={formData.target_role} onChange={(e) => setFormData({ ...formData, target_role: e.target.value as 'all' })}>
                <option value="all">Semua</option>
                <option value="asesi">Asesi</option>
                <option value="asesor">Asesor</option>
              </select>
            </div>
            <div className="space-y-1.5 flex items-end">
              <label className="flex items-center gap-2 pb-2.5">
                <input type="checkbox" checked={formData.is_published} onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })} className="rounded" />
                <span className="text-sm font-medium">Langsung publish</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={closeForm}>Batal</Button>
            <Button type="submit" isLoading={createMut.isPending || updateMut.isPending}>{editItem ? 'Simpan' : 'Buat'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={() => deleteItem && deleteMut.mutate(deleteItem.id_pengumuman)} title="Hapus Pengumuman" message={`Yakin ingin menghapus "${deleteItem?.judul}"?`} isLoading={deleteMut.isPending} />
    </div>
  );
}
