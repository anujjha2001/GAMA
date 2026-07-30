'use client';

import { useState, useEffect } from 'react';
import { Activity, CheckCircle2, Clock, RefreshCw, Server, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SyncCenter() {
  const [providers, setProviders] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    const fetchSyncState = async () => {
      try {
        const res = await fetch('/api/v1/sync');
        const json = await res.json();
        if (json.success) {
          setProviders(json.data.providers);
          
          // Map DB jobs to UI format
          setJobs(json.data.jobs.map((job: any) => ({
            id: job.id.substring(0, 8),
            type: 'Background Sync',
            provider: job.provider,
            status: job.status === 'PENDING' ? 'Queued' : job.status === 'RUNNING' ? 'Running' : 'Completed',
            progress: job.status === 'RUNNING' ? 50 : job.status === 'COMPLETED' ? 100 : 0
          })));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchSyncState();
    const interval = setInterval(fetchSyncState, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 md:p-8 flex flex-col relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h2 className="text-2xl font-display font-medium text-white tracking-tight flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-emerald-400" />
            Sync Center
          </h2>
          <p className="text-sm text-slate-400 mt-1">Real-time background operations and provider health</p>
        </div>
        <button className="text-sm text-white/70 hover:text-white px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
          Force Sync All
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 relative z-10">
        
        {/* Provider Health Dashboard */}
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wider mb-2">Provider Health</h3>
          
          {providers.map((p, i) => (
            <motion.div 
              key={p.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-4 rounded-2xl bg-black/20 border border-white/5 hover:bg-black/40 transition-colors group"
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-slate-400" />
                  <span className="font-medium text-white">{p.name} API</span>
                </div>
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md bg-${p.color}-500/10 border border-${p.color}-500/20`}>
                  {p.status === 'Healthy' ? <CheckCircle2 className={`w-3 h-3 text-${p.color}-400`} /> : <AlertCircle className={`w-3 h-3 text-${p.color}-400`} />}
                  <span className={`text-[10px] font-medium text-${p.color}-400 uppercase tracking-wide`}>{p.status}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Latency</span>
                  <span className="text-slate-300">{p.latency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Last Sync</span>
                  <span className="text-slate-300">{p.lastSync}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">OAuth</span>
                  <span className={`${p.oauth === 'Connected' ? 'text-emerald-400' : 'text-amber-400'}`}>{p.oauth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Webhook</span>
                  <span className={`${p.webhook === 'Healthy' ? 'text-emerald-400' : 'text-amber-400'}`}>{p.webhook}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Background Job Queue */}
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
            Background Queue
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] text-slate-300">3 Active</span>
          </h3>

          <div className="flex flex-col gap-3">
            {jobs.map((job, i) => (
              <motion.div 
                key={job.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 rounded-2xl bg-gradient-to-r from-white/[0.03] to-transparent border border-white/5 relative overflow-hidden"
              >
                {/* Progress Bar Background */}
                {job.progress > 0 && (
                  <div 
                    className="absolute inset-0 bg-emerald-500/10 pointer-events-none transition-all duration-1000 ease-linear"
                    style={{ width: `${job.progress}%` }}
                  />
                )}
                
                <div className="relative z-10 flex justify-between items-start mb-1">
                  <span className="font-medium text-slate-200 text-sm">{job.type}</span>
                  <span className="text-[10px] text-slate-500">{job.id}</span>
                </div>
                
                <div className="relative z-10 flex justify-between items-center mt-2">
                  <span className="text-xs text-slate-400">{job.provider}</span>
                  <div className="flex items-center gap-1.5">
                    {job.status === 'Running' && <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />}
                    {job.status === 'Queued' && <Clock className="w-3 h-3 text-slate-400" />}
                    {job.status === 'Retrying' && <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />}
                    <span className={`text-xs ${
                      job.status === 'Running' ? 'text-emerald-400' : 
                      job.status === 'Retrying' ? 'text-amber-400' : 'text-slate-400'
                    }`}>{job.status}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <button className="mt-auto w-full py-3 rounded-2xl border border-dashed border-white/10 text-xs text-slate-400 hover:text-white hover:border-white/30 transition-colors">
            View All Historical Syncs
          </button>
        </div>

      </div>
    </div>
  );
}
