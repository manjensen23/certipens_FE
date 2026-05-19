import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { certificationsService } from '@/services/certifications.service';
import Table from '@/components/ui/Table';
import type { Column } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, ListChecks } from 'lucide-react';
import type { JenisSertifikasi, PersyaratanKhusus } from '@/types';

export default function CertificationsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<JenisSertifikasi | null>(null);
  const [deleteItem, setDeleteItem] = useState<JenisSertifikasi | null>(null);
  const [requirementsItem, setRequirementsItem] = useState<JenisSertifikasi | null>(null);
  const [formData, setFormData] = useState({ nama_sertifikasi: '', kategori: '', deskripsi: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['certifications', page],
    queryFn: () => certificationsService.list({ page, limit: 10 }),
  });

  const createMut = useMutation({
    mutationFn: certificationsService.create,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['certifications'] }); toast.success('Sertifikasi ditambahkan'); closeForm(); },
    onError: () => toast.error('Gagal menambah sertifikasi'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, ...p }: { id: number } & Partial<JenisSertifikasi>) => certificationsService.update(id, p),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['certifications'] }); toast.success('Sertifikasi diupdate'); closeForm(); },
    onError: () => toast.error('Gagal update'),
  });

  const deleteMut = useMutation({
    mutationFn: certificationsService.delete,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['certifications'] }); toast.success('Sertifikasi dihapus'); setDeleteItem(null); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Gagal menghapus sertifikasi'),
  });

  const openCreate = () => { setEditItem(null); setFormData({ nama_sertifikasi: '', kategori: '', deskripsi: '' }); setShowForm(true); };
  const openEdit = (item: JenisSertifikasi) => { setEditItem(item); setFormData({ nama_sertifikasi: item.nama_sertifikasi, kategori: item.kategori, deskripsi: item.deskripsi || '' }); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditItem(null); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editItem) updateMut.mutate({ id: editItem.id_jenis, ...formData });
    else createMut.mutate(formData);
  };

  const columns: Column<JenisSertifikasi>[] = [
    { key: 'nama_sertifikasi', label: 'Nama Sertifikasi' },
    { key: 'kategori', label: 'Kategori', render: (i) => <Badge>{i.kategori}</Badge> },
    { key: 'persyaratan_count', label: 'Persyaratan', render: (i) => <span className="text-sm">{i.persyaratan_count ?? 0} item</span> },
    { key: 'is_active', label: 'Status', render: (i) => <Badge variant={i.is_active ? 'success' : 'secondary'}>{i.is_active ? 'Aktif' : 'Nonaktif'}</Badge> },
    {
      key: 'actions', label: 'Aksi',
      render: (i) => (
        <div className="flex gap-1">
          <button onClick={() => setRequirementsItem(i)} className="btn btn-ghost btn-sm" title="Persyaratan"><ListChecks size={16} /></button>
          <button onClick={() => openEdit(i)} className="btn btn-ghost btn-sm"><Pencil size={16} /></button>
          <button onClick={() => setDeleteItem(i)} className="btn btn-ghost btn-sm text-error"><Trash2 size={16} /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-end">
        <Button icon={<Plus size={18} />} onClick={openCreate}>Tambah Sertifikasi</Button>
      </div>

      <Table columns={columns} data={data?.data || []} keyExtractor={(i) => i.id_jenis} isLoading={isLoading} />
      <Pagination currentPage={page} totalPages={data?.meta?.totalPages || 1} onPageChange={setPage} />

      {/* Create/Edit Modal */}
      <Modal isOpen={showForm} onClose={closeForm} title={editItem ? 'Edit Sertifikasi' : 'Tambah Sertifikasi'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nama Sertifikasi" value={formData.nama_sertifikasi} onChange={(e) => setFormData({ ...formData, nama_sertifikasi: e.target.value })} required />
          <Input label="Kategori" value={formData.kategori} onChange={(e) => setFormData({ ...formData, kategori: e.target.value })} placeholder="e.g. Teknik, Manajemen" required />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-on-surface">Deskripsi</label>
            <textarea className="input-field min-h-[100px] resize-y" value={formData.deskripsi} onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })} placeholder="Deskripsi (opsional)" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={closeForm}>Batal</Button>
            <Button type="submit" isLoading={createMut.isPending || updateMut.isPending}>{editItem ? 'Simpan' : 'Tambah'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={() => deleteItem && deleteMut.mutate(deleteItem.id_jenis)} title="Hapus Sertifikasi" message={`Yakin ingin menghapus "${deleteItem?.nama_sertifikasi}"?`} isLoading={deleteMut.isPending} />

      <RequirementsModal isOpen={!!requirementsItem} onClose={() => setRequirementsItem(null)} certification={requirementsItem} />
    </div>
  );
}

