import api from './api';
import type {
  ApiResponse,
  JenisSertifikasi,
  PaginatedResponse,
  PaginationParams,
  PersyaratanKhusus,
} from '@/types';

export const certificationsService = {
  // === Public ===
  async list(params?: PaginationParams & { kategori?: string; search?: string }): Promise<PaginatedResponse<JenisSertifikasi>> {
    const { data } = await api.get('/certifications', { params });
    // Backend spreads {data: [...], meta: {...}} at root level
    return { data: data.data, meta: data.meta };
  },

  async getById(id: number): Promise<JenisSertifikasi> {
    const { data } = await api.get<ApiResponse<JenisSertifikasi>>(`/certifications/${id}`);
    return data.data;
  },

  // === Admin ===
  async create(payload: { nama_sertifikasi: string; kategori: string; deskripsi?: string }): Promise<JenisSertifikasi> {
    const { data } = await api.post<ApiResponse<JenisSertifikasi>>('/admin/certifications', payload);
    return data.data;
  },

  async update(id: number, payload: Partial<{ nama_sertifikasi: string; kategori: string; deskripsi: string; is_active: boolean }>): Promise<JenisSertifikasi> {
    const { data } = await api.put<ApiResponse<JenisSertifikasi>>(`/admin/certifications/${id}`, payload);
    return data.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/admin/certifications/${id}`);
  },

  // === Requirements ===
  async addRequirement(certId: number, payload: Omit<PersyaratanKhusus, 'id_persyaratan' | 'id_jenis' | 'created_at'>): Promise<PersyaratanKhusus> {
    const { data } = await api.post<ApiResponse<PersyaratanKhusus>>(`/admin/certifications/${certId}/requirements`, payload);
    return data.data;
  },

  async updateRequirement(reqId: number, payload: Partial<PersyaratanKhusus>): Promise<PersyaratanKhusus> {
    const { data } = await api.put<ApiResponse<PersyaratanKhusus>>(`/admin/requirements/${reqId}`, payload);
    return data.data;
  },

  async deleteRequirement(reqId: number): Promise<void> {
    await api.delete(`/admin/requirements/${reqId}`);
  },
};
