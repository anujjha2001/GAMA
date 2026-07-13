'use client';

import * as React from 'react';
import Link from 'next/link';
import { Activity, MessageSquare, User, BarChart3, FolderLock } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TabId = 'nexus' | 'aura' | 'twin' | 'insights' | 'vault';

export interface FloatingDockProps {
  activeTab: TabId;
  className?: string;
}

export function FloatingDock({ activeTab, className }: FloatingDockProps) {
  const items = [
    { id: 'nexus', label: 'Nexus', icon: Activity },
    { id: 'aura', label: 'Aura', icon: MessageSquare },
    { id: 'twin', label: 'Twin', icon: User },
    { id: 'insights', label: 'Insights', icon: BarChart3 },
    { id: 'vault', label: 'Vault', icon: FolderLock },
  ] as const;

  return (
    <div className={cn('fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg px-6 py-2.5', className)}>
      <div className="max-w-2xl mx-auto flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <Link
              key={item.id}
              href={`/${item.id}`}
              className={cn(
                'flex flex-col items-center justify-center py-1.5 px-4 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 group cursor-pointer relative',
                isActive
                  ? 'text-slate-950 font-extrabold'
                  : 'text-slate-400 hover:text-slate-900'
              )}
            >
              <Icon className={cn('h-5 w-5 mb-1 transition-transform duration-200 group-hover:scale-105', {
                'text-slate-950': isActive,
                'text-slate-400': !isActive,
              })} />
              <span>{item.label}</span>
              {isActive && (
                <div className="absolute top-0 h-[2px] bg-slate-950 left-4 right-4" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
