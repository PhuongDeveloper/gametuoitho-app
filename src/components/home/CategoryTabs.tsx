'use client';

import Link from 'next/link';
import type { Category } from '@/types/database';

interface CategoryTabsProps {
  activeCategory: string;
  categories?: Category[];
}

export default function CategoryTabs({ activeCategory, categories = [] }: CategoryTabsProps) {
  // If categories from DB is empty, use default genre list
  const displayCategories = categories.length > 0
    ? categories
    : [
        { id: '1', slug: 'hanh-dong', name: 'Hành Động', created_at: '' },
        { id: '2', slug: 'phieu-luu', name: 'Phiêu Lưu', created_at: '' },
        { id: '3', slug: 'nhap-vai', name: 'Nhập Vai (RPG)', created_at: '' },
        { id: '4', slug: 'tri-tue', name: 'Trí Tuệ', created_at: '' },
        { id: '5', slug: 'the-thao', name: 'Thể Thao', created_at: '' },
        { id: '6', slug: 'chien-thuat', name: 'Chiến Thuật', created_at: '' },
      ];

  const allTabs = [
    { slug: 'ALL', label: 'Tất Cả Game', color: 'bg-[#ff4757] text-white' },
    ...displayCategories.map((c) => ({
      slug: c.slug,
      label: c.name,
      color: 'bg-[#ff4757] text-white',
    })),
    { slug: 'VIP', label: 'Game VIP Pro', color: 'bg-[#ffa502] text-[#231f20]' },
  ];

  return (
    <div id="games" className="my-8">
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4">
        {allTabs.map((cat) => {
          const isActive = activeCategory === cat.slug || (activeCategory === 'ALL' && cat.slug === 'ALL');
          const href = cat.slug === 'ALL' ? '/' : `/?category=${cat.slug}#games`;

          return (
            <Link
              key={cat.slug}
              href={href}
              className={`px-6 py-3.5 rounded-xl font-black text-sm sm:text-base uppercase tracking-wide transition-all duration-150 border-[3px] border-[#231f20] ${
                isActive
                  ? `${cat.color} shadow-[6px_6px_0px_#231f20] -translate-y-1`
                  : 'bg-white text-[#231f20] hover:bg-[#fff8e1] shadow-[4px_4px_0px_#231f20] active:translate-y-0.5 active:shadow-[2px_2px_0px_#231f20]'
              }`}
            >
              {cat.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
