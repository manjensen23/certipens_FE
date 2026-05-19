import api from './api';
import type { ApiResponse, DashboardStats, RegistrationReport, ReportFilters } from '@/types';

export const reportsService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const { data } = await api.get<ApiResponse<DashboardStats>>('/admin/reports/dashboard');
    return data.data;
  },

  async getRegistrationReport(params?: ReportFilters): Promise<RegistrationReport> {
    const { data } = await api.get('/admin/reports/registrations', { params });
    // Backend spreads {summary, data} at root level
    return { summary: data.summary, data: data.data };
  },

  async exportCSV(params?: ReportFilters): Promise<Blob> {
    const { data } = await api.get('/admin/reports/export', {
      params,
      responseType: 'blob',
    });
    return data;
  },
};
