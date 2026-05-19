import api from './api';
import type {
  ApiResponse,
  JadwalSertifikasi,
  PaginatedResponse,
  ScheduleFilters,
} from '@/types';

export const schedulesService = {
  async list(params?: ScheduleFilters): Promise<PaginatedResponse<JadwalSertifikasi>> {
    const { data } = await api.get('/schedules', { params });
    return { data: data.data, meta: data.meta };
  },

  async getDetail(id: number): Promise<JadwalSertifikasi> {
    const { data } = await api.get<ApiResponse<JadwalSertifikasi>>(`/schedules/${id}`);
    return data.data;
  },

  async create(payload: {
    id_jenis: number;
    tanggal: string;
    waktu_mulai: string;
    waktu_selesai: string;
    lokasi: string;
    kuota: number;
  }): Promise<JadwalSertifikasi> {
    const { data } = await api.post<ApiResponse<JadwalSertifikasi>>('/admin/schedules', payload);
    return data.data;
  },

  async update(id: number, payload: Partial<{
    tanggal: string;
    waktu_mulai: string;
    waktu_selesai: string;
    lokasi: string;
    kuota: number;
  }>): Promise<JadwalSertifikasi> {
    const { data } = await api.put<ApiResponse<JadwalSertifikasi>>(`/admin/schedules/${id}`, payload);
    return data.data;
  },

  async publish(id: number): Promise<void> {
    await api.patch(`/admin/schedules/${id}/publish`);
  },

  async assign(id: number, payload: {
    pendaftaran_ids: number[];
    id_asesor?: number;
  }): Promise<void> {
    await api.post(`/admin/schedules/${id}/assign`, payload);
  },
};
