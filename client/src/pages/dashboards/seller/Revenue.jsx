import { useEffect, useState } from 'react'
import { getSellerStats } from '../../../services/seller'
import { DollarSign, ShoppingBag, TrendingUp, TrendingDown, Package, Activity } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { formatCurrency } from '../../../utils/format'

export default function Revenue() {
  const [stats, setStats] = useState({ revenue: 0, totalOrders: 0, chartData: [], topProducts: [] })
  const [revenueData, setRevenueData] = useState([])

  useEffect(() => {
    getSellerStats().then(data => {
      setStats(data)
      const chart = data.chartData && data.chartData.length > 0 ? data.chartData : [
        { name: 'Mon', revenue: 0 }, { name: 'Tue', revenue: 0 }, { name: 'Wed', revenue: 0 },
        { name: 'Thu', revenue: 0 }, { name: 'Fri', revenue: 0 }, { name: 'Sat', revenue: 0 }, { name: 'Sun', revenue: 0 }
      ];
      setRevenueData(chart)
    }).catch(console.error)
  }, [])

  const categoryData = stats.categoryDistribution && stats.categoryDistribution.length > 0
    ? stats.categoryDistribution
    : [{ name: 'No Data', value: 1 }];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#64748b'];

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end border-b border-slate-100 pb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Revenue Analytics</h1>
          <p className="text-slate-500 text-sm">Track and analyze your store's financial performance.</p>
        </div>
        <div className="hidden md:flex gap-4">
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400">Active Store</p>
            <p className="text-sm font-semibold text-slate-900">Status: Verified</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          label="Gross Revenue"
          value={formatCurrency(stats.revenue)}
          trend="+12.5%"
          isPositive={true}
          icon={<DollarSign size={20} />}
        />
        <StatCard
          label="Total Orders"
          value={stats.totalOrders || 0}
          trend="+8.2%"
          isPositive={true}
          icon={<ShoppingBag size={20} />}
        />
        <StatCard
          label="Order Average"
          value={formatCurrency(stats.totalOrders > 0 ? stats.revenue / stats.totalOrders : 0)}
          icon={<Activity size={20} />}
        />
        <StatCard
          label="Refund Loss"
          value={formatCurrency(stats.refundedAmount || 0)}
          trend="-2.4%"
          isPositive={false}
          icon={<Package size={20} />}
          isNegativeValue={true}
        />
      </div>

      {/* Charts Section */}
      <div className="space-y-8">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Revenue Trend */}
          <div className="lg:col-span-8 bg-white p-8 rounded-2xl shadow-sm">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-sm font-bold text-slate-900">Revenue Velocity</h2>
              <div className="flex gap-4 text-xs font-semibold text-slate-400">
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-900"></div> Current Week</span>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="monochromeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#000" stopOpacity={0.05} />
                      <stop offset="95%" stopColor="#000" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #F1F5F9',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05)',
                      fontSize: '11px',
                      fontWeight: 700,
                    }}
                    itemStyle={{ color: '#000' }}
                    formatter={(value) => [formatCurrency(value), 'Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#000"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#monochromeGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Products */}
          <div className="lg:col-span-4 bg-white p-8 rounded-2xl shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 mb-8">High Performers</h2>
            <div className="space-y-6">
              {stats.topProducts && stats.topProducts.length > 0 ? (
                stats.topProducts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-neutral-50 rounded-xl overflow-hidden flex items-center justify-center border border-neutral-100 p-1">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <div className="text-[8px] text-neutral-300 font-black tracking-tighter">No Image</div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-900 truncate max-w-[120px]">{p.name}</p>
                        <p className="text-xs text-slate-500 font-medium">{p.sales} Units Sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-slate-900">{formatCurrency(p.revenue)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-300 py-10 text-xs font-medium">Awaiting Sales Data</div>
              )}
            </div>
          </div>
        </div>

        {/* Category Pie Chart */}
        {/* <div className="bg-white p-8 rounded-2xl shadow-sm max-w-2xl">
          <h2 className="text-sm font-bold text-slate-900 mb-8">Sales by Category</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div> */}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, trend, isPositive, isNegativeValue }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm transition-all hover:bg-slate-50 group">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-400">{label}</p>
          <h3 className={`text-2xl font-bold leading-none ${isNegativeValue ? 'text-red-500' : 'text-slate-900'}`}>
            {value}
          </h3>
          {trend && (
            <div className={`mt-2 flex items-center gap-1.5 text-xs font-bold ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
              {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {trend}
            </div>
          )}
        </div>
        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all">
          {icon}
        </div>
      </div>
    </div>
  )
}
