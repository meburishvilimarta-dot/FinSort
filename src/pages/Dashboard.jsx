import { Users, Clock, FileText, AlertTriangle, Upload, CheckCircle, Bell, UserPlus, Tag, ArrowUpRight } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { summaryStats, monthlyDocuments, deadlines, recentActivity } from '../data/mockData';

const statCards = [
  {
    label: 'Total Active Clients',
    value: summaryStats.totalActiveClients,
    icon: Users,
    color: 'bg-blue-50 text-blue-600',
    borderColor: 'border-blue-200',
  },
  {
    label: 'Upcoming Deadlines / 7 days',
    value: summaryStats.upcomingDeadlines7Days,
    icon: Clock,
    color: 'bg-teal-50 text-[#028090]',
    borderColor: 'border-teal-200',
  },
  {
    label: 'Documents Pending Review',
    value: summaryStats.documentsPendingReview,
    icon: FileText,
    color: 'bg-amber-50 text-amber-600',
    borderColor: 'border-amber-200',
  },
  {
    label: 'Overdue Items',
    value: summaryStats.overdueItems,
    icon: AlertTriangle,
    color: 'bg-red-50 text-red-600',
    borderColor: 'border-red-200',
  },
];

const urgencyConfig = {
  overdue: { label: 'Overdue', classes: 'bg-red-100 text-red-700' },
  critical: { label: 'Due Soon', classes: 'bg-amber-100 text-amber-700' },
  upcoming: { label: 'Upcoming', classes: 'bg-teal-100 text-[#028090]' },
};

const activityIcons = {
  upload: { icon: Upload, color: 'bg-blue-100 text-blue-600' },
  submit: { icon: CheckCircle, color: 'bg-green-100 text-green-600' },
  review: { icon: FileText, color: 'bg-amber-100 text-amber-600' },
  reminder: { icon: Bell, color: 'bg-purple-100 text-purple-600' },
  client: { icon: UserPlus, color: 'bg-teal-100 text-[#028090]' },
  status: { icon: Tag, color: 'bg-gray-100 text-gray-600' },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-2">
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        <p className="text-sm text-[#028090]">{payload[0].value} documents</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const upcomingDeadlines = deadlines.slice(0, 5);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0D1F3C]">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back, Ana. Here's what's happening today.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color, borderColor }) => (
          <div key={label} className={`bg-white rounded-xl border ${borderColor} p-5 flex items-start gap-4 shadow-sm`}>
            <div className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
              <Icon size={20} />
            </div>
            <div>
              <p className="text-3xl font-bold text-[#0D1F3C]">{value}</p>
              <p className="text-sm text-gray-500 mt-0.5 leading-tight">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Deadline Timeline */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#0D1F3C]">Upcoming Deadlines</h2>
            <a href="/deadlines" className="text-[#028090] text-sm font-medium hover:underline flex items-center gap-1">
              View all <ArrowUpRight size={14} />
            </a>
          </div>
          <div className="space-y-3">
            {upcomingDeadlines.map((d) => {
              const cfg = urgencyConfig[d.urgency];
              return (
                <div key={d.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium text-[#0D1F3C] truncate">{d.client}</span>
                      <span className="text-xs text-gray-500">{d.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-sm text-gray-600">{d.dueDate}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.classes}`}>
                      {d.urgency === 'overdue' ? `${Math.abs(d.daysRemaining)}d overdue` :
                       d.daysRemaining === 0 ? 'Today' :
                       `${d.daysRemaining}d`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-base font-semibold text-[#0D1F3C] mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.map((item) => {
              const cfg = activityIcons[item.type];
              const Icon = cfg.icon;
              return (
                <div key={item.id} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${cfg.color}`}>
                    <Icon size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-700 leading-snug">{item.text}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-[#0D1F3C]">Documents Processed</h2>
          <span className="text-xs text-gray-400">Last 6 months</span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthlyDocuments} barSize={32}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#6b7280' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />
            <Bar dataKey="documents" fill="#028090" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
