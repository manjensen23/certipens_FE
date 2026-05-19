import api from './api';
import type {
  ApiResponse,
  Pendaftaran,
  PaginatedResponse,
  RegistrationFilters,
} from '@/types';

export const registrationsService = {
  // === Admin ===
  async adminList(params?: RegistrationFilters): Promise<PaginatedResponse<Pendaftaran>> {
    const { data } = await api.get('/admin/registrations', { params });
    return { data: data.data, meta: data.meta };
  },

  async getDetail(id: number): Promise<Pendaftaran> {
    const { data } = await api.get<ApiResponse<Pendaftaran>>(`/registrations/${id}`);
    return data.data;
  },

  async verifyRegistration(id: number, payload: { status: 'diverifikasi' | 'ditolak'; catatan_admin?: string }): Promise<Pendaftaran> {
    const { data } = await api.patch<ApiResponse<Pendaftaran>>(`/admin/registrations/${id}/verify`, payload);
    return data.data;
  },

  async verifyBerkas(berkasId: number, payload: { status_verifikasi: 'valid' | 'tidak_valid'; catatan_verifikasi?: string }): Promise<void> {
    await api.patch(`/admin/berkas/${berkasId}/verify`, payload);
  },

  // === Asesi ===
  async myRegistrations(params?: RegistrationFilters): Promise<PaginatedResponse<Pendaftaran>> {
    const { data } = await api.get('/registrations/my', { params });
    return { data: data.data, meta: data.meta };
  },

  async create(payload: { id_jenis: number }): Promise<Pendaftaran> {
    const { data } = await api.post<ApiResponse<Pendaftaran>>('/registrations', payload);
    return data.data;
  },

  async uploadFile(registrationId: number, file: File, idPersyaratan: number): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('id_persyaratan', String(idPersyaratan));
    await api.post(`/registrations/${registrationId}/files`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  async submit(registrationId: number): Promise<Pendaftaran> {
    const { data } = await api.post<ApiResponse<Pendaftaran>>(`/registrations/${registrationId}/submit`);
    return data.data;
  },

  async deleteRegistration(id: number): Promise<void> {
    await api.delete(`/registrations/${id}`);
  },
};
