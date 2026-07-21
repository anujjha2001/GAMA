'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, HeartPulse, Workflow, BarChart3, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tabId: 'dashboard' | 'aura' | 'twin' | 'insights' | 'vault') => void;
}

export function CommandPalette({ isOpen, onClose, onNavigate }: CommandPaletteProps) {
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const commands = [
    { id: 'go-nexus', label: 'Go to Nexus Dashboard', category: 'Navigation', icon: HeartPulse, action: () => onNavigate('dashboard') },
    { id: 'go-aura', label: 'Ask Aura AI Coach', category: 'Navigation', icon: Sparkles, action: () => onNavigate('aura') },
    { id: 'go-twin', label: 'View Digital Twin', category: 'Navigation', icon: Workflow, action: () => onNavigate('twin') },
    { id: 'go-insights', label: 'View Deep Insights', category: 'Navigation', icon: BarChart3, action: () => onNavigate('insights') },
  ];

const filtered = commands.filter((cmd) =>
  cmd.label.toLowerCase().includes(search.toLowerCase())
);

return (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-background/80 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          className="relative z-10 w-full max-w-2xl rounded-2xl border border-border bg-card/90 backdrop-blur-xl shadow-2xl overflow-hidden"
        >
          {/* Search Input */}
          <div className="flex items-center border-b border-border px-4 py-3.5">
            <Search className="h-5 w-5 text-muted-foreground mr-3" />
            <input
              type="text"
              placeholder="Search commands, navigate tabs, configure settings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              className="w-full bg-transparent text-foreground placeholder:text-muted-foreground border-0 focus:outline-hidden text-sm"
            />
            <span className="text-[10px] bg-secondary px-2 py-0.5 rounded-md text-muted-foreground border border-border">ESC</span>
          </div>

          {/* Suggestions list */}
          <div className="max-h-[350px] overflow-y-auto p-2 space-y-1">
            {filtered.length > 0 ? (
              filtered.map((cmd) => {
                const Icon = cmd.icon;
                return (
                  <button
                    key={cmd.id}
                    onClick={() => {
                      cmd.action();
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-secondary/80 transition-colors text-left text-sm cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-secondary rounded-lg text-muted-foreground group-hover:text-foreground transition-colors">
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{cmd.label}</p>
                        <p className="text-xs text-muted-foreground">{cmd.category}</p>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No commands found matching "{search}"
              </div>
            )}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);
}
