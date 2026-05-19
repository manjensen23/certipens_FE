import { useQuery } from '@tanstack/react-query';
import { reportsService } from '@/services/reports.service';
import StatusBadge from '@/components/ui/StatusBadge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Users,
  FilePlus,
  Clock,
  CalendarDays,
  ArrowRight,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import type { DashboardStats } from '@/types';

function StatCardSkeleton() {
  return (
    <div className="card p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-5 w-24 rounded bg-surface-container-high" />
        <div className="h-10 w-10 rounded-xl bg-surface-container-high" />
      </div>
      <div className="h-8 w-16 rounded bg-surface-container-high" />
    </div>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: () => reportsService.getDashboardStats(),
  });

  const currentYear = new Date().getFullYear();

  // Derive stat card values from backend response
  const statCards = [
    {
      label: 'Total Asesi',
      value: stats?.users?.asesi ?? 0,
      icon: <Users size={22} />,
      color: 'text-primary',
      bg: 'bg-primary-alpha-10',
    },
    {
      label: 'Diverifikasi',
      value: stats?.pendaftaran?.diverifikasi ?? 0,
      icon: <FilePlus size={22} />,
      color: 'text-status-verified',
      bg: 'bg-status-verified-bg',
    },
    {
      label: 'Menunggu Verifikasi',
      value: stats?.pendaftaran?.pending ?? 0,
      icon: <Clock size={22} />,
      color: 'text-status-pending',
      bg: 'bg-status-pending-bg',
    },
    {
      label: 'Sertifikasi Aktif',
      value: stats?.sertifikasi_aktif ?? 0,
      icon: <CalendarDays size={22} />,
      color: 'text-[#8b5cf6]',
      bg: 'bg-[#f5f3ff]',
    },
  ];

  // Transform chart data to match recharts expected format
  const chartData = (stats?.pendaftaran_per_bulan || []).map((item) => ({
    bulan: item.month,
    jumlah: parseInt(item.count, 10) || 0,
  }));

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-headline-md text-on-surface">Dashboard Admin</h1>
        <p className="text-body-md text-on-surface-variant mt-1">
          Selamat datang kembali, berikut ringkasan pendaftaran hari ini.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : statCards.map((card) => (
              <div key={card.label} className="card p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-on-surface-variant">{card.label}</p>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.bg} ${card.color}`}>
                    {card.icon}
                  </div>
                </div>
                <p className="text-3xl font-bold text-on-surface">
                  {card.value}
                </p>
              </div>
            ))}
      </div>

      {/* Chart */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-title-lg text-on-surface">Statistik Bulanan</h2>
            <p className="text-sm text-on-surface-variant mt-0.5">
              Trend Pendaftar {currentYear}
            </p>
          </div>
          <select
            className="rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary w-fit"
            defaultValue={currentYear}
          >
            <option value={currentYear}>{currentYear}</option>
            <option value={currentYear - 1}>{currentYear - 1}</option>
          </select>
        </div>

        {isLoading ? (
          <div className="h-64 rounded-lg bg-surface-container-high animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="bulan"
                tick={{ fontSize: 12, fill: '#717786' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#717786' }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              />
              <Bar
                dataKey="jumlah"
                fill="#005ab7"
                radius={[6, 6, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Recent registrations table */}
      <div className="card">
        <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant">
          <h2 className="text-title-lg text-on-surface">Pendaftaran Terbaru</h2>
          <Link
            to="/admin/registrations"
            className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1"
          >
            Lihat Semua <ArrowRight size={14} />
          </Link>
        </div>
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="h-4 w-8 rounded bg-surface-container-high" />
                <div className="h-4 w-32 rounded bg-surface-container-high" />
                <div className="h-4 w-24 rounded bg-surface-container-high flex-1" />
                <div className="h-4 w-20 rounded bg-surface-container-high" />
                <div className="h-6 w-16 rounded-full bg-surface-container-high" />
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container/50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wide">No</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Nama Asesi</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Jenis Sertifikasi</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Tanggal Daftar</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {(stats?.recent_pendaftaran || []).map((reg, index) => (
                  <tr key={reg.id_pendaftaran} className="hover:bg-surface-container/30 transition-colors">
                    <td className="px-6 py-4 text-sm text-on-surface-variant">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-alpha-10 text-primary text-xs font-bold shrink-0">
                          {reg.asesi_nama?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <span className="text-sm font-medium text-on-surface">
                          {reg.asesi_nama || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">
                      {reg.nama_sertifikasi || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">
                      {reg.tanggal_daftar
                        ? format(new Date(reg.tanggal_daftar), 'd MMM yyyy', { locale: idLocale })
                        : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={reg.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to="/admin/registrations"
                          className="inline-flex items-center gap-1 rounded-md bg-surface-container px-2.5 py-1.5 text-xs font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors"
                        >
                          <Eye size={14} />
                          Detail
                        </Link>
                        {reg.status === 'pending' && (
                          <Link
                            to="/admin/registrations"
                            className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                          >
                            <CheckCircle2 size={14} />
                            Verifikasi
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {(!stats?.recent_pendaftaran || stats.recent_pendaftaran.length === 0) && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-on-surface-variant">
                      Belum ada pendaftaran
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
