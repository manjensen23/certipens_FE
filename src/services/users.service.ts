import api from './api';
import type { ApiResponse, User, PaginatedResponse, PaginationParams } from '@/types';

export interface AdminUserFilters extends PaginationParams {
  role?: string;
  search?: string;
  is_active?: boolean;
}

export interface CreateUserPayload {
  email: string;
  nama_lengkap: string;
  role: 'asesi' | 'asesor';
  no_telepon?: string;
}

export interface CreateUserResponse extends User {
  generated_password: string;
}

export const usersService = {
  async list(params?: AdminUserFilters): Promise<PaginatedResponse<User>> {
    const { data } = await api.get('/admin/users', { params });
    return { data: data.data, meta: data.meta };
  },

  async create(payload: CreateUserPayload): Promise<CreateUserResponse> {
    const { data } = await api.post<ApiResponse<CreateUserResponse>>('/admin/users', payload);
    return data.data;
  },

  async toggleActive(id: number, isActive: boolean): Promise<User> {
    const { data } = await api.patch<ApiResponse<User>>(`/admin/users/${id}/toggle`, { is_active: isActive });
    return data.data;
  },

  async deleteUser(id: number): Promise<void> {
    await api.delete(`/admin/users/${id}`);
  },
};
