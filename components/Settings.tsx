'use client';

import React from 'react';
import {
  Settings as SettingsIcon,
  User as UserIcon,
  Bot,
  Wrench,
  ShieldCheck,
  CheckCircle2,
  LogOut,
  Cpu,
  Database
} from 'lucide-react';

interface SettingsProps {
  user: { id: string; name: string; email: string };
  onLogout: () => void;
}

export default function Settings({ user, onLogout }: SettingsProps) {
  const tools = [
    { name: 'Workspace File Checker', key: 'workspace_file_checker', desc: 'Verifies files, directories, and structural assets.' },
    { name: 'Code Syntax Validator', key: 'code_syntax_validator', desc: 'Validates syntax, lint rules, and builds.' },
    { name: 'Git Commit Inspector', key: 'git_commit_inspector', desc: 'Inspects commits, branches, and diff histories.' },
    { name: 'API Endpoint Verifier', key: 'api_endpoint_verifier', desc: 'Pings endpoints and validates response schemas.' },
    { name: 'Focus Timer Tracker', key: 'focus_timer_tracker', desc: 'Logs deep-work focus intervals.' },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-purple-600" />
          <span>System & Account Settings</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Agent configuration, connected models, and active autonomous tools.
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-purple-600" />
          <span>User Profile</span>
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6b46c1] to-[#805ad5] text-white flex items-center justify-center text-base font-bold shadow-md shadow-purple-600/30">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
              <p className="text-[10px] text-purple-600 font-mono mt-0.5">ID: {user.id}</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* AI Engine Status */}
      <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Bot className="w-4 h-4 text-purple-600" />
            <span>AI Planning Engine</span>
          </h2>
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Connected & Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <p className="text-slate-400 text-[11px] font-medium">Model</p>
            <p className="text-slate-900 font-bold mt-1">Gemini 2.5 Flash</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <p className="text-slate-400 text-[11px] font-medium">Role</p>
            <p className="text-slate-900 font-bold mt-1">Autonomous Planner</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <p className="text-slate-400 text-[11px] font-medium">Database</p>
            <p className="text-slate-900 font-bold mt-1">Multi-tenant JSON Store</p>
          </div>
        </div>
      </div>

      {/* Tools Catalog */}
      <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-purple-600" />
          <span>Active Autonomous Tools</span>
        </h2>

        <div className="space-y-2.5">
          {tools.map((t) => (
            <div
              key={t.key}
              className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4"
            >
              <div>
                <p className="text-xs font-bold text-slate-800">{t.name}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{t.desc}</p>
              </div>
              <span className="text-[10px] font-mono bg-purple-50 text-purple-700 border border-purple-100 px-2.5 py-1 rounded-lg">
                {t.key}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
