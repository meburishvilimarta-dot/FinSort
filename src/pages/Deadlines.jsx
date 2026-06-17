import { Calendar, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { deadlines } from '../data/mockData';

const urgencyConfig = {
  overdue: {
    label: 'Overdue',
    classes: 'bg-red-50 border-red-200',
    badge: 'bg-red-100 text-red-700',
    icon: AlertTriangle,
    iconColor: 'text-red-500',
    iconBg: 'bg-red-100',
    leftBar: 'bg-red-500',
  },
  critical: {
    label: 'Due Soon',
    classes: 'bg-amber-50 border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
    icon: Clock,
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-100',
    leftBar: 'bg-amber-400',
  },
  upcoming: {
    label: 'Upcoming',
    classes: 'bg-white border-gray-200',
    badge: 'bg-teal-100 text-[#028090]',
    icon: CheckCircle,
    iconColor: 'text-[#028090]',
    iconBg: 'bg-teal-100',
    leftBar: 'bg-[#028090]',
  },
};

const summaryData = [
  { label: 'Overdue', count: 1, color: 'bg-red-100 text-red-700', urgency: 'overdue' },
  { label: 'Due within 3 days', count: 1, color: 'bg-amber-100 text-amber-700', urgency: 'critical' },
  { label: 'Upcoming', count: 6, color: 'bg-teal-100 text-[#028090]', urgency: 'upcoming' },
];

export default function Deadlines() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0D1F3C]">Deadlines</h1>
        <p className="text-gray-500 text-sm mt-1">All filing deadlines across clients</p>
      </div>

      {/* Summary pills */}
      <div className="flex flex-wrap gap-3 mb-6">
        {summaryData.map((s) => (
          <div key={s.label} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${s.color}`}>
            <span className="font-bold">{s.count}</span>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Deadline List */}
      <div className="space-y-3">
        {deadlines.map((d) => {
          const cfg = urgencyConfig[d.urgency];
          const Icon = cfg.icon;
          return (
            <div
              key={d.id}
              className={`flex items-center gap-4 rounded-xl border p-4 shadow-sm overflow-hidden relative ${cfg.classes}`}
            >
              {/* Left color bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${cfg.leftBar} rounded-l-xl`} />

              {/* Icon */}
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ml-2 ${cfg.iconBg}`}>
                <Icon size={18} className={cfg.iconColor} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-[#0D1F3C]">{d.client}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.badge}`}>
                    {cfg.label}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{d.type}</p>
              </div>

              {/* Date & days */}
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-1.5 justify-end text-gray-600 text-sm">
                  <Calendar size={13} className="text-gray-400" />
                  <span>{d.dueDate}</span>
                </div>
                <p className={`text-xs font-semibold mt-0.5 ${
                  d.urgency === 'overdue' ? 'text-red-600' :
                  d.urgency === 'critical' ? 'text-amber-600' :
                  'text-[#028090]'
                }`}>
                  {d.urgency === 'overdue'
                    ? `${Math.abs(d.daysRemaining)} day${Math.abs(d.daysRemaining) !== 1 ? 's' : ''} overdue`
                    : d.daysRemaining === 0
                    ? 'Due today'
                    : `${d.daysRemaining} day${d.daysRemaining !== 1 ? 's' : ''} remaining`}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