function RequirementsModal({ isOpen, onClose, certification }: { isOpen: boolean; onClose: () => void; certification: JenisSertifikasi | null }) {
  const queryClient = useQueryClient();
  const [showReqForm, setShowReqForm] = useState(false);
  const [reqForm, setReqForm] = useState({ nama_persyaratan: '', tipe_file: 'pdf', is_wajib: true, urutan: 1 });

  const { data: detail, isLoading } = useQuery({
    queryKey: ['cert-detail', certification?.id_jenis],
    queryFn: () => certificationsService.getById(certification!.id_jenis),
    enabled: !!certification,
  });

  const addMut = useMutation({
    mutationFn: (p: Omit<PersyaratanKhusus, 'id_persyaratan' | 'id_jenis' | 'created_at'>) => certificationsService.addRequirement(certification!.id_jenis, p),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cert-detail'] });
      queryClient.invalidateQueries({ queryKey: ['certifications'] });
      toast.success('Persyaratan ditambahkan');
      setShowReqForm(false);
      setReqForm({ nama_persyaratan: '', tipe_file: 'pdf', is_wajib: true, urutan: 1 });
    },
    onError: () => toast.error('Gagal'),
  });

  const delMut = useMutation({
    mutationFn: certificationsService.deleteRequirement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cert-detail'] });
      queryClient.invalidateQueries({ queryKey: ['certifications'] });
      toast.success('Persyaratan dihapus');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Gagal menghapus persyaratan'),
  });

  const reqs = detail?.persyaratan || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Persyaratan: ${certification?.nama_sertifikasi || ''}`} size="lg">
      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 rounded-lg bg-surface-container-high animate-pulse" />)}</div>
      ) : (
        <div className="space-y-4">
          {reqs.length === 0 && !showReqForm && <p className="text-sm text-on-surface-variant text-center py-6">Belum ada persyaratan</p>}
          {reqs.map((r) => (
            <div key={r.id_persyaratan} className="flex items-center justify-between rounded-lg border border-outline-variant p-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{r.urutan}. {r.nama_persyaratan}</span>
                  {r.is_wajib && <Badge variant="error">Wajib</Badge>}
                </div>
                <p className="text-xs text-on-surface-variant mt-1">Tipe: {r.tipe_file}</p>
              </div>
              <button onClick={() => delMut.mutate(r.id_persyaratan)} className="btn btn-ghost btn-sm text-error"><Trash2 size={16} /></button>
            </div>
          ))}
          {showReqForm ? (
            <form onSubmit={(e) => { e.preventDefault(); addMut.mutate(reqForm as any); }} className="space-y-3 rounded-lg border border-primary/30 p-4">
              <Input label="Nama Persyaratan" value={reqForm.nama_persyaratan} onChange={(e) => setReqForm({ ...reqForm, nama_persyaratan: e.target.value })} required />
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium">Tipe File</label>
                  <select className="input-field" value={reqForm.tipe_file} onChange={(e) => setReqForm({ ...reqForm, tipe_file: e.target.value })}>
                    <option value="pdf">PDF</option><option value="jpg">JPG</option><option value="png">PNG</option>
                  </select>
                </div>
                <Input label="Urutan" type="number" value={reqForm.urutan} onChange={(e) => setReqForm({ ...reqForm, urutan: Number(e.target.value) })} />
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium">Wajib</label>
                  <select className="input-field" value={reqForm.is_wajib ? 'true' : 'false'} onChange={(e) => setReqForm({ ...reqForm, is_wajib: e.target.value === 'true' })}>
                    <option value="true">Ya</option><option value="false">Tidak</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" size="sm" onClick={() => setShowReqForm(false)}>Batal</Button>
                <Button type="submit" size="sm" isLoading={addMut.isPending}>Tambah</Button>
              </div>
            </form>
          ) : (
            <Button variant="secondary" size="sm" icon={<Plus size={16} />} onClick={() => setShowReqForm(true)}>Tambah Persyaratan</Button>
          )}
        </div>
      )}
    </Modal>
  );
}
