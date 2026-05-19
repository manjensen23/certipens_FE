import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { registrationsService } from '@/services/registrations.service';
import { certificationsService } from '@/services/certifications.service';
import Table from '@/components/ui/Table';
import type { Column } from '@/components/ui/Table';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Pagination from '@/components/ui/Pagination';
import toast from 'react-hot-toast';
import { Eye, Search, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import type { Pendaftaran, BerkasPendaftaran } from '@/types';

export default function RegistrationsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [jenisFilter, setJenisFilter] = useState('');
  const [search, setSearch] = useState('');
  const [detailItem, setDetailItem] = useState<Pendaftaran | null>(null);
  const [verifyData, setVerifyData] = useState({ status: '', catatan_admin: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-registrations', page, statusFilter, jenisFilter, search],
    queryFn: () => registrationsService.adminList({
      page, limit: 10,
      status: statusFilter || undefined,
      id_jenis: jenisFilter ? Number(jenisFilter) : undefined,
      search: search || undefined,
    }),
  });

  const { data: certs } = useQuery({
    queryKey: ['certifications-list'],
    queryFn: () => certificationsService.list({ limit: 100 }),
  });

  // Fetch detail when detailItem is set (to get berkas & persyaratan)
  const { data: detailData, isLoading: detailLoading } = useQuery({
    queryKey: ['registration-detail', detailItem?.id_pendaftaran],
    queryFn: () => registrationsService.getDetail(detailItem!.id_pendaftaran),
    enabled: !!detailItem,
  });

  const verifyMutation = useMutation({
    mutationFn: ({ id, ...payload }: { id: number; status: 'diverifikasi' | 'ditolak'; catatan_admin?: string }) =>
      registrationsService.verifyRegistration(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-registrations'] });
      toast.success('Pendaftaran berhasil diverifikasi');
      setDetailItem(null);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Gagal memverifikasi pendaftaran'),
  });

  const verifyBerkasMutation = useMutation({
    mutationFn: ({ id, ...payload }: { id: number; status_verifikasi: 'valid' | 'tidak_valid'; catatan_verifikasi?: string }) =>
      registrationsService.verifyBerkas(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registration-detail'] });
      toast.success('Berkas diverifikasi');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Gagal verifikasi berkas'),
  });

  const handleVerify = (status: 'diverifikasi' | 'ditolak') => {
    if (!detailItem) return;
    verifyMutation.mutate({
      id: detailItem.id_pendaftaran,
      status,
      catatan_admin: verifyData.catatan_admin || undefined,
    });
  };

  const columns: Column<Pendaftaran>[] = [
    {
      key: 'nama', label: 'Nama Asesi',
      render: (item) => (
        <span className="font-medium">{item.asesi_nama || '-'}</span>
      ),
    },
    {
      key: 'sertifikasi', label: 'Jenis Sertifikasi',
      render: (item) => item.nama_sertifikasi || '-',
    },
    {
      key: 'tanggal_daftar', label: 'Tanggal',
      render: (item) => item.tanggal_daftar
        ? format(new Date(item.tanggal_daftar), 'd MMM yyyy', { locale: idLocale })
        : '-',
    },
    {
      key: 'status', label: 'Status',
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: 'actions', label: 'Aksi',
      render: (item) => (
        <button onClick={() => setDetailItem(item)} className="btn btn-ghost btn-sm" title="Detail">
          <Eye size={16} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-headline-md text-on-surface">Pendaftaran</h1>
        <p className="text-body-md text-on-surface-variant mt-1">Verifikasi dan kelola pendaftaran sertifikasi</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline" />
          <input
            className="input-field pl-9"
            placeholder="Cari nama asesi..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="input-field w-auto"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">Semua Status</option>
          <option value="pending">Pending</option>
          <option value="diverifikasi">Diverifikasi</option>
          <option value="ditolak">Ditolak</option>
          <option value="draft">Draft</option>
        </select>
        <select
          className="input-field w-auto"
          value={jenisFilter}
          onChange={(e) => { setJenisFilter(e.target.value); setPage(1); }}
        >
          <option value="">Semua Jenis</option>
          {(certs?.data || []).map((c) => (
            <option key={c.id_jenis} value={c.id_jenis}>{c.nama_sertifikasi}</option>
          ))}
        </select>
      </div>

      <Table columns={columns} data={data?.data || []} keyExtractor={(item) => item.id_pendaftaran} isLoading={isLoading} />
      <Pagination currentPage={page} totalPages={data?.meta?.totalPages || 1} onPageChange={setPage} />

      {/* Detail Modal */}
      <Modal isOpen={!!detailItem} onClose={() => setDetailItem(null)} title="Detail Pendaftaran" size="lg">
        {detailItem && (
          <div className="space-y-6">
            {detailLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : (
              <>
                {/* Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-on-surface-variant">Nama:</span><p className="font-medium">{detailData?.asesi_nama || detailItem.asesi_nama || '-'}</p></div>
                  <div><span className="text-on-surface-variant">Sertifikasi:</span><p className="font-medium">{detailData?.nama_sertifikasi || detailItem.nama_sertifikasi || '-'}</p></div>
                  <div><span className="text-on-surface-variant">Status:</span><p><StatusBadge status={detailItem.status} /></p></div>
                  <div><span className="text-on-surface-variant">Tanggal Daftar:</span><p className="font-medium">{detailItem.tanggal_daftar ? format(new Date(detailItem.tanggal_daftar), 'd MMMM yyyy', { locale: idLocale }) : '-'}</p></div>
                </div>

                {/* Berkas */}
                {detailData?.berkas && detailData.berkas.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-on-surface mb-3">Berkas Persyaratan</h3>
                    <div className="space-y-2">
                      {detailData.berkas.map((b: BerkasPendaftaran) => (
                        <div key={b.id_berkas} className="flex items-center justify-between rounded-lg border border-outline-variant p-3">
                          <div>
                            <p className="text-sm font-medium">{b.nama_persyaratan || `Berkas #${b.id_berkas}`}</p>
                            <p className="text-xs text-on-surface-variant">{b.file_name} · {(b.file_size / 1024 / 1024).toFixed(1)}MB</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={b.status_verifikasi} />
                            {b.status_verifikasi === 'pending' && (
                              <div className="flex gap-1">
                                <button onClick={() => verifyBerkasMutation.mutate({ id: b.id_berkas, status_verifikasi: 'valid' })} className="btn btn-ghost btn-sm text-status-verified" title="Valid">
                                  <CheckCircle size={16} />
                                </button>
                                <button onClick={() => verifyBerkasMutation.mutate({ id: b.id_berkas, status_verifikasi: 'tidak_valid' })} className="btn btn-ghost btn-sm text-error" title="Tidak Valid">
                                  <XCircle size={16} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Persyaratan yang belum diupload */}
                {detailData?.persyaratan && detailData.persyaratan.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-on-surface mb-3">Daftar Persyaratan</h3>
                    <div className="space-y-2">
                      {detailData.persyaratan.map((p) => {
                        const uploaded = detailData.berkas?.find((b: BerkasPendaftaran) => b.id_persyaratan === p.id_persyaratan);
                        return (
                          <div key={p.id_persyaratan} className="flex items-center justify-between rounded-lg bg-surface-container/50 p-3">
                            <div>
                              <p className="text-sm font-medium">{p.urutan}. {p.nama_persyaratan}</p>
                              <p className="text-xs text-on-surface-variant">Tipe: {p.tipe_file} {p.is_wajib ? '• Wajib' : '• Opsional'}</p>
                            </div>
                            {uploaded ? (
                              <StatusBadge status={uploaded.status_verifikasi} />
                            ) : (
                              <span className="text-xs text-on-surface-variant">Belum diupload</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Verify actions */}
                {detailItem.status === 'pending' && (
                  <div className="border-t border-outline-variant pt-4 space-y-3">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium">Catatan Admin</label>
                      <textarea
                        className="input-field min-h-[80px]"
                        value={verifyData.catatan_admin}
                        onChange={(e) => setVerifyData({ ...verifyData, catatan_admin: e.target.value })}
                        placeholder="Catatan (wajib jika ditolak)"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button variant="danger" onClick={() => handleVerify('ditolak')} isLoading={verifyMutation.isPending} icon={<XCircle size={16} />}>
                        Tolak
                      </Button>
                      <Button onClick={() => handleVerify('diverifikasi')} isLoading={verifyMutation.isPending} icon={<CheckCircle size={16} />}>
                        Verifikasi
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
