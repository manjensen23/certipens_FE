import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { certificationsService } from '@/services/certifications.service';
import { registrationsService } from '@/services/registrations.service';
import { useAuthStore } from '@/store/authStore';
import RegistrationStepper from '@/components/shared/RegistrationStepper';
import FileUploader from '@/components/shared/FileUploader';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import {
  Search,
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  FileText,
  User,
  CheckCircle2,
  AlertTriangle,
  X,
} from 'lucide-react';
import type { JenisSertifikasi, Pendaftaran, PersyaratanKhusus } from '@/types';

const STEPS = [
  { label: 'Pilih Sertifikasi', description: 'Pilih jenis sertifikasi' },
  { label: 'Review Persyaratan', description: 'Cek persyaratan & profil' },
  { label: 'Upload Berkas', description: 'Upload dokumen' },
  { label: 'Review & Submit', description: 'Konfirmasi & kirim' },
];

export default function RegisterCertPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCert, setSelectedCert] = useState<JenisSertifikasi | null>(null);
  const [draftRegistration, setDraftRegistration] = useState<Pendaftaran | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Record<number, { name: string; size: number }>>({});
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [agreed, setAgreed] = useState(false);
  const [resumeLoading, setResumeLoading] = useState(false);

  // Check for draft query param to resume
  const draftId = searchParams.get('draft');

  // Resume existing draft registration
  useEffect(() => {
    if (!draftId) return;

    const resumeDraft = async () => {
      setResumeLoading(true);
      try {
        const detail = await registrationsService.getDetail(Number(draftId));

        if (detail.status !== 'draft') {
          toast.error('Pendaftaran ini sudah tidak berstatus draft');
          navigate('/asesi/sertifikasi');
          return;
        }

        // Set draft registration
        setDraftRegistration(detail);

        // Fetch certification detail
        const certDetail = await certificationsService.getById(detail.id_jenis);
        setSelectedCert(certDetail);

        // Populate uploaded files from existing berkas
        if (detail.berkas && detail.berkas.length > 0) {
          const files: Record<number, { name: string; size: number }> = {};
          for (const b of detail.berkas) {
            files[b.id_persyaratan] = { name: b.file_name, size: b.file_size };
          }
          setUploadedFiles(files);
        }

        // Determine which step to resume to
        // If has berkas uploaded, go to step 2 (upload) or step 3 (review)
        if (detail.berkas && detail.berkas.length > 0) {
          setCurrentStep(2); // Upload step, so they can continue uploading or proceed
        } else {
          setCurrentStep(2); // Go straight to upload (draft already exists)
        }

        toast.success('Draft pendaftaran dimuat');
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Gagal memuat draft pendaftaran');
        navigate('/asesi/sertifikasi');
      } finally {
        setResumeLoading(false);
      }
    };

    resumeDraft();
  }, [draftId, navigate]);

  // Step 1: Fetch certifications
  const { data: certsData, isLoading: certsLoading } = useQuery({
    queryKey: ['certifications', searchQuery, categoryFilter],
    queryFn: () =>
      certificationsService.list({
        limit: 50,
        search: searchQuery || undefined,
        kategori: categoryFilter || undefined,
      }),
    enabled: !draftId, // Don't fetch if resuming draft
  });

  // Step 2: Fetch certification detail
  const { data: certDetail } = useQuery({
    queryKey: ['certification-detail', selectedCert?.id_jenis],
    queryFn: () => certificationsService.getById(selectedCert!.id_jenis),
    enabled: !!selectedCert && currentStep >= 1,
  });

  // Create draft registration
  const createDraftMut = useMutation({
    mutationFn: () => registrationsService.create({ id_jenis: selectedCert!.id_jenis }),
    onSuccess: (data) => {
      setDraftRegistration(data);
      setCurrentStep(2);
      toast.success('Draft pendaftaran dibuat');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message || 'Gagal membuat pendaftaran');
    },
  });

  // Upload file
  const uploadFileMut = useMutation({
    mutationFn: ({ file, persyaratanId }: { file: File; persyaratanId: number }) =>
      registrationsService.uploadFile(draftRegistration!.id_pendaftaran, file, persyaratanId),
    onSuccess: () => {
      setUploadingId(null);
      toast.success('Berkas berhasil diupload');
    },
    onError: () => {
      setUploadingId(null);
      toast.error('Gagal upload berkas');
    },
  });

  // Submit registration
  const submitMut = useMutation({
    mutationFn: () => registrationsService.submit(draftRegistration!.id_pendaftaran),
    onSuccess: () => {
      toast.success('Pendaftaran berhasil dikirim!');
      navigate('/asesi/sertifikasi');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message || 'Gagal submit pendaftaran');
    },
  });

  const handleFileSelect = useCallback(
    (persyaratanId: number, file: File) => {
      setUploadingId(persyaratanId);
      setUploadedFiles((prev) => ({ ...prev, [persyaratanId]: { name: file.name, size: file.size } }));
      uploadFileMut.mutate({ file, persyaratanId });
    },
    [uploadFileMut],
  );

  const handleCancel = () => {
    navigate('/asesi/sertifikasi');
  };

  // Extract unique categories
  const categories = [...new Set(certsData?.data?.map((c) => c.kategori) || [])];

  // Requirements from detail
  const requirements: PersyaratanKhusus[] = certDetail?.persyaratan || [];
  const requiredReqs = requirements.filter((r) => r.is_wajib);
  const allRequiredUploaded = requiredReqs.every((r) => uploadedFiles[r.id_persyaratan]);

  // Show loading state while resuming draft
  if (resumeLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
          <p className="text-sm text-on-surface-variant">Memuat draft pendaftaran...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-md text-on-surface">Daftar Sertifikasi</h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Ikuti langkah-langkah berikut untuk mendaftar sertifikasi
          </p>
        </div>
        <Button variant="secondary" onClick={handleCancel} className="gap-1.5">
          <X size={16} /> Batal
        </Button>
      </div>

      {/* Stepper */}
      <div className="card p-6">
        <RegistrationStepper
          steps={STEPS}
          currentStep={currentStep}
          onStepClick={(step) => step < currentStep && setCurrentStep(step)}
        />
      </div>

      {/* Step Content */}
      <div className="card p-6">
        {/* ===== STEP 1: Pilih Sertifikasi ===== */}
        {currentStep === 0 && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="flex items-center gap-2 rounded-lg bg-surface-container px-3 py-2 flex-1">
                <Search size={18} className="text-on-surface-variant shrink-0" />
                <input
                  type="text"
                  placeholder="Cari sertifikasi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/60 outline-none w-full"
                />
              </div>
              {/* Category filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Semua Kategori</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {certsLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-xl border border-outline-variant p-5 animate-pulse">
                    <div className="h-5 w-3/4 bg-surface-container-high rounded mb-3" />
                    <div className="h-4 w-1/2 bg-surface-container-high rounded mb-4" />
                    <div className="h-6 w-20 bg-surface-container-high rounded-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {certsData?.data?.map((cert) => (
                  <button
                    key={cert.id_jenis}
                    type="button"
                    onClick={() => {
                      setSelectedCert(cert);
                      setCurrentStep(1);
                    }}
                    className={`card-hover rounded-xl border-2 p-5 text-left transition-all ${
                      selectedCert?.id_jenis === cert.id_jenis
                        ? 'border-primary bg-primary-alpha-10'
                        : 'border-outline-variant hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-alpha-10 text-primary shrink-0">
                        <GraduationCap size={20} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-on-surface">{cert.nama_sertifikasi}</h3>
                        <span className="badge badge-primary text-[10px] mt-1">{cert.kategori}</span>
                      </div>
                    </div>
                    {cert.deskripsi && (
                      <p className="text-xs text-on-surface-variant line-clamp-2 mb-3">{cert.deskripsi}</p>
                    )}
                    <div className="flex items-center gap-1.5">
                      <FileText size={12} className="text-on-surface-variant" />
                      <span className="text-xs text-on-surface-variant">
                        {cert.persyaratan_count || 0} persyaratan
                      </span>
                    </div>
                  </button>
                ))}
                {certsData?.data?.length === 0 && (
                  <div className="col-span-full text-center py-10 text-on-surface-variant">
                    <GraduationCap size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Tidak ada sertifikasi ditemukan</p>
                  </div>
                )}
              </div>
            )}

            {/* Bottom actions for step 1 */}
            <div className="flex justify-start pt-4 border-t border-outline-variant">
              <Button variant="secondary" onClick={handleCancel}>
                <ArrowLeft size={16} /> Kembali
              </Button>
            </div>
          </div>
        )}

        {/* ===== STEP 2: Review Persyaratan ===== */}
        {currentStep === 1 && certDetail && (
          <div className="space-y-6">
            {/* Certification info */}
            <div className="rounded-lg bg-surface-container/50 p-5">
              <div className="flex items-center gap-3 mb-3">
                <GraduationCap size={24} className="text-primary" />
                <div>
                  <h3 className="text-lg font-semibold text-on-surface">{certDetail.nama_sertifikasi}</h3>
                  <span className="badge badge-primary text-xs">{certDetail.kategori}</span>
                </div>
              </div>
              {certDetail.deskripsi && (
                <p className="text-sm text-on-surface-variant">{certDetail.deskripsi}</p>
              )}
            </div>

            {/* Requirements list */}
            <div>
              <h4 className="text-title-md font-semibold text-on-surface mb-3">Persyaratan Berkas</h4>
              <div className="space-y-2">
                {requirements.map((req, i) => (
                  <div key={req.id_persyaratan} className="flex items-center gap-3 rounded-lg border border-outline-variant p-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-container text-xs font-bold text-on-surface-variant">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-on-surface">{req.nama_persyaratan}</p>
                      <p className="text-xs text-on-surface-variant">
                        Tipe: {req.tipe_file}
                      </p>
                    </div>
                    <span className={`badge text-[10px] ${req.is_wajib ? 'badge-rejected' : 'badge-draft'}`}>
                      {req.is_wajib ? 'Wajib' : 'Opsional'}
                    </span>
                  </div>
                ))}
                {requirements.length === 0 && (
                  <p className="text-sm text-on-surface-variant">Tidak ada persyaratan khusus</p>
                )}
              </div>
            </div>

            {/* Profile review */}
            <div>
              <h4 className="text-title-md font-semibold text-on-surface mb-3">Profil Anda</h4>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-lg bg-surface-container/50 p-3">
                  <User size={16} className="text-on-surface-variant" />
                  <div>
                    <p className="text-xs text-on-surface-variant">Nama</p>
                    <p className="text-sm font-medium text-on-surface">{user?.nama_lengkap || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-surface-container/50 p-3">
                  <User size={16} className="text-on-surface-variant" />
                  <div>
                    <p className="text-xs text-on-surface-variant">Email</p>
                    <p className="text-sm font-medium text-on-surface">{user?.email || '-'}</p>
                  </div>
                </div>
              </div>
              {(!user?.nama_lengkap || !user?.no_telepon) && (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-status-pending-bg p-3 text-sm text-status-pending">
                  <AlertTriangle size={16} />
                  Profil belum lengkap. Pastikan nama dan no telepon sudah diisi.
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4 border-t border-outline-variant">
              <Button variant="secondary" onClick={() => setCurrentStep(0)}>
                <ArrowLeft size={16} /> Kembali
              </Button>
              <Button
                onClick={() => createDraftMut.mutate()}
                isLoading={createDraftMut.isPending}
              >
                Lanjutkan <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        )}

        {/* ===== STEP 3: Upload Berkas ===== */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-title-md font-semibold text-on-surface mb-1">Upload Berkas Persyaratan</h3>
              <p className="text-sm text-on-surface-variant">
                Upload semua berkas yang diperlukan. Format: PDF, JPG, PNG (max 5MB)
              </p>
            </div>

            <div className="space-y-5">
              {requirements.map((req) => (
                <FileUploader
                  key={req.id_persyaratan}
                  label={req.nama_persyaratan}
                  isRequired={req.is_wajib}
                  acceptedTypes={req.tipe_file.split(',').map((t) => t.trim().toLowerCase())}
                  maxSizeMB={5}
                  uploadedFile={uploadedFiles[req.id_persyaratan] || null}
                  isUploading={uploadingId === req.id_persyaratan}
                  progress={uploadingId === req.id_persyaratan ? 50 : 0}
                  onFileSelect={(file) => handleFileSelect(req.id_persyaratan, file)}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4 border-t border-outline-variant">
              <Button variant="secondary" onClick={() => draftId ? handleCancel() : setCurrentStep(1)}>
                <ArrowLeft size={16} /> Kembali
              </Button>
              <Button
                onClick={() => setCurrentStep(3)}
                disabled={!allRequiredUploaded}
              >
                Lanjutkan <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        )}

        {/* ===== STEP 4: Review & Submit ===== */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h3 className="text-title-md font-semibold text-on-surface">Review Pendaftaran</h3>

            {/* Summary: Certification */}
            <div className="rounded-lg border border-outline-variant p-4">
              <h4 className="text-sm font-semibold text-on-surface mb-2">Jenis Sertifikasi</h4>
              <div className="flex items-center gap-3">
                <GraduationCap size={20} className="text-primary" />
                <div>
                  <p className="text-sm font-medium text-on-surface">{certDetail?.nama_sertifikasi}</p>
                  <span className="badge badge-primary text-[10px]">{certDetail?.kategori}</span>
                </div>
              </div>
            </div>

            {/* Summary: Uploaded files */}
            <div className="rounded-lg border border-outline-variant p-4">
              <h4 className="text-sm font-semibold text-on-surface mb-3">Berkas yang Diupload</h4>
              <div className="space-y-2">
                {requirements.map((req) => {
                  const file = uploadedFiles[req.id_persyaratan];
                  return (
                    <div key={req.id_persyaratan} className="flex items-center gap-3">
                      {file ? (
                        <CheckCircle2 size={16} className="text-status-verified shrink-0" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-outline-variant shrink-0" />
                      )}
                      <span className="text-sm text-on-surface flex-1">{req.nama_persyaratan}</span>
                      <span className="text-xs text-on-surface-variant">
                        {file ? file.name : 'Belum diupload'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Agreement checkbox */}
            <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-outline-variant p-4 hover:bg-surface-container/30 transition-colors">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
              />
              <span className="text-sm text-on-surface">
                Saya menyatakan bahwa data dan berkas yang diberikan adalah benar dan dapat dipertanggungjawabkan.
              </span>
            </label>

            {/* Actions */}
            <div className="flex justify-between pt-4 border-t border-outline-variant">
              <Button variant="secondary" onClick={() => setCurrentStep(2)}>
                <ArrowLeft size={16} /> Kembali
              </Button>
              <Button
                onClick={() => submitMut.mutate()}
                isLoading={submitMut.isPending}
                disabled={!agreed}
              >
                <CheckCircle2 size={16} /> Kirim Pendaftaran
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
