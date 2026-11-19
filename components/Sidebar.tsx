'use client';

import React from 'react';
import {
  CheckSquare,
  LayoutDashboard,
  Target,
  CheckCircle2,
  FileText,
  Settings as SettingsIcon,
  LogOut,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface SidebarProps {
  user: { id: string; name: string; email: string };
  activeTab: 'dashboard' | 'goals' | 'tasks' | 'summary' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'goals' | 'tasks' | 'summary' | 'settings') => void;
  onLogout: () => void;
}

export default function Sidebar({
  user,
  activeTab,
  setActiveTab,
  onLogout,
}: SidebarProps) {
  return (
    // Pinned to the left: h-screen sticky top-0
    <aside className="w-64 h-screen sticky top-0 bg-[#160d2e] text-white flex flex-col justify-between p-6 shrink-0 shadow-2xl border-r border-purple-950/40 select-none z-40">
      
      {/* Top: Logo & Nav items */}
      <div className="space-y-7">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#6b46c1] to-[#805ad5] flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              GoalFlow
            </h1>
            <p className="text-[10px] text-purple-300/70 tracking-wider uppercase font-semibold">
              Plan • Prioritize • Achieve
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5 text-xs font-semibold">
          
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl transition cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-[#3b2075] text-white shadow-lg shadow-purple-950/50 font-bold border border-purple-400/20'
                : 'text-purple-200/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('goals')}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl transition cursor-pointer ${
              activeTab === 'goals'
                ? 'bg-[#3b2075] text-white font-bold border border-purple-400/20'
                : 'text-purple-200/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>My Goals</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl transition cursor-pointer ${
              activeTab === 'tasks'
                ? 'bg-[#3b2075] text-white font-bold border border-purple-400/20'
                : 'text-purple-200/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Tasks</span>
          </button>

          <button
            onClick={() => setActiveTab('summary')}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl transition cursor-pointer ${
              activeTab === 'summary'
                ? 'bg-[#3b2075] text-white font-bold border border-purple-400/20'
                : 'text-purple-200/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Daily Summary</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl transition cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#3b2075] text-white font-bold border border-purple-400/20'
                : 'text-purple-200/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Settings</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-purple-200/70 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>

        </nav>
      </div>

      {/* Bottom: "Smarter Goals" Promo Card */}
      <div className="bg-gradient-to-br from-[#28154f] to-[#361a6b] border border-purple-400/20 rounded-2xl p-4 space-y-3 relative overflow-hidden shadow-lg">
        <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-300">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-white leading-tight">
            Smarter Goals.<br />Greater Progress.
          </h4>
        </div>
        <button
          onClick={() => setActiveTab('goals')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#6b46c1] hover:bg-[#5b32a8] text-white text-[11px] font-bold shadow-md transition cursor-pointer"
        >
          <span>Let's Go</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

    </aside>
  );
}
