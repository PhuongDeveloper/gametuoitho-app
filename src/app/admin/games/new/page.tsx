'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { slugify } from '@/lib/utils';
import Button from '@/components/ui/Button';
import GameCard from '@/components/game/GameCard';
import type { Game, Category } from '@/types/database';

export default function AddGamePage() {
  const router = useRouter();
  const supabase = createClient();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingRom, setUploadingRom] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    title: '',
    slug: '',
    category: 'hanh-dong',
    platform: 'GBA' as 'GBA' | 'JAR',
    genre: 'Hành Động',
    release_year: 2005,
    is_vip_only: false,
    thumbnail_url: '',
    file_url: '',
    description: '',
    controls_info: '',
    rating: 4.0,
  });

  useEffect(() => {
    const fetchCats = async () => {
      const { data } = await supabase.from('categories').select('*').order('name', { ascending: true });
      if (data && data.length > 0) {
        setCategories(data as Category[]);
        setForm((prev) => ({
          ...prev,
          category: data[0].slug,
          genre: data[0].name,
        }));
      } else {
        const fallback: Category[] = [
          { id: '1', name: 'Hành Động', slug: 'hanh-dong', created_at: '' },
          { id: '2', name: 'Phiêu Lưu', slug: 'phieu-luu', created_at: '' },
          { id: '3', name: 'Nhập Vai (RPG)', slug: 'nhap-vai', created_at: '' },
          { id: '4', name: 'Trí Tuệ', slug: 'tri-tue', created_at: '' },
        ];
        setCategories(fallback);
      }
    };
    fetchCats();
  }, [supabase]);

  const updateForm = (key: string, value: any) => {
    setForm((prev) => {
      const updated = { ...prev, [key]: value };
      if (key === 'title') {
        updated.slug = slugify(value);
      }
      return updated;
    });
  };

  const handleCategoryChange = (slugValue: string) => {
    const selected = categories.find((c) => c.slug === slugValue);
    updateForm('category', slugValue);
    if (selected) {
      updateForm('genre', selected.name);
    }
  };

  // Upload thumbnail to ImgBB via our API proxy
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingThumb(true);
    setError('');

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await fetch('/api/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64 }),
        });

        const data = await res.json();
        if (data.url) {
          updateForm('thumbnail_url', data.url);
        } else {
          setError('Lỗi upload ảnh: ' + (data.error || 'Unknown'));
        }
        setUploadingThumb(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setError('Lỗi upload ảnh thumbnail.');
      setUploadingThumb(false);
    }
  };

  // Upload ROM/JAR to Supabase Storage
  const handleRomUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingRom(true);
    setError('');

    // Auto detect Java JAR platform from extension
    if (file.name.toLowerCase().endsWith('.jar') || file.name.toLowerCase().endsWith('.jad')) {
      updateForm('platform', 'JAR');
    } else if (file.name.toLowerCase().endsWith('.gba')) {
      updateForm('platform', 'GBA');
    }

    try {
      const ext = file.name.split('.').pop();
      const fileName = `${form.slug || 'game'}-${Date.now()}.${ext}`;

      const { data, error: uploadError } = await supabase.storage
        .from('game-roms')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        setError('Lỗi upload file: ' + uploadError.message);
        setUploadingRom(false);
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('game-roms')
        .getPublicUrl(data.path);

      updateForm('file_url', publicUrl);
      setUploadingRom(false);
    } catch {
      setError('Lỗi upload file ROM/JAR.');
      setUploadingRom(false);
    }
  };

  // Submit game
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!form.title || !form.file_url) {
      setError('Vui lòng nhập tên game và upload file ROM/JAR.');
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from('games').insert({
      title: form.title,
      slug: form.slug,
      category: form.category,
      platform: form.platform,
      thumbnail_url: form.thumbnail_url || null,
      file_url: form.file_url,
      is_vip_only: form.is_vip_only,
      release_year: form.release_year || null,
      genre: form.genre || null,
      description: form.description || null,
      controls_info: form.controls_info || null,
      rating: form.rating,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  const previewGame: Game = {
    id: 'preview-id',
    title: form.title || 'Tên Trò Chơi Preview',
    slug: form.slug || 'preview',
    category: form.category,
    platform: form.platform,
    thumbnail_url: form.thumbnail_url || null,
    file_url: form.file_url || '',
    is_vip_only: form.is_vip_only,
    release_year: form.release_year,
    genre: form.genre,
    total_plays: 1234,
    rating: form.rating,
    description: form.description,
    controls_info: form.controls_info,
    created_at: new Date().toISOString(),
  };

  if (success) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center max-w-lg mx-auto my-12 shadow-sm">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Thêm Trò Chơi Thành Công!</h2>
        <p className="text-sm text-gray-500 mb-6 font-bold">
          Trò chơi &ldquo;{form.title}&rdquo; đã được xuất bản vào kho game {form.genre}.
        </p>
        <div className="flex justify-center gap-3">
          <Button
            onClick={() => {
              setSuccess(false);
              setForm({
                title: '',
                slug: '',
                category: categories[0]?.slug || 'hanh-dong',
                platform: 'GBA',
                genre: categories[0]?.name || 'Hành Động',
                release_year: 2005,
                is_vip_only: false,
                thumbnail_url: '',
                file_url: '',
                description: '',
                controls_info: '',
                rating: 4.0,
              });
            }}
          >
            Thêm game tiếp theo
          </Button>
          <Button variant="outline" onClick={() => router.push('/admin/games')}>
            Danh sách game
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Thêm Trò Chơi Mới</h1>
        <p className="text-sm text-gray-500 mt-1">
          Điền thông tin và tải lên file ROM/JAR để xuất bản game mới lên hệ thống.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-gray-200 space-y-6 shadow-sm">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-bold">
                {error}
              </div>
            )}

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Tên trò chơi *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => updateForm('title', e.target.value)}
                  placeholder="Pokemon Fire Red"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Slug (URL) *
                </label>
                <input
                  type="text"
                  required
                  value={form.slug}
                  onChange={(e) => updateForm('slug', e.target.value)}
                  placeholder="pokemon-fire-red"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* Category & Platform */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Thể Loại Game *
                </label>
                <select
                  value={form.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-red-500"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Trình Giả Lập / Nền Tảng *
                </label>
                <select
                  value={form.platform}
                  onChange={(e) => updateForm('platform', e.target.value as 'GBA' | 'JAR')}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-red-500"
                >
                  <option value="GBA">GBA (Game Boy Advance)</option>
                  <option value="JAR">JAR (Java J2ME)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Năm phát hành
                </label>
                <input
                  type="number"
                  value={form.release_year}
                  onChange={(e) => updateForm('release_year', parseInt(e.target.value))}
                  min={1980}
                  max={2030}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* Uploads */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Ảnh Thumbnail (Upload ImgBB)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.thumbnail_url}
                    onChange={(e) => updateForm('thumbnail_url', e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono"
                  />
                  <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-xl text-xs font-bold flex items-center shrink-0">
                    <span>{uploadingThumb ? 'Đang tải...' : 'Chọn ảnh'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                      disabled={uploadingThumb}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  File ROM (.gba) hoặc JAR (.jar) *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={form.file_url}
                    onChange={(e) => updateForm('file_url', e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono"
                  />
                  <label className="cursor-pointer bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-xl text-xs font-bold flex items-center shrink-0">
                    <span>{uploadingRom ? 'Đang tải...' : 'Upload File'}</span>
                    <input
                      type="file"
                      accept=".gba,.gbc,.gb,.zip,.jar,.jad"
                      onChange={handleRomUpload}
                      disabled={uploadingRom}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Description & Controls */}
            <div className="space-y-4 pt-2 border-t border-gray-100">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Mô tả trò chơi
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => updateForm('description', e.target.value)}
                  placeholder="Giới thiệu cốt truyện, lối chơi..."
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Hướng dẫn phím điều khiển
                </label>
                <textarea
                  rows={2}
                  value={form.controls_info}
                  onChange={(e) => updateForm('controls_info', e.target.value)}
                  placeholder="Phím Z = A, Phím X = B, Enter = Start..."
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* Rating & VIP */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Rating (0-5)
                </label>
                <input
                  type="number"
                  value={form.rating}
                  onChange={(e) => updateForm('rating', parseFloat(e.target.value))}
                  min={0}
                  max={5}
                  step={0.1}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-500"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-3 cursor-pointer bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 w-full">
                  <input
                    type="checkbox"
                    checked={form.is_vip_only}
                    onChange={(e) => updateForm('is_vip_only', e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded"
                  />
                  <span className="text-sm font-bold text-gray-700">
                    Chỉ dành riêng cho thành viên VIP Pro
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" loading={loading} className="w-full" size="lg">
                Xuất Bản Trò Chơi
              </Button>
            </div>
          </form>
        </div>

        {/* Preview Column */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
              Xem trước GameCard
            </h3>
            <div className="max-w-xs mx-auto">
              <GameCard game={previewGame} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
