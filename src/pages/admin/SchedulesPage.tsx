import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schedulesService } from '@/services/schedules.service';
import { certificationsService } from '@/services/certifications.service';
import { registrationsService } from '@/services/registrations.service';
import { usersService } from '@/services/users.service';
import Table from '@/components/ui/Table';
import type { Column } from '@/components/ui/Table';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Pagination from '@/components/ui/Pagination';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import toast from 'react-hot-toast';
import { Plus, Pencil, Send, UserPlus, Users, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import type { JadwalSertifikasi, Pendaftaran, User } from '@/types';

export default function SchedulesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<JadwalSertifikasi | null>(null);
  const [publishItem, setPublishItem] = useState<JadwalSertifikasi | null>(null);
  const [formData, setFormData] = useState({
    id_jenis: '', tanggal: '', waktu_mulai: '', waktu_selesai: '', lokasi: '', kuota: 30,
  });

  // Assign modal state
  const [assignSchedule, setAssignSchedule] = useState<JadwalSertifikasi | null>(null);
  const [selectedRegs, setSelectedRegs] = useState<number[]>([]);
  const [selectedAsesor, setSelectedAsesor] = useState<string>('');

  const { data, isLoading } = useQuery({
    queryKey: ['schedules', page],
    queryFn: () => schedulesService.list({ page, limit: 10 }),
  });

  const { data: certs } = useQuery({
    queryKey: ['certifications-list'],
    queryFn: () => certificationsService.list({ limit: 100 }),
  });

  // Fetch verified registrations for the assign modal's sertifikasi
  const { data: verifiedRegs, isLoading: regsLoading } = useQuery({
    queryKey: ['verified-registrations', assignSchedule?.id_jenis],
    queryFn: () => registrationsService.adminList({
      status: 'diverifikasi',
      id_jenis: assignSchedule!.id_jenis,
      limit: 100,
    }),
    enabled: !!assignSchedule,
  });

  // Fetch asesor list for dropdown
  const { data: asesors } = useQuery({
    queryKey: ['asesor-list'],
    queryFn: () => usersService.list({ role: 'asesor', limit: 100 }),
    enabled: !!assignSchedule,
  });

  const createMutation = useMutation({
    mutationFn: schedulesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast.success('Jadwal berhasil dibuat');
      closeForm();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Gagal membuat jadwal'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...p }: { id: number } & Parameters<typeof schedulesService.update>[1]) =>
      schedulesService.update(id, p),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast.success('Jadwal berhasil diupdate');
      closeForm();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Gagal update jadwal'),
  });

  const publishMutation = useMutation({
    mutationFn: schedulesService.publish,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast.success('Jadwal berhasil dipublish');
      setPublishItem(null);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Gagal publish jadwal'),
  });

  const assignMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: { pendaftaran_ids: number[]; id_asesor?: number } }) =>
      schedulesService.assign(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['schedule-detail'] });
      toast.success('Peserta berhasil di-assign ke jadwal');
      // Refresh detail
      if (assignSchedule) {
        openAssign(assignSchedule);
      }
      setSelectedRegs([]);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Gagal assign peserta'),
  });

  const openCreate = () => {
    setEditItem(null);
    setFormData({ id_jenis: '', tanggal: '', waktu_mulai: '', waktu_selesai: '', lokasi: '', kuota: 30 });
    setShowForm(true);
  };

  const openEdit = (item: JadwalSertifikasi) => {
    setEditItem(item);
    setFormData({
      id_jenis: String(item.id_jenis),
      tanggal: item.tanggal?.split('T')[0] || '',
      waktu_mulai: item.waktu_mulai || '',
      waktu_selesai: item.waktu_selesai || '',
      lokasi: item.lokasi || '',
      kuota: item.kuota || 30,
    });
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditItem(null); };

  const openAssign = async (item: JadwalSertifikasi) => {
    try {
      const detail = await schedulesService.getDetail(item.id_jadwal);
      setAssignSchedule(detail);
      setSelectedRegs([]);
      setSelectedAsesor('');
    } catch {
      toast.error('Gagal memuat detail jadwal');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      id_jenis: Number(formData.id_jenis),
      tanggal: formData.tanggal,
      waktu_mulai: formData.waktu_mulai,
      waktu_selesai: formData.waktu_selesai,
      lokasi: formData.lokasi,
      kuota: formData.kuota,
    };
    if (editItem) {
      updateMutation.mutate({ id: editItem.id_jadwal, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleAssign = () => {
    if (!assignSchedule || selectedRegs.length === 0) return;
    assignMutation.mutate({
      id: assignSchedule.id_jadwal,
      payload: {
        pendaftaran_ids: selectedRegs,
        id_asesor: selectedAsesor ? Number(selectedAsesor) : undefined,
      },
    });
  };

  const toggleRegSelection = (regId: number) => {
    setSelectedRegs((prev) =>
      prev.includes(regId)
        ? prev.filter((id) => id !== regId)
        : [...prev, regId]
    );
  };

  // Already-assigned registration IDs to filter out
  const assignedRegIds = new Set(assignSchedule?.peserta?.map((p) => p.id_pendaftaran) || []);

  // Available registrations (verified & not already assigned)
  const availableRegs = (verifiedRegs?.data || []).filter((r) => !assignedRegIds.has(r.id_pendaftaran));

  const columns: Column<JadwalSertifikasi>[] = [
    { key: 'sertifikasi', label: 'Sertifikasi', render: (i) => i.nama_sertifikasi || '-' },
    { key: 'tanggal', label: 'Tanggal', render: (i) => i.tanggal ? format(new Date(i.tanggal), 'd MMM yyyy', { locale: idLocale }) : '-' },
    { key: 'waktu', label: 'Waktu', render: (i) => `${i.waktu_mulai || ''} - ${i.waktu_selesai || ''}` },
    { key: 'lokasi', label: 'Lokasi' },
    { key: 'kuota', label: 'Kuota', render: (i) => `${i.jumlah_peserta ?? 0}/${i.kuota}` },
    { key: 'status', label: 'Status', render: (i) => <StatusBadge status={i.status} /> },
    {
      key: 'actions', label: 'Aksi',
      render: (i) => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(i)} className="btn btn-ghost btn-sm" title="Edit">
            <Pencil size={16} />
          </button>
          {i.status === 'draft' && (
            <button onClick={() => setPublishItem(i)} className="btn btn-ghost btn-sm text-primary" title="Publish">
              <Send size={16} />
            </button>
          )}
          {i.status === 'published' && (
            <button onClick={() => openAssign(i)} className="btn btn-ghost btn-sm text-status-verified" title="Kelola Peserta">
              <UserPlus size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-md text-on-surface">Jadwal</h1>
          <p className="text-body-md text-on-surface-variant mt-1">Kelola jadwal sertifikasi</p>
        </div>
        <Button icon={<Plus size={18} />} onClick={openCreate}>Tambah Jadwal</Button>
      </div>

      <Table columns={columns} data={data?.data || []} keyExtractor={(i) => i.id_jadwal} isLoading={isLoading} />
      <Pagination currentPage={page} totalPages={data?.meta?.totalPages || 1} onPageChange={setPage} />

      {/* Create/Edit Modal */}
      <Modal isOpen={showForm} onClose={closeForm} title={editItem ? 'Edit Jadwal' : 'Tambah Jadwal'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Jenis Sertifikasi</label>
            <select className="input-field" value={formData.id_jenis} onChange={(e) => setFormData({ ...formData, id_jenis: e.target.value })} required>
              <option value="">Pilih sertifikasi</option>
              {(certs?.data || []).map((c) => <option key={c.id_jenis} value={c.id_jenis}>{c.nama_sertifikasi}</option>)}
            </select>
          </div>
          <Input label="Tanggal" type="date" value={formData.tanggal} onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Waktu Mulai" type="time" value={formData.waktu_mulai} onChange={(e) => setFormData({ ...formData, waktu_mulai: e.target.value })} required />
            <Input label="Waktu Selesai" type="time" value={formData.waktu_selesai} onChange={(e) => setFormData({ ...formData, waktu_selesai: e.target.value })} required />
          </div>
          <Input label="Lokasi" value={formData.lokasi} onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })} required />
          <Input label="Kuota" type="number" value={formData.kuota} onChange={(e) => setFormData({ ...formData, kuota: Number(e.target.value) })} required />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={closeForm}>Batal</Button>
            <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>{editItem ? 'Simpan' : 'Tambah'}</Button>
          </div>
        </form>
      </Modal>

      {/* Assign Peserta Modal */}
      <Modal isOpen={!!assignSchedule} onClose={() => setAssignSchedule(null)} title="Kelola Peserta" size="lg">
        {assignSchedule && (
          <div className="space-y-6">
            {/* Schedule Info Header */}
            <div className="rounded-lg bg-surface-container/60 p-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-on-surface-variant text-xs">Sertifikasi</span>
                  <p className="font-medium text-on-surface">{assignSchedule.nama_sertifikasi}</p>
                </div>
                <div>
                  <span className="text-on-surface-variant text-xs">Tanggal</span>
                  <p className="font-medium text-on-surface">
                    {assignSchedule.tanggal ? format(new Date(assignSchedule.tanggal), 'd MMM yyyy', { locale: idLocale }) : '-'}
                  </p>
                </div>
                <div>
                  <span className="text-on-surface-variant text-xs">Lokasi</span>
                  <p className="font-medium text-on-surface">{assignSchedule.lokasi}</p>
                </div>
                <div>
                  <span className="text-on-surface-variant text-xs">Kuota</span>
                  <p className="font-medium text-on-surface">
                    {assignSchedule.peserta?.length || 0} / {assignSchedule.kuota}
                  </p>
                </div>
              </div>
            </div>

            {/* Already Assigned Participants */}
            <div>
              <h4 className="text-title-sm font-semibold text-on-surface mb-3 flex items-center gap-2">
                <Users size={16} /> Peserta Terdaftar ({assignSchedule.peserta?.length || 0})
              </h4>
              {assignSchedule.peserta && assignSchedule.peserta.length > 0 ? (
                <div className="rounded-lg border border-outline-variant overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-surface-container/30 border-b border-outline-variant">
                        <th className="px-4 py-2 text-left text-xs font-semibold text-on-surface-variant">Nama Asesi</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-on-surface-variant">Email</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-on-surface-variant">Asesor</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-on-surface-variant">Kehadiran</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {assignSchedule.peserta.map((p) => (
                        <tr key={p.id} className="hover:bg-surface-container/20">
                          <td className="px-4 py-2.5 text-on-surface">{p.asesi_nama}</td>
                          <td className="px-4 py-2.5 text-on-surface-variant text-xs">{p.asesi_email}</td>
                          <td className="px-4 py-2.5">{p.asesor_nama || <span className="text-on-surface-variant">-</span>}</td>
                          <td className="px-4 py-2.5"><StatusBadge status={p.status_kehadiran} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-on-surface-variant">Belum ada peserta</p>
              )}
            </div>

            {/* Add New Participants */}
            <div className="border-t border-outline-variant pt-5">
              <h4 className="text-title-sm font-semibold text-on-surface mb-3 flex items-center gap-2">
                <UserPlus size={16} /> Tambah Peserta
              </h4>

              {/* Asesor selection */}
              <div className="mb-4 space-y-1.5">
                <label className="block text-sm font-medium text-on-surface">Pilih Asesor (opsional)</label>
                <select
                  className="input-field"
                  value={selectedAsesor}
                  onChange={(e) => setSelectedAsesor(e.target.value)}
                >
                  <option value="">Tanpa Asesor</option>
                  {(asesors?.data || []).map((a: User) => (
                    <option key={a.id_user} value={a.id_user}>{a.nama_lengkap} ({a.email})</option>
                  ))}
                </select>
              </div>

              {/* Available registrations */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-on-surface mb-2">
                  Pendaftaran Terverifikasi ({availableRegs.length} tersedia)
                </label>

                {regsLoading ? (
                  <div className="animate-pulse space-y-2">
                    {[1, 2].map((i) => <div key={i} className="h-10 bg-surface-container-high rounded" />)}
                  </div>
                ) : availableRegs.length > 0 ? (
                  <div className="rounded-lg border border-outline-variant max-h-60 overflow-y-auto divide-y divide-outline-variant">
                    {availableRegs.map((reg: Pendaftaran) => (
                      <label
                        key={reg.id_pendaftaran}
                        className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                          selectedRegs.includes(reg.id_pendaftaran) ? 'bg-primary-alpha-10' : 'hover:bg-surface-container/30'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedRegs.includes(reg.id_pendaftaran)}
                          onChange={() => toggleRegSelection(reg.id_pendaftaran)}
                          className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-on-surface">{reg.asesi_nama || 'Asesi'}</p>
                          <p className="text-xs text-on-surface-variant">
                            REG-{String(reg.id_pendaftaran).padStart(4, '0')}
                          </p>
                        </div>
                        <StatusBadge status={reg.status} />
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-on-surface-variant py-4 text-center">
                    Tidak ada pendaftaran terverifikasi yang belum di-assign
                  </p>
                )}
              </div>

              {/* Assign button */}
              {availableRegs.length > 0 && (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-on-surface-variant">
                    {selectedRegs.length} peserta dipilih
                  </p>
                  <Button
                    onClick={handleAssign}
                    disabled={selectedRegs.length === 0}
                    isLoading={assignMutation.isPending}
                    icon={<CheckCircle2 size={16} />}
                  >
                    Assign ke Jadwal
                  </Button>
                </div>
              )}
            </div>

            {/* Close button */}
            <div className="flex justify-end pt-2 border-t border-outline-variant">
              <Button variant="secondary" onClick={() => setAssignSchedule(null)}>Tutup</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Publish Confirmation */}
      <ConfirmDialog isOpen={!!publishItem} onClose={() => setPublishItem(null)} onConfirm={() => publishItem && publishMutation.mutate(publishItem.id_jadwal)} title="Publish Jadwal" message="Jadwal yang dipublish akan terlihat oleh peserta. Lanjutkan?" confirmLabel="Publish" variant="primary" isLoading={publishMutation.isPending} />
    </div>
  );
}
