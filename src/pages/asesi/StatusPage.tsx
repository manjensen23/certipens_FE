import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { registrationsService } from '@/services/registrations.service';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';
import {
  GraduationCap,
  Plus,
  FileText,
  CheckCircle2,
  XCircle,
  Trash2,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import type { BerkasPendaftaran } from '@/types';

export default function StatusPage() {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [deleteModalId, setDeleteModalId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['my-registrations-all'],
    queryFn: () => registrationsService.myRegistrations({ limit: 50 }),
  });

  const { data: detailData, isFetching: detailLoading } = useQuery({
    queryKey: ['registration-detail', expandedId],
    queryFn: () => registrationsService.getDetail(expandedId!),
    enabled: !!expandedId,
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => registrationsService.deleteRegistration(id),
    onSuccess: () => {
      toast.success('Draft pendaftaran dihapus');
      queryClient.invalidateQueries({ queryKey: ['my-registrations-all'] });
      setDeleteModalId(null);
      setExpandedId(null);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Gagal menghapus draft'),
  });

  const registrations = data?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-md text-on-surface">Sertifikasi Saya</h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Pantau status pendaftaran sertifikasi Anda
          </p>
        </div>
        <Link to="/asesi/register-cert" className="btn btn-primary">
          <Plus size={16} /> Daftar Baru
        </Link>
      </div>

      {/* Registrations list */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-5 w-3/4 bg-surface-container-high rounded mb-3" />
              <div className="h-4 w-1/2 bg-surface-container-high rounded" />
            </div>
          ))}
        </div>
      ) : registrations.length === 0 ? (
        /* Empty state */
        <div className="card p-12 text-center">
          <GraduationCap size={56} className="mx-auto mb-4 text-on-surface-variant/30" />
          <h3 className="text-title-lg font-semibold text-on-surface mb-2">Belum Ada Pendaftaran</h3>
          <p className="text-sm text-on-surface-variant mb-6">
            Anda belum mendaftar sertifikasi apapun. Mulai daftar sekarang!
          </p>
          <Link to="/asesi/register-cert" className="btn btn-primary mx-auto inline-flex">
            <Plus size={16} /> Daftar Sekarang
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {registrations.map((reg) => {
            const isExpanded = expandedId === reg.id_pendaftaran;

            return (
              <div key={reg.id_pendaftaran} className="card overflow-hidden">
                {/* Card header (click to expand) */}
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : reg.id_pendaftaran)}
                  className="w-full flex items-center justify-between p-5 hover:bg-surface-container/30 transition-colors text-left"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-alpha-10 text-primary shrink-0">
                      <GraduationCap size={22} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-on-surface truncate">
                        {reg.nama_sertifikasi || 'Sertifikasi'}
                      </p>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        REG-{String(reg.id_pendaftaran).padStart(4, '0')} •{' '}
                        {reg.tanggal_daftar
                          ? format(new Date(reg.tanggal_daftar), 'd MMMM yyyy', { locale: idLocale })
                          : 'Draft'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge status={reg.status} />
                    {isExpanded ? (
                      <ChevronUp size={18} className="text-on-surface-variant" />
                    ) : (
                      <ChevronDown size={18} className="text-on-surface-variant" />
                    )}
                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-outline-variant p-5 space-y-4 animate-in slide-in-from-top-2">
                    {detailLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      </div>
                    ) : detailData ? (
                      <>
                        {/* Berkas list */}
                        <div>
                          <h4 className="text-sm font-semibold text-on-surface mb-3">Berkas Pendaftaran</h4>
                          <div className="space-y-2">
                            {detailData.berkas?.map((b: BerkasPendaftaran) => (
                              <div
                                key={b.id_berkas}
                                className="flex items-center gap-3 rounded-lg bg-surface-container/50 p-3"
                              >
                                <FileText size={16} className="text-on-surface-variant shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-on-surface truncate">{b.file_name}</p>
                                  <p className="text-xs text-on-surface-variant">
                                    {b.nama_persyaratan || '-'}
                                  </p>
                                </div>
                                {b.status_verifikasi === 'valid' ? (
                                  <CheckCircle2 size={16} className="text-status-verified" />
                                ) : b.status_verifikasi === 'tidak_valid' ? (
                                  <XCircle size={16} className="text-error" />
                                ) : (
                                  <StatusBadge status={b.status_verifikasi} />
                                )}
                              </div>
                            ))}
                            {(!detailData.berkas || detailData.berkas.length === 0) && (
                              <p className="text-sm text-on-surface-variant">Belum ada berkas</p>
                            )}
                          </div>
                        </div>

                        {/* Admin notes */}
                        {detailData.catatan_admin && (
                          <div className="rounded-lg bg-status-pending-bg p-4">
                            <p className="text-xs font-semibold text-on-surface mb-1">Catatan Admin:</p>
                            <p className="text-sm text-on-surface-variant">{detailData.catatan_admin}</p>
                          </div>
                        )}

                        {/* Draft actions */}
                        {reg.status === 'draft' && (
                          <div className="flex gap-3 pt-3 border-t border-outline-variant">
                            <Link
                              to={`/asesi/register-cert?draft=${reg.id_pendaftaran}`}
                              className="btn btn-primary flex-1 justify-center"
                            >
                              Lanjutkan <ArrowRight size={16} />
                            </Link>
                            <Button
                              variant="secondary"
                              className="text-error border-error/30 hover:bg-error/5"
                              onClick={() => setDeleteModalId(reg.id_pendaftaran)}
                            >
                              <Trash2 size={16} /> Hapus
                            </Button>
                          </div>
                        )}

                        {/* Rejected: re-register */}
                        {reg.status === 'ditolak' && (
                          <div className="pt-3 border-t border-outline-variant">
                            <Link
                              to="/asesi/register-cert"
                              className="btn btn-primary w-full justify-center"
                            >
                              <Plus size={16} /> Daftar Ulang
                            </Link>
                          </div>
                        )}
                      </>
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteModalId && (
        <Modal
          isOpen={!!deleteModalId}
          onClose={() => setDeleteModalId(null)}
          title="Hapus Draft Pendaftaran"
        >
          <p className="text-sm text-on-surface-variant mb-6">
            Apakah Anda yakin ingin menghapus draft pendaftaran ini? Tindakan ini tidak bisa dibatalkan.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeleteModalId(null)}>
              Batal
            </Button>
            <Button
              className="bg-error hover:bg-error/90 text-white"
              onClick={() => deleteMut.mutate(deleteModalId)}
              isLoading={deleteMut.isPending}
            >
              Hapus
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
