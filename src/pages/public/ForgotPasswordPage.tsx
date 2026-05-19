import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PublicNavbar from '@/components/layout/PublicNavbar';
import ShieldLogo from '@/components/ui/ShieldLogo';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import api from '@/services/api';
import Copyright from '@/components/layout/Copyright';

const forgotSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotForm) => {
    try {
      await api.post('/auth/forgot-password', { email: data.email });
      setSubmittedEmail(data.email);
      setSubmitted(true);
    } catch (err: unknown) {
      // Always show success to prevent email enumeration
      setSubmittedEmail(data.email);
      setSubmitted(true);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f9fa]">
      <PublicNavbar />

      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="card p-8 sm:p-10">
            {/* Header */}
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="mb-4">
                <ShieldLogo size="lg" showLabel={false} />
              </div>
              <p className="text-sm font-semibold text-on-surface mb-1">CertiPENS</p>

              {submitted ? (
                <>
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-status-verified-bg">
                    <CheckCircle2 size={28} className="text-status-verified" />
                  </div>
                  <h1 className="text-headline-md text-on-surface mb-2">Cek Email Anda</h1>
                  <p className="text-body-md text-on-surface-variant">
                    Instruksi reset password telah dikirim ke{' '}
                    <strong>{submittedEmail}</strong>. Silakan cek inbox atau folder spam.
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-headline-md text-on-surface mb-2">Lupa Password?</h1>
                  <p className="text-body-md text-on-surface-variant">
                    Masukkan email yang terdaftar dan kami akan mengirimkan instruksi untuk mereset password Anda.
                  </p>
                </>
              )}
            </div>

            {!submitted ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <Input
                  label="Email"
                  type="email"
                  placeholder="nama@email.com"
                  error={errors.email?.message}
                  {...register('email')}
                />

                <Button type="submit" className="w-full" isLoading={isSubmitting}>
                  Kirim Instruksi Reset
                </Button>
              </form>
            ) : (
              <Button
                className="w-full"
                onClick={() => {
                  setSubmitted(false);
                  setSubmittedEmail('');
                }}
              >
                Kirim Ulang
              </Button>
            )}

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors"
              >
                <ArrowLeft size={16} />
                Kembali ke halaman login
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6">
        <Copyright />
      </footer>
    </div>
  );
}
