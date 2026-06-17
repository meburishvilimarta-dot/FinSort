import { useState, useRef } from 'react';
import { Upload, FileText, Search, Filter, Tag } from 'lucide-react';
import { documents } from '../data/mockData';

const categoryColors = {
  'Tax Declaration': 'bg-blue-100 text-blue-700',
  'Financial Statement': 'bg-purple-100 text-purple-700',
  'Invoice': 'bg-gray-100 text-gray-600',
  'VAT Return': 'bg-indigo-100 text-indigo-700',
};

const statusConfig = {
  'Ready to Submit': {
    classes: 'bg-teal-100 text-[#028090]',
    dot: 'bg-[#02C39A]',
  },
  'Needs Review': {
    classes: 'bg-amber-100 text-amber-700',
    dot: 'bg-amber-400',
  },
};

export default function Documents() {
  const [isDragging, setIsDragging] = useState(false);
  const [search, setSearch] = useState('');
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    // Mock file drop
    alert('File upload coming soon!');
  };

  const filtered = documents.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.client.toLowerCase().includes(search.toLowerCase()) ||
      d.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1F3C]">Documents</h1>
          <p className="text-gray-500 text-sm mt-1">{documents.length} documents in library</p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 bg-[#028090] text-white rounded-lg text-sm font-medium hover:bg-[#016070] transition-colors"
        >
          <Upload size={16} />
          Upload
        </button>
        <input ref={fileInputRef} type="file" className="hidden" multiple />
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer mb-6 transition-all duration-200
          ${isDragging
            ? 'border-[#028090] bg-teal-50'
            : 'border-gray-300 hover:border-[#028090] hover:bg-gray-50'
          }`}
      >
        <div className="flex flex-col items-center gap-2">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-1 ${isDragging ? 'bg-teal-100' : 'bg-gray-100'}`}>
            <Upload size={22} className={isDragging ? 'text-[#028090]' : 'text-gray-400'} />
          </div>
          <p className="font-medium text-gray-700">
            {isDragging ? 'Drop files here' : 'Drag & drop files here'}
          </p>
          <p className="text-sm text-gray-400">or click to browse — PDF, XLSX, DOCX supported</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#028090]/30 focus:border-[#028090] transition"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
          <Filter size={15} />
          Filter
        </button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Document</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((doc) => {
              const statusCfg = statusConfig[doc.status];
              return (
                <tr key={doc.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <FileText size={16} className="text-gray-500" />
                      </div>
                      <span className="font-medium text-[#0D1F3C]">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${categoryColors[doc.category]}`}>
                      <Tag size={10} />
                      {doc.category}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-600">{doc.client}</td>
                  <td className="px-5 py-4 text-gray-500">{doc.date}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusCfg.classes}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                      {doc.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filtered.map((doc) => {
          const statusCfg = statusConfig[doc.status];
          return (
            <div key={doc.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <FileText size={18} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#0D1F3C] text-sm">{doc.name}</p>
                    <p className="text-xs text-gray-400">{doc.client} · {doc.date}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${statusCfg.classes}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                  {doc.status}
                </span>
              </div>
              <div className="mt-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${categoryColors[doc.category]}`}>
                  <Tag size={10} />
                  {doc.category}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <FileText size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No documents found</p>
          <p className="text-sm mt-1">Try a different search term</p>
        </div>
      )}
    </div>
  );
}
