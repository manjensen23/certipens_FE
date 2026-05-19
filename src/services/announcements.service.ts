import api from './api';
import type {
  ApiResponse,
  Pengumuman,
  PaginatedResponse,
  AnnouncementFilters,
} from '@/types';

export const announcementsService = {
  async list(params?: AnnouncementFilters): Promise<PaginatedResponse<Pengumuman>> {
    const { data } = await api.get('/announcements', { params });
    return { data: data.data, meta: data.meta };
  },

  async getDetail(id: number): Promise<Pengumuman> {
    const { data } = await api.get<ApiResponse<Pengumuman>>(`/announcements/${id}`);
    return data.data;
  },

  async create(payload: {
    judul: string;
    konten: string;
    target_role: 'all' | 'asesi' | 'asesor';
    is_published?: boolean;
  }): Promise<Pengumuman> {
    const { data } = await api.post<ApiResponse<Pengumuman>>('/admin/announcements', payload);
    return data.data;
  },

  async update(id: number, payload: Partial<{
    judul: string;
    konten: string;
    target_role: string;
    is_published: boolean;
  }>): Promise<Pengumuman> {
    const { data } = await api.put<ApiResponse<Pengumuman>>(`/admin/announcements/${id}`, payload);
    return data.data;
  },

  async publish(id: number): Promise<void> {
    await api.patch(`/admin/announcements/${id}/publish`);
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/admin/announcements/${id}`);
  },
};
