export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import type { Game, Transaction } from '@/types/database';

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Stats
  const { count: totalGames } = await supabase
    .from('games')
    .select('*', { count: 'exact', head: true });

  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  const { count: totalVips } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('is_vip', true);

  const { data: rawTransactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(20);
  const transactions: Transaction[] = rawTransactions || [];

  const totalRevenue = transactions.reduce(
    (sum, t) => sum + t.amount,
    0
  );

  // Top games
  const { data: rawTopGames } = await supabase
    .from('games')
    .select('*')
    .order('total_plays', { ascending: false })
    .limit(10);
  const topGames: Game[] = rawTopGames || [];

  // Today's play logs count
  const today = new Date().toISOString().split('T')[0];
  const { count: todayPlays } = await supabase
    .from('play_logs')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today);

  const stats = [
    {
      label: 'Tổng Game',
      value: totalGames || 0,
      icon: 'game',
      color: 'from-red-500 to-red-600',
    },
    {
      label: 'Tổng Người dùng',
      value: totalUsers || 0,
      icon: 'users',
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: 'VIP Members',
      value: totalVips || 0,
      icon: 'star',
      color: 'from-amber-500 to-amber-600',
    },
    {
      label: 'Doanh thu',
      value: `${(totalRevenue / 1000).toFixed(0)}K`,
      icon: 'money',
      color: 'from-green-500 to-green-600',
    },
    {
      label: 'Lượt chơi hôm nay',
      value: todayPlays || 0,
      icon: 'fire',
      color: 'from-orange-500 to-orange-600',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Tổng quan hệ thống GameTuoiTho.online
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="stat-card animate-fade-in-up opacity-0"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Games */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
          <h2 className="text-sm font-bold text-gray-800 mb-4">
            Top Game được chơi nhiều nhất
          </h2>
          <div className="space-y-3">
            {(topGames as Game[]).map((game, i) => (
              <div
                key={game.id}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                  i < 3
                    ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {i + 1}
                </span>
                <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                  {game.thumbnail_url ? (
                    <img
                      src={game.thumbnail_url}
                      alt={game.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm"><svg className="w-5 h-5 text-[#d4a574]" viewBox="0 0 24 24" fill="currentColor"><path d="M21 6H3a1 1 0 00-1 1v10a1 1 0 001 1h18a1 1 0 001-1V7a1 1 0 00-1-1zM7 15a2 2 0 110-4 2 2 0 010 4z"/></svg></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 truncate">
                    {game.title}
                  </div>
                  <div className="text-xs text-gray-400">
                    {game.total_plays.toLocaleString()} lượt chơi
                  </div>
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded bg-gray-100 text-gray-700 border border-gray-200">
                  {game.genre || game.category}
                </span>
              </div>
            ))}
            {(topGames as Game[]).length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">
                Chưa có game nào. Hãy thêm game đầu tiên!
              </p>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
          <h2 className="text-sm font-bold text-gray-800 mb-4">
            Giao dịch gần đây
          </h2>
          <div className="space-y-3">
            {(transactions as Transaction[]).slice(0, 10).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 text-sm">$</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">
                      +{tx.amount.toLocaleString()}đ
                    </div>
                    <div className="text-xs text-gray-400">
                      {tx.content || 'VIP Payment'}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(tx.created_at).toLocaleDateString('vi-VN')}
                </div>
              </div>
            ))}
            {(transactions as Transaction[]).length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">
                Chưa có giao dịch nào.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Revenue Chart (CSS-based) */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
        <h2 className="text-sm font-bold text-gray-800 mb-4">
          Biểu đồ doanh thu (tháng gần đây)
        </h2>
        <RevenueChart transactions={transactions as Transaction[]} />
      </div>
    </div>
  );
}

function RevenueChart({ transactions }: { transactions: Transaction[] }) {
  // Group by month
  const monthlyData: Record<string, number> = {};
  const now = new Date();

  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getMonth() + 1}/${d.getFullYear()}`;
    monthlyData[key] = 0;
  }

  transactions.forEach((tx) => {
    const d = new Date(tx.created_at);
    const key = `${d.getMonth() + 1}/${d.getFullYear()}`;
    if (key in monthlyData) {
      monthlyData[key] += tx.amount;
    }
  });

  const maxValue = Math.max(...Object.values(monthlyData), 1);
  const months = Object.entries(monthlyData);

  return (
    <div className="flex items-end gap-4 h-48 mt-4">
      {months.map(([month, value]) => {
        const height = Math.max((value / maxValue) * 100, 4);
        return (
          <div key={month} className="flex-1 flex flex-col items-center gap-2">
            <span className="text-xs font-medium text-gray-600">
              {value > 0 ? `${(value / 1000).toFixed(0)}K` : '0'}
            </span>
            <div className="w-full relative" style={{ height: '150px' }}>
              <div
                className="absolute bottom-0 w-full bg-gradient-to-t from-red-500 to-red-300 rounded-t-lg transition-all duration-1000"
                style={{ height: `${height}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-400 font-medium">{month}</span>
          </div>
        );
      })}
    </div>
  );
}
