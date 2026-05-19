// ================================
// Database entity types
// ================================

export interface User {
  id_user: number;
  email: string;
  nama_lengkap: string;
  role: 'admin' | 'asesi' | 'asesor';
  no_telepon: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfilAsesi {
  id_profil_asesi: number;
  id_user: number;
  nik: string | null;
  tempat_lahir: string | null;
  tanggal_lahir: string | null;
  jenis_kelamin: 'L' | 'P' | null;
  no_telepon: string | null;
  alamat: string | null;
  pendidikan_terakhir: string | null;
  asal_instansi: string | null;
  jabatan: string | null;
  foto_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfilAsesor {
  id_profil_asesor: number;
  id_user: number;
  nip: string | null;
  bidang_keahlian: string | null;
  no_sertifikat_asesor: string | null;
  created_at: string;
  updated_at: string;
}

export interface JenisSertifikasi {
  id_jenis: number;
  nama_sertifikasi: string;
  kategori: string;
  deskripsi: string | null;
  is_active: boolean;
  persyaratan_count?: number;
  // Populated by detail endpoint (getCertificationDetail)
  persyaratan?: PersyaratanKhusus[];
  created_at: string;
  updated_at: string;
}

export interface PersyaratanKhusus {
  id_persyaratan: number;
  id_jenis: number;
  nama_persyaratan: string;
  tipe_file: string;
  is_wajib: boolean;
  urutan: number;
  created_at: string;
}

export interface Pendaftaran {
  id_pendaftaran: number;
  id_asesi: number;
  id_jenis: number;
  status: 'draft' | 'pending' | 'diverifikasi' | 'ditolak';
  tanggal_daftar: string | null;
  catatan_admin: string | null;
  verified_by: number | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
  // Flat JOIN fields (from list/detail endpoints)
  nama_sertifikasi?: string;
  kategori?: string;
  asesi_nama?: string;
  asesi_email?: string;
  // Populated by detail endpoint (getRegistrationDetail)
  berkas?: BerkasPendaftaran[];
  persyaratan?: PersyaratanKhusus[];
}

export interface BerkasPendaftaran {
  id_berkas: number;
  id_pendaftaran: number;
  id_persyaratan: number;
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  status_verifikasi: 'pending' | 'valid' | 'tidak_valid';
  catatan_verifikasi: string | null;
  uploaded_at: string;
  // Flat JOIN fields (from detail endpoint)
  nama_persyaratan?: string;
  is_wajib?: boolean;
}

export interface JadwalSertifikasi {
  id_jadwal: number;
  id_jenis: number;
  tanggal: string;
  waktu_mulai: string;
  waktu_selesai: string;
  lokasi: string;
  kuota: number;
  jumlah_peserta?: number;
  status: 'draft' | 'published' | 'selesai';
  // Flat JOIN fields
  nama_sertifikasi?: string;
  kategori?: string;
  // Populated by detail endpoint
  peserta?: PesertaJadwal[];
  created_at: string;
  updated_at: string;
}

export interface PesertaJadwal {
  id: number;
  id_jadwal: number;
  id_pendaftaran: number;
  id_asesor: number | null;
  status_kehadiran: string;
  // Flat JOIN fields
  asesi_nama?: string;
  asesi_email?: string;
  asesor_nama?: string;
}

export interface Pengumuman {
  id_pengumuman: number;
  judul: string;
  konten: string;
  target_role: 'all' | 'asesi' | 'asesor';
  is_published: boolean;
  dibuat_oleh: number;
  pembuat?: User;
  created_at: string;
  updated_at: string;
}

// ================================
// API response types
// ================================

export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginatedMeta;
}

// ================================
// Auth types
// ================================

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  nama_lengkap: string;
  email: string;
  password: string;
  no_telepon?: string;
  nik?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  initAuth: () => Promise<void>;
  reset: () => void;
}

// ================================
// Dashboard / Report types
// ================================

export interface DashboardStats {
  pendaftaran: Record<string, number>;
  users: Record<string, number>;
  sertifikasi_aktif: number;
  pendaftaran_per_bulan: { month: string; count: string }[];
  recent_pendaftaran: Pendaftaran[];
}

export interface RegistrationReport {
  summary: {
    total: number;
    pending: number;
    diverifikasi: number;
    ditolak: number;
    draft: number;
  };
  data: Pendaftaran[];
}

// ================================
// Filter / Query params
// ================================

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface RegistrationFilters extends PaginationParams {
  status?: string;
  id_jenis?: number;
  search?: string;
}

export interface ScheduleFilters extends PaginationParams {
  status?: string;
  id_jenis?: number;
}

export interface AnnouncementFilters extends PaginationParams {
  target_role?: string;
}

export interface ReportFilters {
  status?: string;
  id_jenis?: number;
  start_date?: string;
  end_date?: string;
}
