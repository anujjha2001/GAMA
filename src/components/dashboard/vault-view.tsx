'use client';

import * as React from 'react';
import { Search, FolderLock, FileText, Download, Trash2, Upload, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const initialFiles = [
  { id: '1', name: 'Mitochondrial_DNA_Sequencing.pdf', size: '4.2 MB', date: '2026-06-15', status: 'Analyzed' },
  { id: '2', name: 'Comprehensive_Metabolic_Panel.pdf', size: '1.8 MB', date: '2026-06-10', status: 'Analyzed' },
  { id: '3', name: 'Cortisol_Diurnal_Rhythm.pdf', size: '920 KB', date: '2026-05-22', status: 'Analyzed' },
];

export function VaultView() {
  const [files, setFiles] = React.useState(initialFiles);
  const [search, setSearch] = React.useState('');

  const handleDelete = (id: string) => {
    setFiles(files.filter(f => f.id !== id));
    toast.success('Document removed from vault');
  };

  const filtered = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col gap-6 select-none text-[#f3f4f6]">
      
      {/* Upload action bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <p className="text-xs text-gray-400 max-w-xl">
          End-to-end encrypted storage for clinical reports, raw genomic sequencing, and lab panels.
        </p>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => toast.success('Select file to upload')}
          className="px-5 py-3 bg-white text-black font-semibold rounded-2xl text-xs flex items-center justify-center shadow-lg hover:bg-white/90 cursor-pointer"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </motion.button>
      </div>

      {/* Warning banner */}
      <div className="flex items-start gap-3 p-4 bg-white/5 border border-white/10 text-amber-500 text-xs rounded-2xl">
        <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">E2E Cryptographic Protection Active</p>
          <p className="text-gray-400 leading-normal">
            Documents are encrypted client-side using AES-256 before transmission. AI agent processes run within secure sandboxed environments.
          </p>
        </div>
      </div>

      {/* Files List Table */}
      <motion.div 
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
        className="bg-[#28292c]/40 backdrop-blur-2xl border border-white/5 rounded-[32px] p-6 shadow-xl space-y-4"
      >
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search reports, DNA sequence files, medical records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/5 rounded-2xl text-sm focus:border-amber-500 focus:outline-none transition-all placeholder-gray-500 text-white"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-4">File Name</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Uploaded</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((file) => (
                <tr key={file.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2.5">
                    <FileText className="h-4.5 w-4.5 text-gray-400" />
                    {file.name}
                  </td>
                  <td className="py-3.5 px-4 text-gray-400">{file.size}</td>
                  <td className="py-3.5 px-4 text-gray-400">{file.date}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      {file.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1.5">
                    <button 
                      onClick={() => toast.success('Downloading ' + file.name)}
                      className="p-2 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all cursor-pointer inline-flex"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(file.id)}
                      className="p-2 hover:bg-white/10 rounded-xl text-red-400 hover:text-red-300 transition-all cursor-pointer inline-flex"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

    </div>
  );
}
