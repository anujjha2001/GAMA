'use client';

import * as React from 'react';
import { useHealthStore, VaultDoc } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Upload, Sparkles, Plus, Check, Clock, ShieldCheck, Download, Calendar, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function VaultPage() {
  const { documents, uploadDocument, updateDocStatus, addMemoryTag } = useHealthStore();
  const [mounted, setMounted] = React.useState(false);
  const [activeDocId, setActiveDocId] = React.useState<string | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    if (documents.length > 0) {
      setActiveDocId(documents[0].id);
    }
  }, [documents]);

  if (!mounted) return null;

  const activeDoc = documents.find(d => d.id === activeDocId) || documents[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeString = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    triggerScanSimulation(file.name, sizeString);
  };

  const triggerScanSimulation = (name: string, size: string) => {
    // 1. Upload to store as scanning
    uploadDocument(name, size);
    toast.info(`Uploading and indexing "${name}"...`);

    // Let the new document be the active one
    setTimeout(() => {
      // Find the newly added doc (it is at index 0 because of uploadDocument logic)
      const latestDoc = useHealthStore.getState().documents[0];
      if (latestDoc) setActiveDocId(latestDoc.id);
    }, 100);

    // 2. Scan simulation timeline
    setTimeout(() => {
      const latestDoc = useHealthStore.getState().documents[0];
      if (!latestDoc) return;

      const mockGoals = [
        'Maintain daily activity volume above 12,000 steps',
        'Incorporate 25g dietary fiber daily to assist digestion',
        'Limit caffeine intake after 14:00'
      ];
      const mockPlan = [
        { title: 'Aerobic volume maintenance', description: 'Consistent active minutes during daylight peak', schedule: 'Daily' },
        { title: 'Fiber Enrichment Focus', description: 'Incorporate ground flaxseeds, chia, and raw greens', schedule: 'Meals' }
      ];

      updateDocStatus(latestDoc.id, 'analyzed', mockGoals, mockPlan);
      toast.success(`AURA finished scanning "${name}". Extracted health plan successfully!`);
    }, 3500);
  };

  const handleSyncToMemory = (goal: string) => {
    addMemoryTag('goal', goal);
    toast.success(`Synced: "${goal}" is now active in AURA's long-term memory`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative rounded-[32px] overflow-hidden bg-black/35 backdrop-blur-xl p-6 md:p-8 flex flex-col justify-between min-h-[160px] border border-white/10 hover:border-white/20 transition-all duration-300">
        <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-r from-orange-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Cryptographic Diagnostic Vault
          </span>
          <h1 className="text-3xl font-bold tracking-tight">Health Vault</h1>
          <p className="text-xs text-muted-foreground max-w-xl">
            Upload PDF reports, blood panels, and clinical printouts. AURA converts clinical files into machine-readable longevity goals.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Upload & Doc List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2">Secure Upload Portal</h3>

          {/* Upload Dropzone */}
          <div 
            className={`border-2 border-dashed rounded-[24px] p-6 text-center transition-all ${
              isDragging ? 'border-orange-500 bg-orange-500/5' : 'border-white/10 hover:border-orange-500/40 bg-black/35'
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) triggerScanSimulation(file.name, (file.size / (1024 * 1024)).toFixed(1) + ' MB');
            }}
          >
            <input
              type="file"
              id="vault-file"
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
              onChange={handleFileUpload}
            />
            <label htmlFor="vault-file" className="cursor-pointer space-y-3 block">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 mx-auto flex items-center justify-center text-orange-500">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-foreground hover:underline">Click to upload</span>
                <span className="text-[10px] text-muted-foreground block mt-1">or drag and drop PDF / Blood report files</span>
              </div>
            </label>
          </div>

          {/* Document list */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2">Document Index</h3>
            
            <div className="space-y-2">
              <AnimatePresence>
                {documents.map((doc) => {
                  const isActive = doc.id === activeDocId;
                  return (
                    <motion.div
                      key={doc.id}
                      onClick={() => setActiveDocId(doc.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 justify-between ${
                        isActive 
                          ? 'bg-white/10 border-orange-500/30 shadow-md ring-1 ring-orange-500/20 text-white' 
                          : 'bg-black/35 border-white/5 hover:border-white/10 text-neutral-300 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-orange-500/5 border border-orange-500/20 flex items-center justify-center text-orange-500 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold truncate">{doc.name}</h4>
                          <span className="text-[9px] text-neutral-400 block mt-0.5">{doc.uploadDate} • {doc.fileSize}</span>
                        </div>
                      </div>

                      <div>
                        {doc.status === 'scanning' ? (
                          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse block" title="AURA AI Scanning" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 block" title="Analyzed" />
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Side: Extraction & Action Plans */}
        <div className="lg:col-span-2">
          {activeDoc ? (
            <motion.div
              key={activeDoc.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[32px] bg-black/35 backdrop-blur-xl p-6 md:p-8 border border-white/10 space-y-6 flex flex-col justify-between h-full min-h-[500px] hover:border-white/20 transition-all duration-300"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Extracted Clinical Insights
                    </span>
                    <h2 className="text-xl font-bold">{activeDoc.name}</h2>
                    <p className="text-xs text-muted-foreground">Uploaded: {activeDoc.uploadDate} • {activeDoc.fileSize}</p>
                  </div>
                  
                  <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider ${
                    activeDoc.status === 'scanning'
                      ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                      : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                  }`}>
                    {activeDoc.status}
                  </span>
                </div>

                {activeDoc.status === 'scanning' ? (
                  <div className="py-16 text-center space-y-4">
                    <div className="relative w-16 h-16 mx-auto">
                      <div className="absolute inset-0 rounded-full border-4 border-orange-500/10 border-t-orange-500 animate-spin" />
                      <FileText className="w-6 h-6 text-orange-500 absolute inset-0 m-auto" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold">Scanning Document Architecture</p>
                      <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                        AURA is extracting medical entities, physiological ranges, and creating diagnostic mappings.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Actionable Goals list */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Extracted Goals</h3>
                      <div className="space-y-2">
                        {activeDoc.extractedGoals.map((goal, idx) => (
                          <div key={idx} className="p-3 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center gap-3 text-neutral-300">
                            <span className="text-xs leading-normal">{goal}</span>
                            <button
                              onClick={() => handleSyncToMemory(goal)}
                              className="px-2.5 py-1 bg-foreground text-background font-bold text-[9px] uppercase tracking-wider rounded-lg hover:opacity-90 cursor-pointer flex items-center gap-1 transition-opacity shrink-0"
                            >
                              <Plus className="w-2.5 h-2.5" /> Sync to AURA
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Schedule Plan */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Structured Action Plan</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeDoc.actionPlan.map((plan, idx) => (
                          <div key={idx} className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-2">
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="text-xs font-bold">{plan.title}</h4>
                              <span className="text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-orange-500/10 text-orange-500 border border-orange-500/20">
                                {plan.schedule}
                              </span>
                            </div>
                            <p className="text-[10px] text-neutral-400 leading-normal">{plan.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {activeDoc.status !== 'scanning' && (
                <div className="border-t border-white/5 pt-4 mt-6 flex justify-between items-center text-[10px] text-neutral-400">
                  <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> End-to-end encrypted</span>
                  <span>AURA Health System v0.1</span>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="rounded-[32px] bg-black/35 backdrop-blur-xl border border-white/10 p-12 text-center text-muted-foreground hover:border-white/20 transition-all duration-300">
              Please upload or select a clinical document from the index.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
