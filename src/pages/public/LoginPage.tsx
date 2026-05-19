import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/authStore';
import type { LoginPayload } from '@/types';
import PublicNavbar from '@/components/layout/PublicNavbar';
import ShieldLogo from '@/components/ui/ShieldLogo';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import Copyright from '@/components/layout/Copyright';

const REMEMBER_KEY = 'certipens_remember_email';

const loginSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(1, 'Kata sandi wajib diisi'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  // Load remembered email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem(REMEMBER_KEY);
    if (savedEmail) {
      setValue('email', savedEmail);
      setRememberMe(true);
    }
  }, [setValue]);

  const onSubmit = async (data: LoginPayload) => {
    try {
      // Handle "Ingat Saya"
      if (rememberMe) {
        localStorage.setItem(REMEMBER_KEY, data.email);
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }

      await login(data);
      const user = useAuthStore.getState().user;
      toast.success('Login berhasil!');

      switch (user?.role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'asesi':
          navigate('/asesi/dashboard');
          break;
        case 'asesor':
          navigate('/asesor/dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Login gagal. Periksa email dan password Anda.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f9fa]">
      <PublicNavbar />

      {/* Main content */}
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="card p-8 sm:p-10">
            {/* Header */}
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="mb-4">
                <ShieldLogo size="lg" showLabel={false} />
              </div>
              <p className="text-sm font-semibold text-on-surface mb-1">CertiPENS</p>
              <h1 className="text-headline-md text-on-surface mb-2">Selamat Datang Kembali</h1>
              <p className="text-body-md text-on-surface-variant">
                Silakan masuk ke akun Anda untuk melanjutkan
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                label="Email"
                type="email"
                placeholder="nama@email.com"
                error={errors.email?.message}
                {...register('email')}
              />

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="block text-sm font-medium text-on-surface">
                    Kata Sandi
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Lupa Password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`input-field w-full pr-10 ${errors.password ? 'border-error' : ''}`}
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
                {errors.password && (
                  <p className="mt-1 text-xs text-error">{errors.password.message}</p>
                )}
              </div>

              {/* Ingat Saya */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
                />
                <span className="text-sm text-on-surface-variant">Ingat Saya</span>
              </label>

              <Button type="submit" className="w-full" isLoading={isSubmitting}>
                Masuk
              </Button>
            </form>

            {/* Footer link */}
            <p className="mt-6 text-center text-sm text-on-surface-variant">
              Belum punya akun?{' '}
              <Link to="/register" className="font-semibold text-primary hover:underline">
                Daftar di sini
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6">
        <Copyright />
      </footer>
    </div>
  );
}
