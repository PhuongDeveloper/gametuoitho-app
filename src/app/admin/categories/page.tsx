'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { slugify } from '@/lib/utils';
import Button from '@/components/ui/Button';
import type { Category } from '@/types/database';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const supabase = createClient();

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error: fetchErr } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (!fetchErr && data) {
      setCategories(data as Category[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, [supabase]);

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(slugify(val));
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setAdding(true);

    if (!name.trim() || !slug.trim()) {
      setError('Vui lòng nhập tên và slug thể loại.');
      setAdding(false);
      return;
    }

    const { error: insertErr } = await supabase
      .from('categories')
      .insert({ name: name.trim(), slug: slug.trim() });

    if (insertErr) {
      setError('Lỗi khi thêm thể loại: ' + insertErr.message);
    } else {
      setSuccess(`Đã thêm thể loại "${name}" thành công!`);
      setName('');
      setSlug('');
      fetchCategories();
    }
    setAdding(false);
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa thể loại "${catName}" không?`)) return;

    const { error: delErr } = await supabase.from('categories').delete().eq('id', id);
    if (delErr) {
      alert('Lỗi xóa thể loại: ' + delErr.message);
    } else {
      fetchCategories();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Thể Loại Game (Categories)</h1>
        <p className="text-sm text-gray-600 mt-1">
          Thêm hoặc xóa các thể loại game (Hành động, Phiêu lưu, Nhập vai, Trí tuệ...) để phân loại trò chơi trên toàn trang web.
        </p>
      </div>

      {/* Add form */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm max-w-xl">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Thêm Thể Loại Mới</h2>
        <form onSubmit={handleAddCategory} className="space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg font-bold">{error}</div>}
          {success && <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg font-bold">{success}</div>}
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Tên thể loại (Ví dụ: Phiêu Lưu)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Nhập tên thể loại..."
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Slug URL (Tự tạo tự động)</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="phieu-luu"
              required
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono text-gray-600"
            />
          </div>

          <Button type="submit" loading={adding} className="w-full">
            Thêm Thể Loại
          </Button>
        </form>
      </div>

      {/* Category List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-4 bg-gray-50 border-b border-gray-200 font-bold text-sm text-gray-700">
          Danh Sách Thể Loại Hiện Có ({categories.length})
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500 text-sm">Đang tải danh sách...</div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            Chưa có thể loại nào trong cơ sở dữ liệu. Hãy thêm ở bảng phía trên hoặc chạy tệp migration `002_categories_and_genres.sql`.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase bg-gray-50/50">
                <th className="py-3 px-4">Tên Thể Loại</th>
                <th className="py-3 px-4">Slug URL</th>
                <th className="py-3 px-4">Ngày Tạo</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50/80">
                  <td className="py-3 px-4 font-bold text-gray-900">{cat.name}</td>
                  <td className="py-3 px-4 font-mono text-xs text-gray-600">{cat.slug}</td>
                  <td className="py-3 px-4 text-gray-500 text-xs">
                    {cat.created_at ? new Date(cat.created_at).toLocaleDateString('vi-VN') : 'Mặc định'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded text-xs font-bold transition-colors"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
