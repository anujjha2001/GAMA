'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Upload, Plus, Check, Clock, ShieldCheck, Download,
  Calendar, AlertCircle, Trash2, RefreshCw, Eye, Search, Filter,
  TrendingUp, BookOpen, Heart, ListChecks, Utensils, CalendarPlus,
  Info, Layers, ArrowRight, ShieldAlert, X
} from 'lucide-react';
import { toast } from 'sonner';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { AuraChatPanel } from '@/components/aura/AuraChatPanel';
import { useAura } from '@/hooks/useAura';

export default function VaultPage() {
  const [mounted, setMounted] = React.useState(false);
  const [documents, setDocuments] = React.useState<any[]>([]);
  const [activeDocId, setActiveDocId] = React.useState<string | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState<number | null>(null);

  // Search and Filters
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  const [sortBy, setSortBy] = React.useState('newest');

  // Compare mode
  const [compareIds, setCompareIds] = React.useState<string[]>([]);
  const [comparisonResult, setComparisonResult] = React.useState<any | null>(null);
  const [isComparing, setIsComparing] = React.useState(false);

  // Tabs for active document analysis
  const [activeTab, setActiveTab] = React.useState<'summary' | 'nutrition' | 'exercise' | 'biomarkers'>('summary');

  // Aura Chat Integration
  const { messages, setMessages: setChatHistory, input, setInput, handleSubmit, isLoading } = useAura();
  const [isChatOpen, setIsChatOpen] = React.useState(false);

  // Loading States
  const [loadingDocs, setLoadingDocs] = React.useState(true);
  const [reanalyzingId, setReanalyzingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setMounted(true);
    fetchDocuments();
  }, []);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Uploading & Queuing...';
      case 'EXTRACTING_TEXT': return 'Extracting Document Text...';
      case 'RUNNING_OCR': return 'Running OCR Image Extraction...';
      case 'ANALYZING': return 'Analyzing Biomarkers with AI...';
      case 'SAVING_RESULTS': return 'Saving Insights to Database...';
      case 'PROCESSING': return 'Processing...';
      default: return 'Scanning Medical Report...';
    }
  };

  const fetchDocuments = async (silent = false) => {
    try {
      if (!silent) setLoadingDocs(true);
      const res = await fetch(`/api/vault?search=${encodeURIComponent(searchQuery)}&category=${selectedCategory}&sortBy=${sortBy}`);
      const data = await res.json();
      if (data.success) {
        setDocuments(data.documents || []);
        if (data.documents && data.documents.length > 0 && !activeDocId) {
          setActiveDocId(data.documents[0].id);
        }
      }
    } catch (err) {
      if (!silent) toast.error('Failed to load medical documents.');
    } finally {
      if (!silent) setLoadingDocs(false);
    }
  };

  React.useEffect(() => {
    if (mounted) {
      fetchDocuments();
    }
  }, [searchQuery, selectedCategory, sortBy]);

  React.useEffect(() => {
    const hasActiveProcessing = documents.some(
      doc => doc.processingStatus !== 'COMPLETED' && doc.processingStatus !== 'FAILED'
    );

    if (hasActiveProcessing) {
      const interval = setInterval(() => {
        fetchDocuments(true);
      }, 3000); // Poll every 3 seconds

      return () => clearInterval(interval);
    }
  }, [documents]);

  if (!mounted) return (
    <div className="min-h-screen bg-[#070709] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-white/10 border-t-orange-500 rounded-full animate-spin" />
    </div>
  );

  const activeDoc = documents.find(d => d.id === activeDocId) || documents[0];

  // Handle Drag & Drop / File Selection Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    let file: File | null = null;
    if ('files' in e.target && e.target.files) {
      file = e.target.files[0];
    } else if ('dataTransfer' in e && e.dataTransfer.files) {
      file = e.dataTransfer.files[0];
    }

    if (!file) return;

    // Validate size limit (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File exceeds 10MB limit.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', inferCategory(file.name));

    try {
      setUploadProgress(10);
      toast.info(`Uploading "${file.name}"...`);

      // Simple upload progress simulation
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev === null) return null;
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 15;
        });
      }, 300);

      const res = await fetch('/api/vault', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await res.json();
      if (data.success) {
        toast.success(`Successfully uploaded "${file.name}". AI Analysis triggered in the background!`);
        fetchDocuments();
        if (data.document) {
          setActiveDocId(data.document.id);
        }
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setTimeout(() => setUploadProgress(null), 1000);
    }
  };

  const inferCategory = (filename: string): string => {
    const lower = filename.toLowerCase();
    if (lower.includes('blood') || lower.includes('cbc') || lower.includes('lipid')) return 'Blood Report';
    if (lower.includes('vitamin') || lower.includes('vit')) return 'Vitamin Report';
    if (lower.includes('thyroid')) return 'Thyroid Report';
    if (lower.includes('mri')) return 'MRI';
    if (lower.includes('ct') || lower.includes('scan')) return 'CT Scan';
    if (lower.includes('xray') || lower.includes('x-ray')) return 'X-Ray';
    if (lower.includes('urine')) return 'Urine Test';
    return 'Other';
  };

  // Re-analyze Document
  const handleReanalyze = async (id: string) => {
    try {
      setReanalyzingId(id);
      toast.info('Re-running medical intelligence engine...');
      const res = await fetch(`/api/vault/${id}`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Re-analysis completed successfully!');
        fetchDocuments();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error(err.message || 'Re-analysis failed.');
    } finally {
      setReanalyzingId(null);
    }
  };

  // Delete Document
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document and its AI analysis? This action is permanent.')) {
      return;
    }

    try {
      const res = await fetch(`/api/vault/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Document deleted.');
        setDocuments(prev => prev.filter(d => d.id !== id));
        if (activeDocId === id) {
          setActiveDocId(null);
        }
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error(err.message || 'Delete failed.');
    }
  };

  // Compare Selected Reports
  const handleCompare = async () => {
    if (compareIds.length < 2) {
      toast.error('Select at least 2 reports to compare.');
      return;
    }

    try {
      setIsComparing(true);
      const res = await fetch('/api/vault/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docIds: compareIds })
      });
      const data = await res.json();
      if (data.success) {
        setComparisonResult(data.comparison);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error(err.message || 'Comparison failed.');
    } finally {
      setIsComparing(false);
    }
  };

  const handleToggleCompare = (id: string) => {
    setCompareIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Ask AURA Integration
  const askAURAAboutReport = (doc: any) => {
    if (!doc || !doc.analysis) return;
    setIsChatOpen(true);
    const summary = doc.analysis.summary;
    const abnormal = JSON.stringify(doc.analysis.abnormalValues);

    setInput(`Explain my report: ${doc.title}. Based on these abnormal values: ${abnormal}`);
    toast.success('Attached report context to AURA chat.');
  };

  // Prepare Dynamic Chart Data
  const getBiomarkerChartData = () => {
    // Extract biomarker trends across all analyzed reports
    const trendData: any[] = [];
    documents.forEach(doc => {
      if (doc.analysis && doc.reportDate) {
        const dateStr = new Date(doc.reportDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

        let vitaminD = null;
        let ldl = null;
        let bloodSugar = null;

        // Parse extracted values
        const allValues = [
          ...(doc.analysis.abnormalValues || []),
          ...(doc.analysis.normalValues || [])
        ];

        allValues.forEach((val: any) => {
          const name = val.marker.toLowerCase();
          if (name.includes('vitamin d')) {
            vitaminD = parseFloat(val.value);
          } else if (name.includes('ldl')) {
            ldl = parseFloat(val.value);
          } else if (name.includes('sugar') || name.includes('glucose') || name.includes('hba1c')) {
            bloodSugar = parseFloat(val.value);
          }
        });

        trendData.push({
          date: dateStr,
          'Vitamin D (ng/mL)': vitaminD,
          'LDL Cholesterol (mg/dL)': ldl,
          'Blood Sugar (mg/dL)': bloodSugar,
          'Wellness Score': doc.analysis.overallHealthScore
        });
      }
    });
    return trendData.reverse(); // Chronological order
  };

  const chartData = getBiomarkerChartData();

  return (
    <div className="space-y-6 relative pb-10 min-h-screen text-white font-sans">
      {/* HUD Header Bar */}
      <div className="flex justify-between items-center p-4 bg-white/5 border border-white/10 rounded-[24px] backdrop-blur-2xl">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-widest">Aura Vault OS</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono text-neutral-300 bg-white/5 px-3 py-1 rounded-full border border-white/5">
            {new Date().toLocaleDateString()}
          </span>
          <button
            onClick={() => { fetchDocuments(); toast.success('Vault index synced live.'); }}
            className="flex items-center gap-1 px-3 py-1 bg-white text-black font-extrabold text-[10px] uppercase rounded-full hover:bg-neutral-200 cursor-pointer"
          >
            Sync OS
          </button>
        </div>
      </div>

      {/* CORE SPATIAL GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

        {/* Left Columns: Upload & Doc List */}
        <div className="lg:col-span-5 flex flex-col gap-6">

          {/* Upload Dropzone */}
          <div className="relative bg-[#0c0c0e]/60 border border-white/10 rounded-[32px] p-6 backdrop-blur-3xl shadow-2xl overflow-hidden">
            <h3 className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-widest mb-4">Diagnostic Portal</h3>

            <div
              className={`border-2 border-dashed rounded-[24px] p-6 text-center transition-all ${isDragging ? 'border-white/20 bg-white/5' : 'border-white/10 hover:border-white/20 bg-black/40'}`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleFileUpload(e);
              }}
            >
              <input
                type="file"
                id="vault-file"
                accept=".pdf,.png,.jpg,.jpeg,.webp,.docx"
                className="hidden"
                onChange={handleFileUpload}
              />
              <label htmlFor="vault-file" className="cursor-pointer space-y-3 block">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 mx-auto flex items-center justify-center text-white transition-transform hover:scale-110">
                  {uploadProgress !== null ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Upload className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <span className="text-sm font-black text-white hover:underline uppercase tracking-tight">
                    {uploadProgress !== null ? `Uploading (${uploadProgress}%)` : 'Click to upload'}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-bold block mt-1 uppercase">
                    Drag & drop PDFs or images (Max 10MB)
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Document list & History */}
          <div className="relative bg-[#0c0c0e]/60 border border-white/10 rounded-[32px] p-6 backdrop-blur-3xl overflow-hidden flex-1 shadow-2xl flex flex-col">
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none select-none">
              <img src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop" alt="Medical background" className="w-full h-full object-cover" />
            </div>

            <div className="relative z-10 flex flex-col h-full space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-widest">Document Index</h3>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg text-[9px] font-bold uppercase tracking-wider px-2 py-1.5 text-white outline-none focus:border-white/20"
                >
                  <option value="All">All Categories</option>
                  <option value="Blood Report">Blood Reports</option>
                  <option value="Vitamin Report">Vitamin Reports</option>
                  <option value="Thyroid Report">Thyroid Reports</option>
                  <option value="ECG">ECG</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Search Input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search hospital, doctor, biomarker..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-xs font-bold text-white placeholder-neutral-500 focus:outline-none focus:border-white/20 transition-all"
                />
              </div>

              {/* List */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-2 scrollbar-thin max-h-[400px]">
                {loadingDocs ? (
                  <div className="text-center py-8 text-neutral-500 text-[10px] font-extrabold uppercase tracking-widest">Loading vault...</div>
                ) : documents.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500 text-[10px] font-extrabold uppercase tracking-widest">No documents matching filter.</div>
                ) : (
                  documents.map((doc) => {
                    const isActive = doc.id === activeDocId;
                    const isChecked = compareIds.includes(doc.id);
                    const docDate = doc.reportDate ? new Date(doc.reportDate) : new Date();
                    
                    return (
                      <div
                        key={doc.id}
                        className={`p-3.5 rounded-2xl border transition-all flex items-center gap-4 justify-between cursor-pointer ${isActive
                          ? 'bg-white/10 border-white/20 shadow-lg text-white scale-[1.02]'
                          : 'bg-white/2 border-white/5 hover:bg-white/5 hover:border-white/10 text-neutral-300'
                          }`}
                        onClick={() => setActiveDocId(doc.id)}
                      >
                        <div className="w-12 text-center border-r border-white/10 pr-3 shrink-0">
                          <span className="text-[9px] text-neutral-500 font-bold uppercase block leading-none">{docDate.toLocaleDateString('en-US', { month: 'short' })}</span>
                          <span className="text-base font-black text-white mt-1 block leading-none">{docDate.getDate()}</span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-[8px] font-black text-neutral-400 uppercase tracking-widest">
                            {doc.category}
                          </span>
                          <h4 className="text-sm font-bold text-white mt-1.5 truncate">{doc.title}</h4>
                          <span className="text-[10px] text-neutral-500 font-mono mt-0.5 block truncate">
                            {doc.hospital} • {doc.fileSize}
                          </span>
                        </div>

                        <div className="flex flex-col items-end justify-between h-full gap-2 shrink-0">
                          {/* Compare Checkbox */}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleToggleCompare(doc.id); }}
                            className={`px-2 py-1 rounded-lg border text-[9px] font-bold uppercase transition-colors ${isChecked ? 'bg-white text-black border-white' : 'border-white/10 text-neutral-500 hover:text-white hover:border-white/20'}`}
                          >
                            Compare
                          </button>
                          <div>
                            {doc.processingStatus === 'COMPLETED' ? (
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block shadow-[0_0_8px_rgba(16,185,129,0.5)]" title="Analyzed" />
                            ) : doc.processingStatus === 'FAILED' ? (
                              <span className="w-2.5 h-2.5 rounded-full bg-red-500 block shadow-[0_0_8px_rgba(239,68,68,0.5)]" title={`Analysis Failed: ${doc.summary}`} />
                            ) : (
                              <span className="w-2.5 h-2.5 rounded-full bg-white block animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.5)]" title={getStatusLabel(doc.processingStatus)} />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            {/* Compare Trigger Button */}
            {compareIds.length >= 2 && (
              <button
                onClick={handleCompare}
                disabled={isComparing}
                className="w-full py-2.5 bg-white text-black font-semibold hover:bg-neutral-200 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {isComparing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
                Compare {compareIds.length} Reports
              </button>
            )}
          </div>
          </div>
        </div>

        {/* Right Side: Extraction Details & Plans */}
        <div className="lg:col-span-7 flex flex-col gap-6">

          {/* Comparison Modal/Block Overlay if triggered */}
          {comparisonResult && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="rounded-[32px] bg-black/90 backdrop-blur-3xl p-8 border border-white/20 space-y-6 relative shadow-2xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 pointer-events-none" />
              
              <button
                onClick={() => setComparisonResult(null)}
                className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/20 rounded-full border border-white/10 text-white transition-all backdrop-blur-md z-20"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="relative z-10 flex items-center gap-3 border-b border-white/10 pb-4">
                <Layers className="w-6 h-6 text-emerald-400" />
                <h3 className="font-black text-2xl uppercase tracking-tighter text-white">Longitudinal Analysis</h3>
              </div>

              {/* Comparison list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                {comparisonResult.comparisons?.map((c: any, idx: number) => (
                  <div key={idx} className="p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors flex flex-col justify-between gap-3">
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-black text-white uppercase tracking-tight">{c.biomarker}</span>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${c.status === 'Improved' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : c.status === 'Worsened' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-neutral-500/20 text-neutral-300 border-neutral-500/30'}`}>
                        {c.change} ({c.status})
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed font-medium">{c.details}</p>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl relative z-10">
                <h4 className="text-[10px] font-extrabold text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                   <Info className="w-4 h-4" /> AI Comparative Insights
                </h4>
                <p className="text-sm text-white leading-relaxed font-medium">{comparisonResult.summary}</p>
              </div>
            </motion.div>
          )}

          {activeDoc ? (
            <div className="space-y-6 flex flex-col flex-1">
              
              {/* PREMIUM DOCUMENT HEADER CARD */}
              <motion.div
                key={activeDoc.id + "-header"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative h-64 rounded-[32px] overflow-hidden border border-white/10 group shadow-2xl flex flex-col justify-end p-8 bg-black/40 shrink-0"
              >
                <img
                  src="https://images.unsplash.com/photo-1530497610245-94d3c16cda28?q=80&w=800&auto=format&fit=crop"
                  alt="Medical Scan"
                  className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                
                <div className="absolute top-6 right-6 flex items-center gap-2 z-20">
                    <button
                      onClick={() => handleReanalyze(activeDoc.id)}
                      disabled={reanalyzingId === activeDoc.id}
                      className="p-2.5 bg-white/5 hover:bg-white/20 rounded-full border border-white/10 text-white transition-all backdrop-blur-md"
                      title="Re-run AI Analysis"
                    >
                      <RefreshCw className={`w-4 h-4 ${reanalyzingId === activeDoc.id ? 'animate-spin' : ''}`} />
                    </button>
                    {activeDoc.fileUrl && (
                      <a
                        href={activeDoc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 bg-white/5 hover:bg-white/20 rounded-full border border-white/10 text-white transition-all backdrop-blur-md flex items-center justify-center"
                        title="Download / View Original File"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(activeDoc.id)}
                      className="p-2.5 bg-red-500/20 hover:bg-red-500/40 rounded-full border border-red-500/30 text-red-100 transition-all backdrop-blur-md"
                      title="Delete Report"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                <div className="relative z-10 space-y-1">
                  <span className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-widest block">{activeDoc.hospital} • Ref: {activeDoc.doctor}</span>
                  <h2 className="text-3xl font-black text-white tracking-tight leading-none uppercase">{activeDoc.title}</h2>

                  <div className="flex items-end gap-8 pt-4">
                    <div>
                      <span className="text-[10px] text-neutral-500 font-bold block uppercase">Date Logged</span>
                      <span className="text-xl font-black text-white mt-1 block">{activeDoc.reportDate ? new Date(activeDoc.reportDate).toLocaleDateString() : 'Analyzing...'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 font-bold block uppercase">Type</span>
                      <span className="text-xl font-black text-white mt-1 block">{activeDoc.category}</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* PROCESSING STATES OR TABS */}
              <div className="relative bg-[#0c0c0e]/60 border border-white/10 rounded-[32px] p-6 backdrop-blur-3xl shadow-2xl flex-1 flex flex-col">

                {activeDoc.processingStatus !== 'COMPLETED' && activeDoc.processingStatus !== 'FAILED' ? (
                  <div className="py-24 text-center space-y-4">
                    <div className="relative w-16 h-16 mx-auto">
                      <div className="absolute inset-0 rounded-full border-4 border-white/20/10 border-t-brand animate-spin" />
                      <FileText className="w-6 h-6 text-white absolute inset-0 m-auto" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold">{getStatusLabel(activeDoc.processingStatus)}</p>
                      <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                        Extracting physical values, compiling biomarker reference ranges, and generating dynamic clinical advice.
                      </p>
                    </div>
                  </div>
                ) : activeDoc.processingStatus === 'FAILED' ? (
                  <div className="py-24 text-center space-y-4 text-red-500">
                    <AlertCircle className="w-12 h-12 mx-auto" />
                    <p className="text-sm font-bold">AI Diagnostics Engine Failed</p>
                    <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                      {activeDoc.summary || 'Could not properly interpret the file. Check connection or try re-running the analysis.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-8 mt-6">

                    {/* Top Panel: Wellness Score Indicator and Trend Chart */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Wellness Score Card */}
                      <div className="p-6 bg-white/5 border border-white/10 rounded-3xl flex flex-col items-center justify-center text-center relative overflow-hidden shadow-xl hover:bg-white/10 transition-colors">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent pointer-events-none" />
                        <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest mb-4">Overall Score</span>
                        <div className="relative w-32 h-32 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-95 drop-shadow-2xl" viewBox="0 0 36 36">
                            <path
                              className="text-white/10"
                              strokeWidth="3"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                              className="text-emerald-400"
                              strokeWidth="3"
                              strokeDasharray={`${activeDoc.analysis?.overallHealthScore || 70}, 100`}
                              strokeLinecap="round"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <div className="absolute text-center flex flex-col items-center">
                            <span className="text-4xl font-black text-white tracking-tighter leading-none">{activeDoc.analysis?.overallHealthScore || 70}</span>
                            <span className="text-[10px] text-neutral-500 font-bold uppercase block mt-1">Health</span>
                          </div>
                        </div>
                        <div className="mt-4 px-3 py-1 bg-white/10 rounded-full border border-white/10">
                          <span className="text-[9px] font-black text-white uppercase tracking-widest">
                            Risk Level: <span className={activeDoc.analysis?.riskLevel === 'HIGH' ? 'text-red-400' : 'text-emerald-400'}>{activeDoc.analysis?.riskLevel || 'LOW'}</span>
                          </span>
                        </div>
                      </div>

                      {/* Micro-Trend Chart */}
                      <div className="p-6 bg-white/5 border border-white/10 rounded-3xl md:col-span-2 shadow-xl flex flex-col relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-transparent pointer-events-none" />
                        <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest mb-4">Historical Trajectory</span>
                        <div className="flex-1 w-full min-h-[140px]">
                          {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={chartData}>
                                <XAxis dataKey="date" stroke="#666" fontSize={9} tickLine={false} axisLine={false} />
                                <Tooltip
                                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', backdropFilter: 'blur(10px)' }}
                                  labelStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold' }}
                                />
                                <Line type="monotone" dataKey="Wellness Score" stroke="#34d399" strokeWidth={3} dot={{ r: 4, fill: '#000', stroke: '#34d399', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#34d399' }} />
                              </LineChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-500 font-bold uppercase tracking-widest text-center border-2 border-dashed border-white/10 rounded-2xl">
                              Upload more reports to unlock<br/>trajectory predictions.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex gap-2 border-b border-white/10 pb-4">
                      {(['summary', 'biomarkers', 'nutrition', 'exercise'] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`px-4 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-widest transition-all cursor-pointer ${activeTab === tab ? 'bg-white text-black shadow-lg scale-105' : 'bg-white/5 border border-white/5 text-neutral-400 hover:bg-white/10 hover:text-white'}`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>

                    {/* Tab Content */}
                    <div className="space-y-6">
                      {activeTab === 'summary' && (
                        <div className="space-y-6">
                          {/* Educational Disclaimer */}
                          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-start gap-3 text-neutral-300">
                            <Info className="w-5 h-5 shrink-0 mt-0.5 text-neutral-400" />
                            <div className="text-[10px] leading-relaxed">
                              <span className="font-extrabold uppercase block tracking-wider mb-1 text-white">Educational Intelligence Only</span>
                              Values are analyzed by medical AI models for educational coaching purposes only. They do not constitute official clinical medical diagnoses. Please consult a qualified health professional.
                            </div>
                          </div>

                          {/* AI Summary Text */}
                          <div className="p-6 bg-white/5 border border-white/10 rounded-3xl relative overflow-hidden">
                            <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400 mb-3">Executive Protocol</h3>
                            <p className="text-sm font-medium text-white leading-relaxed">
                              {activeDoc.analysis?.summary}
                            </p>
                          </div>

                          {/* Risk Predictions */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-5 bg-white/5 border border-white/10 rounded-2xl flex flex-col justify-between items-start gap-4">
                              <div className="space-y-1">
                                <span className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-widest block">Cardiovascular Assessment</span>
                                <span className="text-sm font-black text-white uppercase block">Heart Risk Factor</span>
                              </div>
                              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${activeDoc.analysis?.riskLevel === 'HIGH' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}>
                                {activeDoc.analysis?.riskLevel || 'LOW'} RISK
                              </span>
                            </div>
                            <div className="p-5 bg-white/5 border border-white/10 rounded-2xl flex flex-col justify-between items-start gap-4">
                              <div className="space-y-1">
                                <span className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-widest block">Metabolic Assessment</span>
                                <span className="text-sm font-black text-white uppercase block">Insulin / Sugar Risk</span>
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                LOW RISK
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === 'biomarkers' && (
                        <div className="space-y-6">
                          {/* Critical and abnormal values */}
                          {activeDoc.analysis?.abnormalValues && activeDoc.analysis.abnormalValues.length > 0 && (
                            <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-3xl relative overflow-hidden shadow-xl">
                              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none" />
                              <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-red-400 flex items-center gap-2 mb-4 relative z-10">
                                <ShieldAlert className="w-4 h-4" /> Attention Required
                              </h3>
                              <div className="space-y-3 relative z-10">
                                {activeDoc.analysis.abnormalValues.map((v: any, idx: number) => (
                                  <div key={idx} className="p-4 bg-black/40 border border-red-500/20 rounded-2xl flex justify-between items-start gap-4 hover:bg-black/60 transition-colors">
                                    <div className="space-y-1">
                                      <span className="text-sm font-black text-white block uppercase">{v.marker}</span>
                                      <p className="text-[10px] text-neutral-400 leading-relaxed font-medium">{v.explanation}</p>
                                    </div>
                                    <div className="text-right shrink-0 bg-red-500/10 px-3 py-2 rounded-xl border border-red-500/20">
                                      <span className="text-sm font-black text-red-400 block">{v.value}</span>
                                      <span className="text-[9px] text-neutral-500 font-bold block uppercase mt-0.5">Ref: {v.range}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Normal biomarkers */}
                          {activeDoc.analysis?.normalValues && activeDoc.analysis.normalValues.length > 0 && (
                            <div className="p-6 bg-white/5 border border-white/10 rounded-3xl relative overflow-hidden shadow-xl">
                              <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 flex items-center gap-2 mb-4 relative z-10">
                                <Check className="w-4 h-4" /> Healthy Biomarkers
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10">
                                {activeDoc.analysis.normalValues.map((v: any, idx: number) => (
                                  <div key={idx} className="p-4 bg-black/40 border border-white/5 rounded-2xl flex justify-between items-center hover:bg-white/5 transition-colors">
                                    <div>
                                      <span className="text-xs font-black text-white block uppercase">{v.marker}</span>
                                      <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block mt-0.5">Ref: {v.range}</span>
                                    </div>
                                    <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">{v.value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === 'nutrition' && (
                        <div className="space-y-6">
                          <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-6 relative overflow-hidden shadow-xl">
                            <div className="flex items-center gap-2 text-neutral-300 relative z-10">
                              <Utensils className="w-4 h-4 text-emerald-400" />
                              <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">Dietary Protocol</h4>
                            </div>

                            {/* Macro Targets */}
                            <div className="grid grid-cols-5 gap-2 text-center py-5 bg-black/40 border border-white/5 rounded-2xl relative z-10">
                              <div>
                                <span className="text-[9px] font-extrabold text-neutral-500 uppercase tracking-widest block mb-1">Calories</span>
                                <span className="text-lg font-black text-white">{activeDoc.analysis?.dietPlan?.calories || 2000}</span>
                              </div>
                              <div>
                                <span className="text-[9px] font-extrabold text-neutral-500 uppercase tracking-widest block mb-1">Protein</span>
                                <span className="text-lg font-black text-white">{activeDoc.analysis?.dietPlan?.proteinG || 120}<span className="text-[10px] text-neutral-500 ml-0.5">g</span></span>
                              </div>
                              <div>
                                <span className="text-[9px] font-extrabold text-neutral-500 uppercase tracking-widest block mb-1">Carbs</span>
                                <span className="text-lg font-black text-white">{activeDoc.analysis?.dietPlan?.carbsG || 180}<span className="text-[10px] text-neutral-500 ml-0.5">g</span></span>
                              </div>
                              <div>
                                <span className="text-[9px] font-extrabold text-neutral-500 uppercase tracking-widest block mb-1">Fat</span>
                                <span className="text-lg font-black text-white">{activeDoc.analysis?.dietPlan?.fatG || 65}<span className="text-[10px] text-neutral-500 ml-0.5">g</span></span>
                              </div>
                              <div>
                                <span className="text-[9px] font-extrabold text-neutral-500 uppercase tracking-widest block mb-1">Fiber</span>
                                <span className="text-lg font-black text-white">{activeDoc.analysis?.dietPlan?.fiberG || 30}<span className="text-[10px] text-neutral-500 ml-0.5">g</span></span>
                              </div>
                            </div>

                            {/* Meal Plan */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 relative z-10">
                              <div className="p-5 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                                <span className="text-[9px] font-extrabold text-neutral-400 uppercase tracking-widest block mb-2">Breakfast Protocol</span>
                                <p className="text-xs text-white font-medium leading-relaxed">{activeDoc.analysis?.dietPlan?.breakfast}</p>
                              </div>
                              <div className="p-5 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                                <span className="text-[9px] font-extrabold text-neutral-400 uppercase tracking-widest block mb-2">Lunch Protocol</span>
                                <p className="text-xs text-white font-medium leading-relaxed">{activeDoc.analysis?.dietPlan?.lunch}</p>
                              </div>
                              <div className="p-5 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                                <span className="text-[9px] font-extrabold text-neutral-400 uppercase tracking-widest block mb-2">Dinner Protocol</span>
                                <p className="text-xs text-white font-medium leading-relaxed">{activeDoc.analysis?.dietPlan?.dinner}</p>
                              </div>
                              <div className="p-5 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                                <span className="text-[9px] font-extrabold text-neutral-400 uppercase tracking-widest block mb-2">Snacks Protocol</span>
                                <p className="text-xs text-white font-medium leading-relaxed">{activeDoc.analysis?.dietPlan?.snacks}</p>
                              </div>
                            </div>

                            {/* Avoid/Increase Lists */}
                            <div className="grid grid-cols-2 gap-4 pt-6 mt-4 border-t border-white/10 relative z-10">
                              <div className="p-5 bg-red-500/5 border border-red-500/20 rounded-2xl">
                                <span className="text-[10px] font-black text-red-400 uppercase tracking-widest block mb-3">Eliminate</span>
                                <ul className="list-none text-xs text-neutral-300 space-y-2 font-medium">
                                  {activeDoc.analysis?.dietPlan?.foodsToAvoid?.map((f: string, i: number) => <li key={i} className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-red-500 rounded-full" />{f}</li>)}
                                </ul>
                              </div>
                              <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-3">Prioritize</span>
                                <ul className="list-none text-xs text-neutral-300 space-y-2 font-medium">
                                  {activeDoc.analysis?.dietPlan?.foodsToIncrease?.map((f: string, i: number) => <li key={i} className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />{f}</li>)}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === 'exercise' && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Exercise Schedule */}
                            <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4 relative overflow-hidden shadow-xl hover:bg-white/10 transition-colors">
                              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
                              <h4 className="text-[10px] font-extrabold text-blue-400 uppercase tracking-widest relative z-10">Movement & Habits</h4>
                              <ul className="space-y-3 relative z-10">
                                {activeDoc.analysis?.exercisePlan?.workoutSuggestions?.map((ex: string, i: number) => (
                                  <li key={i} className="flex items-start gap-3 p-3 bg-black/40 border border-white/5 rounded-2xl">
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                                    <span className="text-xs text-white font-medium leading-relaxed">{ex}</span>
                                  </li>
                                ))}
                                <li className="flex items-start gap-3 p-3 bg-black/40 border border-white/5 rounded-2xl">
                                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0" />
                                  <span className="text-xs text-white font-medium leading-relaxed">Daily Walking Target: <span className="font-black text-emerald-400">{activeDoc.analysis?.exercisePlan?.walkingGoalSteps || 10000}</span> steps</span>
                                </li>
                              </ul>
                            </div>

                            {/* Doctor Questions & Reminders */}
                            <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4 relative overflow-hidden shadow-xl hover:bg-white/10 transition-colors">
                              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
                              <h4 className="text-[10px] font-extrabold text-purple-400 uppercase tracking-widest relative z-10">Reminders & Follow-Ups</h4>
                              <ul className="space-y-3 relative z-10">
                                {activeDoc.analysis?.followUpActions?.map((f: any, i: number) => (
                                  <li key={i} className="flex items-start gap-3 p-3 bg-black/40 border border-white/5 rounded-2xl">
                                    <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${f.status === 'Completed' ? 'bg-emerald-500' : 'bg-purple-500'}`} />
                                    <div className="flex flex-col">
                                      <span className="text-xs text-white font-black uppercase tracking-wide">{f.testName}</span>
                                      <span className="text-[10px] text-neutral-400 font-medium">In {f.intervalDays} days • {f.status}</span>
                                    </div>
                                  </li>
                                ))}
                                {(!activeDoc.analysis?.followUpActions || activeDoc.analysis.followUpActions.length === 0) && (
                                  <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest text-center py-4">No pending follow-ups</div>
                                )}
                              </ul>
                            </div>
                          </div>

                          {/* Questions to ask Doctor */}
                          <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4 relative overflow-hidden shadow-xl">
                            <h4 className="text-[10px] font-extrabold text-white uppercase tracking-widest flex items-center gap-2 relative z-10">
                              <BookOpen className="w-4 h-4 text-emerald-400" /> Physician Consultation Prep
                            </h4>
                            <p className="text-[10px] text-neutral-400 mb-2 relative z-10 font-medium">Ask your physician these questions regarding this report:</p>
                            <div className="space-y-3 relative z-10">
                              {activeDoc.analysis?.doctorQuestions?.map((q: string, idx: number) => (
                                <div key={idx} className="p-4 bg-black/40 border border-white/5 rounded-2xl text-xs text-white flex items-start gap-3 hover:bg-white/5 transition-colors">
                                  <span className="text-emerald-400 font-black text-sm uppercase">Q.</span>
                                  <span className="font-medium leading-relaxed">{q}</span>
                                </div>
                              ))}
                              {(!activeDoc.analysis?.doctorQuestions || activeDoc.analysis.doctorQuestions.length === 0) && (
                                <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest text-center py-4">No specific questions generated.</div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Ask AURA Trigger */}
                    <div className="border-t border-white/5 pt-6 mt-6 flex justify-between items-center">
                      <button
                        onClick={() => askAURAAboutReport(activeDoc)}
                        className="px-5 py-2.5 bg-white hover:bg-neutral-100 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer flex items-center gap-2"
                      >
                        Ask AURA About This Report
                      </button>
                      <span className="text-[9px] text-neutral-500 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Safe SSL Cryptographic Session
                      </span>
                    </div>

                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-[32px] bg-black/35 backdrop-blur-xl border border-white/10 p-12 text-center text-muted-foreground hover:border-white/20 transition-all duration-300">
              Please upload or select a clinical document from the index.
            </div>
          )}
        </div>
      </div>

      {/* Floating AURA Chat Panel */}
      <AuraChatPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={messages}
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
