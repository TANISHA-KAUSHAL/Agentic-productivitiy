'use client';

import React, { useState } from 'react';
import { Search, Bell, ChevronDown, User as UserIcon, LogOut } from 'lucide-react';

interface NavbarProps {
  user: { id: string; name: string; email: string } | null;
  onLogout?: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const displayName = user?.name || 'Tanisha Kaushal';

  return (
    <header className="sticky top-0 z-30 h-16 px-6 lg:px-8 flex items-center justify-between bg-[#f8f9fe]/85 backdrop-blur-md border-b border-purple-100/40 select-none">
      
      {/* ========================================= */}
      {/* 1. LEFT: SEARCH INPUT (Ctrl + K)          */}
      {/* ========================================= */}
      <div className="w-full max-w-md">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-purple-400 absolute left-4 pointer-events-none" />
          <input
            type="text"
            placeholder="Search goals, tasks...   (Ctrl + K)"
            className="w-full pl-11 pr-4 py-2.5 rounded-full bg-white/90 border border-purple-100/80 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 shadow-xs transition"
          />
        </div>
      </div>

      {/* ========================================= */}
      {/* 2. RIGHT: NOTIFICATIONS & USER PROFILE    */}
      {/* ========================================= */}
      <div className="flex items-center gap-4">
        
        {/* Notification Bell with Red Dot */}
        <button
          title="Notifications"
          className="relative w-9 h-9 rounded-full bg-white border border-purple-100 flex items-center justify-center text-slate-600 hover:text-purple-600 hover:border-purple-200 shadow-xs transition cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 border border-white"></span>
        </button>

        {/* User Profile Pill with Avatar & Name */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-full bg-white border border-purple-100 hover:border-purple-200 shadow-xs transition cursor-pointer"
          >
            {/* User Avatar Circle */}
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#6b46c1] to-[#805ad5] text-white flex items-center justify-center text-xs font-bold shadow-xs">
              {displayName.charAt(0).toUpperCase()}
            </div>

            {/* User Full Name */}
            <span className="text-xs font-bold text-slate-800">
              {displayName}
            </span>

            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Quick Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-purple-100 py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="font-bold text-slate-800 truncate">{displayName}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email || 'tanisha@example.com'}</p>
              </div>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              )}
            </div>
          )}
        </div>

      </div>

    </header>
  );
}