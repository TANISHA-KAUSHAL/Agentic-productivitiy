'use client';

import React, { useState } from 'react';
import {
  CheckSquare,
  Sparkles,
  CheckCircle2,
  BarChart3,
  Mail,
  Lock,
  User as UserIcon,
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Bot
} from 'lucide-react';

interface AuthModalProps {
  onAuthSuccess: (user: { id: string; name: string; email: string }, token: string) => void;
}

export default function AuthModal({ onAuthSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = mode === 'login'
      ? { email, password }
      : { name, email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Authentication failed');
        setLoading(false);
        return;
      }

      localStorage.setItem('agent_token', data.token);
      localStorage.setItem('agent_user', JSON.stringify(data.user));

      onAuthSuccess(data.user, data.token);
    } catch (err) {
      console.error('API Error:', err);
      setErrorMessage('Could not connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Outer Container: Smooth auto-centering that NEVER clips or overflows
    <div className="min-h-screen w-full bg-[#f4f1fd] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans antialiased">
      
      {/* ========================================================= */}
      {/* THE RESPONSIVE MASTER CARD                                */}
      {/* ========================================================= */}
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl shadow-purple-900/5 border border-purple-100 flex flex-col md:flex-row overflow-hidden">
        
        {/* ======================================================= */}
        {/* LEFT PANEL: MARKETING & BRANDING (Visible on Tablets & Desktop) */}
        {/* ======================================================= */}
        <div className="hidden md:flex md:w-5/12 bg-gradient-to-br from-[#f8f6ff] via-[#f2eeff] to-[#e8dfff] p-8 flex-col justify-between border-r border-purple-100/80">
          
          {/* Top: Logo & Slogan */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#6b46c1] flex items-center justify-center text-white shadow-sm">
                <CheckSquare className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                GoalFlow
              </span>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-purple-700 italic tracking-wide">
                Dream It. Plan It. Achieve It.
              </span>
              <h1 className="text-2xl font-extrabold text-slate-900 leading-tight tracking-tight mt-1">
                Turn Your Goals Into{' '}
                <span className="text-[#6b46c1] underline decoration-purple-300 underline-offset-4">
                  Achievements
                </span>
              </h1>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Let AI plan, prioritize and track your tasks — smartly and effortlessly.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2.5 bg-white/90 px-3.5 py-2 rounded-xl border border-purple-200/50 shadow-2xs">
                <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                <span className="text-xs font-semibold text-slate-700">AI-Powered Planning</span>
              </div>
              <div className="flex items-center gap-2.5 bg-white/90 px-3.5 py-2 rounded-xl border border-purple-200/50 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs font-semibold text-slate-700">Smart Task Prioritization</span>
              </div>
              <div className="flex items-center gap-2.5 bg-white/90 px-3.5 py-2 rounded-xl border border-purple-200/50 shadow-2xs">
                <BarChart3 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="text-xs font-semibold text-slate-700">Daily Progress Insights</span>
              </div>
            </div>
          </div>

          {/* Center Graphic: AI Robot Pill */}
          <div className="py-4 flex items-center justify-center">
            <div className="w-full bg-white/80 border border-purple-200/60 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6b46c1] to-[#805ad5] flex items-center justify-center text-white shrink-0 shadow-sm">
                <Bot className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Gemini 2.5 Flash</p>
                <p className="text-[10px] text-purple-600 font-medium">Autonomous Productivity Agent</p>
              </div>
            </div>
          </div>

          {/* Bottom: Social Proof */}
          <div className="pt-3 border-t border-purple-200/60 flex items-center gap-2.5">
            <div className="flex -space-x-1.5">
              <div className="w-6 h-6 rounded-full bg-purple-500 border border-white flex items-center justify-center text-[9px] text-white font-bold">JD</div>
              <div className="w-6 h-6 rounded-full bg-indigo-500 border border-white flex items-center justify-center text-[9px] text-white font-bold">TK</div>
              <div className="w-6 h-6 rounded-full bg-violet-600 border border-white flex items-center justify-center text-[9px] text-white font-bold">AS</div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 leading-tight">10k+ Happy Users</p>
              <p className="text-[10px] text-slate-500">Autonomous daily planning</p>
            </div>
          </div>
        </div>

        {/* ======================================================= */}
        {/* RIGHT PANEL: AUTHENTICATION FORM (Mobile & Desktop)     */}
        {/* ======================================================= */}
        <div className="w-full md:w-7/12 p-6 sm:p-10 flex flex-col justify-between bg-white">
          
          <div className="space-y-4">
            
            {/* Mobile Header: Brand visible only on small screens */}
            <div className="md:hidden flex items-center gap-2 pb-2 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-[#6b46c1] flex items-center justify-center text-white">
                <CheckSquare className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-slate-900">GoalFlow</span>
            </div>

            {/* Header */}
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                {mode === 'login' ? 'Welcome Back!' : 'Create an Account!'} 👋
              </h2>
              <p className="text-xs text-slate-500">
                {mode === 'login'
                  ? 'Sign in to continue to GoalFlow Task Management'
                  : 'Start planning with autonomous AI for free'}
              </p>
            </div>

            {/* Tab Switcher: [ Login ] | [ Register ] */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/70">
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMessage(''); }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  mode === 'login'
                    ? 'bg-[#6b46c1] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>

              <button
                type="button"
                onClick={() => { setMode('register'); setErrorMessage(''); }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  mode === 'register'
                    ? 'bg-[#6b46c1] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register</span>
              </button>
            </div>

            {/* Error Alert */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-6">
              
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Tanisha Kaushal"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me & Forgot Password */}
              <div className="flex items-center justify-between text-xs text-slate-600 pt-0.5">
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input type="checkbox" className="rounded border-slate-300 text-purple-600 focus:ring-0" />
                  <span>Remember me</span>
                </label>
                <a href="#" className="text-purple-600 hover:text-purple-700 font-medium">Forgot password?</a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#6b46c1] hover:bg-[#5b32a8] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-purple-600/25 transition cursor-pointer disabled:opacity-50 mt-1"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                <span>{mode === 'login' ? 'Login' : 'Create Free Account'}</span>
              </button>
            </form>

            {/* Divider with perfectly centered "or"
            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 border-t border-slate-200"></div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 select-none">
                or
              </span>
              <div className="flex-1 border-t border-slate-200"></div>
            </div>

            {/* Social Logins */}
            {/* <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition cursor-pointer"
              >
                <span className="font-bold text-red-500">G</span>
                <span>Google</span>
              </button>

              <button
                type="button"
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition cursor-pointer"
              >
                <span className="font-bold text-slate-900">🐙</span>
                <span>GitHub</span>
              </button>
            </div> */}
          </div>
          {/* Bottom Switch Link */}
          <div className="text-center text-xs text-slate-500 pt-3 border-t border-slate-100 mt-2">
            {mode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  onClick={() => { setMode('register'); setErrorMessage(''); }}
                  className="text-purple-600 hover:underline font-semibold cursor-pointer"
                >
                  Register here &rarr;
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  onClick={() => { setMode('login'); setErrorMessage(''); }}
                  className="text-purple-600 hover:underline font-semibold cursor-pointer"
                >
                  Login here &rarr;
                </button>
              </p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
