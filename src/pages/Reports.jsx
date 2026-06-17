import { BarChart2 } from 'lucide-react';

export default function Reports() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0D1F3C]">Reports</h1>
        <p className="text-gray-500 text-sm mt-1">Analytics and financial reports</p>
      </div>

      <div className="flex flex-col items-center justify-center py-28 text-center">
        <div className="w-20 h-20 rounded-2xl bg-teal-50 flex items-center justify-center mb-5">
          <BarChart2 size={36} className="text-[#028090]" />
        </div>
        <h2 className="text-xl font-semibold text-[#0D1F3C] mb-2">Reports Coming Soon</h2>
        <p className="text-gray-500 max-w-sm text-sm leading-relaxed">
          Advanced reporting and analytics features are currently in development.
          You'll be able to generate detailed financial reports, audit trails,
          and client performance summaries.
        </p>
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          {['Client Summary', 'Tax Filing History', 'Deadline Compliance', 'Document Audit Trail'].map((item) => (
            <span key={item} className="px-3 py-1.5 bg-gray-100 text-gray-500 text-sm rounded-lg">
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
