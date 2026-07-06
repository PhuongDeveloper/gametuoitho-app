export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import type { Game } from '@/types/database';

export default async function AdminGamesPage() {
  const supabase = await createClient();

  const { data: rawGames } = await supabase
    .from('games')
    .select('*')
    .order('created_at', { ascending: false });
  const games: Game[] = rawGames || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Game</h1>
          <p className="text-sm text-gray-500 mt-1">
            Tổng cộng {games.length} game trong kho
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/categories"
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-sm font-bold transition-colors"
          >
            Quản lý Thể loại
          </Link>
          <Link
            href="/admin/games/new"
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-colors"
          >
            <span>+</span> Thêm Game
          </Link>
        </div>
      </div>

      {/* Games Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-left">
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Trò chơi
                </th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Nền tảng
                </th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Thể loại
                </th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Năm
                </th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Lượt chơi
                </th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  VIP
                </th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Ngày thêm
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {games.map((game) => {
                const platform = game.platform || (game.file_url?.toLowerCase().endsWith('.jar') ? 'JAR' : 'GBA');
                return (
                  <tr
                    key={game.id}
                    className="hover:bg-gray-50/80 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                          {game.thumbnail_url ? (
                            <img
                              src={game.thumbnail_url}
                              alt={game.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
                              G
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">
                            {game.title}
                          </div>
                          <div className="text-xs text-gray-400 font-mono">
                            /{game.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                          platform === 'GBA'
                            ? 'bg-red-50 text-red-600 border-red-200'
                            : 'bg-blue-50 text-blue-600 border-blue-200'
                        }`}
                      >
                        {platform}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-700">
                      {game.genre || game.category}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {game.release_year || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {game.total_plays.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {game.is_vip_only ? (
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 border border-yellow-300">
                          VIP
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Miễn phí</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(game.created_at).toLocaleDateString('vi-VN')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
