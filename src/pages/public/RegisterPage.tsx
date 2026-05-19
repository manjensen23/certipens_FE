import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '@/services/auth.service';
import PublicNavbar from '@/components/layout/PublicNavbar';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { Eye, EyeOff, User } from 'lucide-react';
import Copyright from '@/components/layout/Copyright';

const registerSchema = z
  .object({
    nama_lengkap: z.string().min(3, 'Nama minimal 3 karakter').max(100),
    email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
    nik: z.string().optional(),
    no_telepon: z.string().optional(),
    password: z
      .string()
      .min(8, 'Kata sandi minimal 8 karakter')
      .regex(/[A-Z]/, 'Harus mengandung huruf besar')
      .regex(/[a-z]/, 'Harus mengandung huruf kecil')
      .regex(/[0-9]/, 'Harus mengandung angka'),
    confirmPassword: z.string().min(1, 'Konfirmasi kata sandi wajib diisi'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Kata sandi tidak sama',
    path: ['confirmPassword'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      await authService.register({
        nama_lengkap: data.nama_lengkap,
        email: data.email,
        password: data.password,
        no_telepon: data.no_telepon,
        nik: data.nik,
      });
      toast.success('Registrasi berhasil! Silakan login.');
      navigate('/login');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Registrasi gagal. Coba lagi.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f9fa]">
      <PublicNavbar />

      {/* Main content */}
      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-headline-md text-on-surface font-bold">Registrasi Asesi</h1>
            <p className="text-body-md text-on-surface-variant mt-2">
              Silakan lengkapi formulir di bawah ini untuk mendaftar akun CertiPENS dan mulai proses sertifikasi Anda.
            </p>
          </div>

          {/* Form Card */}
          <div className="card">
            {/* Card header */}
            <div className="flex items-center gap-3 border-b border-outline-variant px-6 py-5 sm:px-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <User size={20} className="text-primary" />
              </div>
              <div>
                <h2 className="text-title-md font-semibold text-on-surface">Informasi Akun</h2>
                <p className="text-body-sm text-on-surface-variant">Data pribadi dan kredensial login</p>
              </div>
            </div>

            {/* Form body */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8">
              <div className="space-y-6">
                {/* Row 1: Nama + Email */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    label="Nama Lengkap"
                    placeholder="Masukkan nama lengkap"
                    error={errors.nama_lengkap?.message}
                    {...register('nama_lengkap')}
                  />
                  <Input
                    label="Email"
                    type="email"
                    placeholder="contoh@email.com"
                    error={errors.email?.message}
                    {...register('email')}
                  />
                </div>

                {/* Row 2: NIK/NIM + No. WhatsApp */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    label="NIK"
                    placeholder="Masukkan NIK"
                    error={errors.nik?.message}
                    {...register('nik')}
                  />
                  <Input
                    label="No. WhatsApp / Telepon"
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    error={errors.no_telepon?.message}
                    {...register('no_telepon')}
                  />
                </div>

                {/* Row 3: Password + Confirm */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="relative">
                    <Input
                      label="Kata Sandi"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Minimal 8 karakter"
                      error={errors.password?.message}
                      helperText="Kombinasi huruf besar, kecil, dan angka"
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                    >
                      {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      label="Konfirmasi Kata Sandi"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Ulangi kata sandi"
                      error={errors.confirmPassword?.message}
                      {...register('confirmPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                    >
                      {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit button */}
              <div className="mt-8">
                <Button type="submit" className="w-full" isLoading={isSubmitting}>
                  Daftar Akun
                </Button>
              </div>
            </form>
          </div>

          {/* Footer link */}
          <p className="mt-6 text-center text-sm text-on-surface-variant">
            Sudah punya akun?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Masuk di sini
            </Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6">
        <Copyright />
      </footer>
    </div>
  );
}
