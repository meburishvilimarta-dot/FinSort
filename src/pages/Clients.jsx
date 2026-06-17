import { useState } from 'react';
import { Search, Plus, ChevronRight } from 'lucide-react';
import { clients } from '../data/mockData';

const statusConfig = {
  'on track': {
    label: 'On Track',
    classes: 'bg-green-100 text-green-700',
    dot: 'bg-green-500',
  },
  'at risk': {
    label: 'At Risk',
    classes: 'bg-amber-100 text-amber-700',
    dot: 'bg-amber-400',
  },
  overdue: {
    label: 'Overdue',
    classes: 'bg-red-100 text-red-700',
    dot: 'bg-red-500',
  },
};

export default function Clients() {
  const [search, setSearch] = useState('');

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1F3C]">Clients</h1>
          <p className="text-gray-500 text-sm mt-1">{clients.length} active clients</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#028090] text-white rounded-lg text-sm font-medium hover:bg-[#016070] transition-colors">
          <Plus size={16} />
          Add Client
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#028090]/30 focus:border-[#028090] transition"
        />
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Client Name</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Active Filings</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Next Deadline</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Industry</th>
              <th className="px-5 py-3.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((client) => {
              const cfg = statusConfig[client.status];
              return (
                <tr key={client.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#0D1F3C] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-[#0D1F3C]">{client.name}</p>
                        <p className="text-xs text-gray-400">{client.taxId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-700 font-medium">{client.activeFilings}</td>
                  <td className="px-5 py-4 text-gray-600">{client.nextDeadline}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.classes}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-500 text-sm">{client.industry}</td>
                  <td className="px-5 py-4 text-right">
                    <ChevronRight size={16} className="text-gray-400 ml-auto" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filtered.map((client) => {
          const cfg = statusConfig[client.status];
          return (
            <div key={client.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#0D1F3C] flex items-center justify-center text-white font-semibold">
                    {client.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-[#0D1F3C]">{client.name}</p>
                    <p className="text-xs text-gray-400">{client.taxId}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${cfg.classes}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-400 text-xs">Active Filings</span>
                  <p className="font-medium text-gray-700">{client.activeFilings}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-xs">Next Deadline</span>
                  <p className="font-medium text-gray-700">{client.nextDeadline}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-medium">No clients found</p>
          <p className="text-sm mt-1">Try a different search term</p>
        </div>
      )}
    </div>
  );
}
