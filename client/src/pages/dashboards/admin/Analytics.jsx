import { useAuthStore } from '../../../store/auth'
import { DollarSign, TrendingUp, Users, ShoppingBag, AlertCircle, Building, Package, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { Link } from 'react-router-dom'
import { getAnalytics } from '../../../services/admin'
import { useQuery } from '@tanstack/react-query'

export default function AdminAnalytics() {
  const token = useAuthStore(s => s.token)
  const analyticsQuery = useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: getAnalytics,
    enabled: Boolean(token)
  })

  if (analyticsQuery.isLoading) {
    return <div className="text-center py-24 text-slate-500">Loading analytics...</div>
  }

  if (analyticsQuery.isError) {
    return <div className="text-center py-24 text-slate-500">Failed to load analytics.</div>
  }

  const analytics = analyticsQuery.data

  const pendingPayouts = analytics?.pendingPayouts || 0;

  const revenueData = analytics?.revenueHistory?.length > 0
    ? analytics.revenueHistory
    : [
      { name: 'Mon', value: 0 },
      { name: 'Tue', value: 0 },
      { name: 'Wed', value: 0 },
      { name: 'Thu', value: 0 },
      { name: 'Fri', value: 0 },
      { name: 'Sat', value: 0 },
      { name: 'Sun', value: 0 }
    ];

  const categoryData = analytics?.categoryDistribution?.length > 0
    ? analytics.categoryDistribution
    : [{ name: 'No Data', value: 1 }];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#64748b'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Platform Analytics</h1>
          <p className="text-slate-500">Overview of global performance and trends.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white px-4 py-2 rounded-xl border flex items-center gap-2 shadow-sm text-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-600 font-medium">System Online</span>
          </div>
        </div>
      </div>

      {/* Financial Alerts */}
      {pendingPayouts > 10000 && (
        <div className="bg-amber-50 p-6 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
              <AlertCircle size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">High Pending Payouts</h3>
              <p className="text-sm text-slate-600">Pending payouts have exceeded $10,000. Consider processing settlements soon.</p>
            </div>
          </div>
          <Link to="/admin/finance" className="bg-slate-900 hover:bg-black text-white px-6 py-2 rounded-lg font-bold transition-colors">
            Process Now
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard
          title="Total Profit"
          value={`$${(analytics?.platformProfit || 0).toFixed(2)}`}
          trend="+12.5%"
          isPositive={true}
          icon={<DollarSign size={20} />}
          color="emerald"
        />
        <StatsCard
          title="Total Sales"
          value={`$${(analytics?.totalSales || 0).toFixed(2)}`}
          trend="+18.2%"
          isPositive={true}
          icon={<TrendingUp size={20} />}
          color="blue"
        />
        <StatsCard
          title="Orders"
          value={analytics?.totalOrders || 0}
          trend={`${analytics?.deliveredOrders || 0} Delivered`}
          isPositive={true}
          icon={<ShoppingBag size={20} />}
          color="amber"
        />
        <StatsCard
          title="Active Sellers"
          value={analytics?.activeSellers || 0}
          trend={`${analytics?.pendingSellers || 0} Pending`}
          isPositive={true}
          icon={<Building size={20} />}
          color="purple"
        />
        <StatsCard
          title="Total Users"
          value={analytics?.totalUsers || 0}
          icon={<Users size={20} />}
          color="slate"
        />
        <StatsCard
          title="Refunded"
          value={`$${(analytics?.totalRefundedAmount || 0).toFixed(2)}`}
          trend="-2.1%"
          isPositive={false}
          icon={<AlertCircle size={20} />}
          color="red"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm ">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Revenue Analysis (This Week)</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(val) => `$${val}`} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Top Products</h2>
          <div className="space-y-4">
            {analytics?.topProducts?.length > 0 ? (
              analytics.topProducts.map((item) => (
                <div key={item._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden">
                      <img src={item.image} className="w-full h-full object-cover" onError={(e) => e.target.src = 'https://placehold.co/100x100?text=P'} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 truncate max-w-[120px]">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.totalSold} sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">${(item.revenue || 0).toFixed(2)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-400 py-12 italic">No sales data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Pie Chart & Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Category Distribution (Pie Chart) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Sales by Category</h2>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `$${value.toFixed(2)}`}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions (Moved here, takes 2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0">
            <h3 className="text-lg font-bold text-slate-900">Recent Platform Transactions</h3>
            <Link to="/admin/finance" className="text-sm font-bold text-primary hover:underline">View All</Link>
          </div>

          {/* Desktop Table */}
          <div className="overflow-x-auto hidden md:block flex-1">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-xs font-bold text-slate-500 sticky top-0">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analytics?.recentTransactions?.map(tx => (
                  <tr key={tx._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-xs text-slate-500">{new Date(tx.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-900">{tx?.user?.name || 'Unknown'}</div>
                      <div className="text-xs text-slate-500">{tx?.user?.role || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold">
                        {tx.type}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-right font-bold ${tx.amount < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                      {tx.amount < 0 ? '-' : '+'}Rs{Math.abs(tx.amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
                {(!analytics?.recentTransactions || analytics.recentTransactions.length === 0) && (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-slate-400">No transactions recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-slate-100 flex-1">
            {(!analytics?.recentTransactions || analytics.recentTransactions.length === 0) ? (
              <div className="p-8 text-center text-slate-400">No transactions recorded yet.</div>
            ) : (
              analytics.recentTransactions.map(tx => (
                <div key={tx._id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${tx.amount < 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {tx.amount < 0 ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{tx?.user?.name || 'Unknown'}</div>
                        <div className="text-xs text-slate-500">{new Date(tx.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className={`text-sm font-black ${tx.amount < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                      {tx.amount < 0 ? '-' : '+'}${Math.abs(tx.amount).toFixed(2)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pl-[3.25rem]">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wider">
                      {tx.type}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatsCard({ title, value, trend, icon, isPositive, color }) {
  const colors = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-indigo-50 text-indigo-600',
    slate: 'bg-slate-100 text-slate-600',
    red: 'bg-red-50 text-red-600'
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm transition-all hover:shadow-md">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colors[color] || colors.slate}`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-bold ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {trend}
          </div>
        )}
      </div>
      <div>
        <p className="text-slate-500 text-sm font-semibold">{title}</p>
        <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
      </div>
    </div>
  )
}
