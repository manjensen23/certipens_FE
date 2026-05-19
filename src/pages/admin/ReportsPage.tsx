import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsService } from '@/services/reports.service';
import { certificationsService } from '@/services/certifications.service';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import toast from 'react-hot-toast';
import { Download, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import type { ReportFilters } from '@/types';

export default function ReportsPage() {
  const [filters, setFilters] = useState<ReportFilters>({});

  const { data, isLoading } = useQuery({
    queryKey: ['reports', filters],
    queryFn: () => reportsService.getRegistrationReport(filters),
  });

  const { data: certs } = useQuery({
    queryKey: ['certifications-list'],
    queryFn: () => certificationsService.list({ limit: 100 }),
  });

  const handleExport = async () => {
    try {
      const blob = await reportsService.exportCSV(filters);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `laporan-pendaftaran-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('File CSV berhasil didownload');
    } catch {
      toast.error('Gagal mengexport laporan');
    }
  };

  const summary = data?.summary;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-md text-on-surface">Laporan</h1>
          <p className="text-body-md text-on-surface-variant mt-1">Laporan dan analisis pendaftaran</p>
        </div>
        <Button icon={<Download size={18} />} onClick={handleExport}>Export CSV</Button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={16} className="text-on-surface-variant" />
          <span className="text-sm font-semibold text-on-surface">Filter</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <select className="input-field" value={filters.status || ''} onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}>
            <option value="">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="diverifikasi">Diverifikasi</option>
            <option value="ditolak">Ditolak</option>
            <option value="draft">Draft</option>
          </select>
          <select className="input-field" value={filters.id_jenis || ''} onChange={(e) => setFilters({ ...filters, id_jenis: e.target.value ? Number(e.target.value) : undefined })}>
            <option value="">Semua Jenis</option>
            {(certs?.data || []).map((c) => <option key={c.id_jenis} value={c.id_jenis}>{c.nama_sertifikasi}</option>)}
          </select>
          <Input type="date" value={filters.start_date || ''} onChange={(e) => setFilters({ ...filters, start_date: e.target.value || undefined })} placeholder="Dari tanggal" />
          <Input type="date" value={filters.end_date || ''} onChange={(e) => setFilters({ ...filters, end_date: e.target.value || undefined })} placeholder="Sampai tanggal" />
        </div>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Total', value: summary.total, variant: 'primary' as const },
            { label: 'Pending', value: summary.pending, variant: 'warning' as const },
            { label: 'Diverifikasi', value: summary.diverifikasi, variant: 'success' as const },
            { label: 'Ditolak', value: summary.ditolak, variant: 'error' as const },
            { label: 'Draft', value: summary.draft, variant: 'secondary' as const },
          ].map((s) => (
            <div key={s.label} className="card p-4 text-center">
              <p className="text-2xl font-bold text-on-surface">{s.value}</p>
              <Badge variant={s.variant} className="mt-2">{s.label}</Badge>
            </div>
          ))}
        </div>
      )}

      {/* Results table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Asesi</th>
              <th>Sertifikasi</th>
              <th>Tanggal Daftar</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 5 }).map((_, j) => <td key={j}><div className="h-4 rounded bg-surface-container-high animate-pulse" /></td>)}</tr>
              ))
            ) : (data?.data || []).length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-sm text-on-surface-variant">Tidak ada data</td></tr>
            ) : (
              (data?.data || []).map((reg, idx) => (
                <tr key={reg.id_pendaftaran}>
                  <td>{idx + 1}</td>
                  <td className="font-medium">{reg.asesi_nama || '-'}</td>
                  <td>{reg.nama_sertifikasi || '-'}</td>
                  <td>{reg.tanggal_daftar ? format(new Date(reg.tanggal_daftar), 'd MMM yyyy', { locale: idLocale }) : '-'}</td>
                  <td><StatusBadge status={reg.status} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
