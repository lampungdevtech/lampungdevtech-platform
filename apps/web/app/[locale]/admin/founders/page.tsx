'use client';

import { useState, useEffect, useRef } from 'react';
import { Link } from '@/i18n/routing';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  UploadCloud,
  CheckCircle2,
  Linkedin,
  Github,
  Twitter,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  Image as ImageIcon,
  ExternalLink,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Founder {
  id: string;
  name: string;
  title: string;
  role: string;
  bio: string;
  bioEn?: string;
  image: string;
  linkedinUrl?: string;
  githubUrl?: string;
  twitterUrl?: string;
  order: number;
  isActive: boolean;
}

export default function AdminFoundersPage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [founders, setFounders] = useState<Founder[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Upload State
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadInfo, setUploadInfo] = useState<{
    originalSize?: number;
    compressedSize?: number;
    savedPercent?: number;
  } | null>(null);

  // Delete Alert State
  const [deleteTarget, setDeleteTarget] = useState<Founder | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    title: 'Co-Founder',
    role: '',
    bio: '',
    bioEn: '',
    image: '',
    linkedinUrl: '',
    githubUrl: '',
    twitterUrl: '',
    order: 1,
    isActive: true,
  });

  const fetchFounders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/founders');
      if (res.ok) {
        const data = await res.json();
        setFounders(data);
      }
    } catch (err) {
      console.warn('Gagal memuat data co-founders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFounders();
  }, []);

  const handleOpenAddDialog = () => {
    setIsEditing(false);
    setUploadInfo(null);
    setFormData({
      id: '',
      name: '',
      title: 'Co-Founder',
      role: 'Co-Founder',
      bio: '',
      bioEn: '',
      image: '',
      linkedinUrl: '',
      githubUrl: '',
      twitterUrl: '',
      order: founders.length + 1,
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (founder: Founder) => {
    setIsEditing(true);
    setUploadInfo(null);
    setFormData({
      id: founder.id,
      name: founder.name,
      title: founder.title || 'Co-Founder',
      role: founder.role,
      bio: founder.bio,
      bioEn: founder.bioEn || '',
      image: founder.image,
      linkedinUrl: founder.linkedinUrl || '',
      githubUrl: founder.githubUrl || '',
      twitterUrl: founder.twitterUrl || '',
      order: founder.order,
      isActive: founder.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setUploadInfo(null);

    const bodyData = new FormData();
    bodyData.append('file', file);

    try {
      const res = await fetch('/api/admin/founders/upload', {
        method: 'POST',
        body: bodyData,
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Gagal mengunggah foto');
      }

      setFormData((prev) => ({ ...prev, image: result.url }));
      setUploadInfo({
        originalSize: result.originalSize,
        compressedSize: result.compressedSize,
        savedPercent: result.savedPercent,
      });

      toast({
        title: 'Foto Berhasil Dikonversi!',
        description: `Foto dikonversi ke WebP dan dihemat ${result.savedPercent}% ukuran filenya.`,
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Gagal Upload Foto',
        description: err.message,
      });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({ variant: 'destructive', title: 'Nama Wajib Diisi' });
      return;
    }
    if (!formData.image.trim()) {
      toast({ variant: 'destructive', title: 'Foto Wajib Diunggah' });
      return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        const res = await fetch(`/api/admin/founders/${formData.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal memperbarui Co-Founder');

        toast({
          title: 'Co-Founder Diperbarui',
          description: `Data ${formData.name} berhasil disimpan.`,
        });
      } else {
        const res = await fetch('/api/admin/founders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal menambahkan Co-Founder');

        toast({
          title: 'Co-Founder Ditambahkan',
          description: `${formData.name} berhasil disimpan sebagai Co-Founder.`,
        });
      }

      setIsDialogOpen(false);
      fetchFounders();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Gagal Menyimpan',
        description: err.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/founders/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Gagal menghapus data Co-Founder');

      toast({
        title: 'Co-Founder Dihapus',
        description: `${deleteTarget.name} telah dihapus dari daftar.`,
      });
      setDeleteTarget(null);
      fetchFounders();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Gagal Menghapus',
        description: err.message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary ring-1 ring-primary/20">
              <Users className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Link
                  href="/admin"
                  className="text-xs text-primary font-medium hover:underline flex items-center gap-1 mb-0.5"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Pusat Kendali Admin
                </Link>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">About Community</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight mt-0.5">
                Kelola Data Founder & Co-Founder
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Atur profil Co-Founder komunitas Lampung Developer, unggah foto dengan konversi otomatis ke <strong>WebP</strong> untuk halaman About.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchFounders}
              disabled={loading}
              className="flex items-center gap-1.5"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Segarkan
            </Button>
            <Button
              onClick={handleOpenAddDialog}
              className="flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Tambah Co-Founder
            </Button>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="text-center py-20 text-muted-foreground">
            Memuat data Co-Founders...
          </div>
        ) : founders.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <h3 className="text-lg font-semibold">Belum Ada Co-Founder</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-6">
              Mulai tambahkan Co-Founder untuk ditampilkan di halaman About komunitas.
            </p>
            <Button onClick={handleOpenAddDialog}>Tambah Sekarang</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {founders.map((founder) => (
              <Card
                key={founder.id}
                className="overflow-hidden border hover:border-primary/40 transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-start gap-4">
                      <div className="relative shrink-0">
                        <img
                          src={founder.image}
                          alt={founder.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-primary/20 shadow-xs"
                        />
                        {founder.image.endsWith('.webp') && (
                          <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-[9px] font-bold text-white px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                            WebP
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            {founder.title || 'Co-Founder'}
                          </span>
                          {!founder.isActive && (
                            <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                              Nonaktif
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-base text-foreground truncate mt-1">
                          {founder.name}
                        </h3>
                        <p className="text-xs text-muted-foreground font-medium truncate">
                          {founder.role}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 pt-0 space-y-3">
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                      {founder.bio}
                    </p>

                    {founder.bioEn && (
                      <p className="text-[11px] text-muted-foreground/80 italic line-clamp-2 border-l-2 pl-2 border-primary/30">
                        EN: {founder.bioEn}
                      </p>
                    )}

                    {/* Social Links */}
                    <div className="flex items-center gap-2 pt-2 text-muted-foreground">
                      {founder.linkedinUrl && (
                        <a
                          href={founder.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary transition-colors p-1"
                          title="LinkedIn"
                        >
                          <Linkedin className="h-4 w-4" />
                        </a>
                      )}
                      {founder.githubUrl && (
                        <a
                          href={founder.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary transition-colors p-1"
                          title="GitHub"
                        >
                          <Github className="h-4 w-4" />
                        </a>
                      )}
                      {founder.twitterUrl && (
                        <a
                          href={founder.twitterUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary transition-colors p-1"
                          title="Twitter"
                        >
                          <Twitter className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </CardContent>
                </div>

                {/* Footer Action Bar */}
                <div className="p-4 pt-2 border-t bg-muted/10 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">
                    Urutan #{founder.order}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEditDialog(founder)}
                      className="h-8 px-2.5 text-xs"
                    >
                      <Edit2 className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(founder)}
                      className="h-8 px-2.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Hapus
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Dialog Form Tambah / Edit */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? 'Perbarui Data Co-Founder' : 'Tambah Co-Founder Baru'}
              </DialogTitle>
              <DialogDescription>
                Lengkapi informasi profil Co-Founder komunitas. Foto yang diunggah akan otomatis di-compress dan di-convert ke WebP.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 py-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Nama Lengkap *</label>
                  <Input
                    required
                    placeholder="Contoh: Muhammad Fari Madyan"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Title Jabatan *</label>
                  <Input
                    required
                    placeholder="Co-Founder"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Secara default menggunakan title <strong>Co-Founder</strong>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Peranan / Bidang Keahlian</label>
                  <Input
                    placeholder="Contoh: Community Lead / Technical Advisor"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Nomor Urutan Tampilan</label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        order: parseInt(e.target.value, 10) || 1,
                      })
                    }
                  />
                </div>
              </div>

              {/* Upload Foto Section */}
              <div className="space-y-2 pt-1 border-t border-b py-3">
                <label className="text-xs font-semibold flex items-center justify-between">
                  <span>Foto Co-Founder (Auto Convert to WebP) *</span>
                  {uploadingImage && (
                    <span className="text-[11px] text-primary flex items-center gap-1">
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      Mengompresi ke WebP...
                    </span>
                  )}
                </label>

                <div className="flex items-start gap-4">
                  {formData.image ? (
                    <div className="relative shrink-0">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-20 h-20 rounded-xl object-cover border-2 border-primary/30"
                      />
                      <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-[9px] font-bold text-white px-1.5 py-0.2 rounded-full uppercase">
                        WebP
                      </span>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center text-muted-foreground border border-dashed shrink-0">
                      <ImageIcon className="h-8 w-8 opacity-40" />
                    </div>
                  )}

                  <div className="flex-1 space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      className="hidden"
                      onChange={handleImageUpload}
                    />

                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={uploadingImage}
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5"
                      >
                        <UploadCloud className="h-4 w-4" />
                        {formData.image ? 'Ganti Foto' : 'Unggah Foto'}
                      </Button>

                      {formData.image && (
                        <Input
                          placeholder="URL Foto Langsung"
                          value={formData.image}
                          onChange={(e) =>
                            setFormData({ ...formData, image: e.target.value })
                          }
                          className="text-xs h-8 flex-1 min-w-[200px]"
                        />
                      )}
                    </div>

                    {uploadInfo && (
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 p-2 rounded-md border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        <span>
                          Dikonversi ke WebP: {formatBytes(uploadInfo.originalSize)} → <strong>{formatBytes(uploadInfo.compressedSize)}</strong> (Hemat {uploadInfo.savedPercent}%)
                        </span>
                      </div>
                    )}
                    <p className="text-[11px] text-muted-foreground">
                      Mendukung format JPG, PNG, atau WebP. Gambar akan otomatis di-resize dan dikompresi ke <strong>.webp</strong> di dalam server proyek.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bio ID & EN */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Bio Singkat (Bahasa Indonesia) *</label>
                <Textarea
                  rows={2}
                  required
                  placeholder="Ceritakan latar belakang teknis, fokus keahlian, dan peranannya di komunitas..."
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Bio Singkat (English Translation - Opsional)</label>
                <Textarea
                  rows={2}
                  placeholder="English summary of technical background and community role..."
                  value={formData.bioEn}
                  onChange={(e) =>
                    setFormData({ ...formData, bioEn: e.target.value })
                  }
                />
              </div>

              {/* Social Links */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-xs font-semibold flex items-center gap-1">
                    <Linkedin className="h-3.5 w-3.5 text-sky-600" />
                    LinkedIn URL
                  </label>
                  <Input
                    placeholder="https://linkedin.com/in/..."
                    value={formData.linkedinUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, linkedinUrl: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold flex items-center gap-1">
                    <Github className="h-3.5 w-3.5" />
                    GitHub URL
                  </label>
                  <Input
                    placeholder="https://github.com/..."
                    value={formData.githubUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, githubUrl: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold flex items-center gap-1">
                    <Twitter className="h-3.5 w-3.5 text-sky-500" />
                    Twitter / X URL
                  </label>
                  <Input
                    placeholder="https://twitter.com/..."
                    value={formData.twitterUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, twitterUrl: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                />
                <label htmlFor="isActiveCheck" className="text-xs cursor-pointer select-none">
                  Tampilkan profil ini secara aktif di halaman publik About
                </label>
              </div>

              <DialogFooter className="pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={saving || uploadingImage}>
                  {saving ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Tambahkan Co-Founder'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog Konfirmasi Hapus */}
        <AlertDialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Data Co-Founder?</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus data <strong>{deleteTarget?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isDeleting}
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
