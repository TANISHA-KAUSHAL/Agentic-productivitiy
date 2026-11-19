'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Target,
  CheckCircle2,
  Trophy,
  Calendar,
  Clock,
  ArrowRight,
  Loader2,
  Laptop,
  Check,
  RefreshCw,
  Lightbulb,
  FileText,
  Play,
  Bot
} from 'lucide-react';

interface Task {
  id: string;
  userId: string;
  goalId?: string;
  title: string;
  description: string;
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  status: 'todo' | 'in_progress' | 'completed' | 'blocked';
  category: string;
  toolRequired: string;
  estimatedMinutes: number;
  toolExecutionLog?: string | null;
}

interface Goal {
  id: string;
  title: string;
  createdAt: string;
  isActive?: boolean;
}

interface DailySummary {
  completionRate: number;
  totalTasks: number;
  completedTasks: number;
  productivityScore: number;
  highlights: string[];
  aiRecommendation: string;
}

interface DashboardViewProps {
  user: { id: string; name: string; email: string };
  token: string;
  onNavigateTab?: (tab: 'dashboard' | 'goals' | 'tasks' | 'summary' | 'settings') => void;
  onSelectGoalTasks?: (goalId: string) => void;
}

export default function DashboardView({ user, token, onNavigateTab, onSelectGoalTasks }: DashboardViewProps) {
  // State variables
  const [goalInput, setGoalInput] = useState('');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlanning, setIsPlanning] = useState(false);
  const [runningTaskId, setRunningTaskId] = useState<string | null>(null);
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [agentMessage, setAgentMessage] = useState<string | null>(null);

  // ========================================================
  // API INTEGRATION 1: Fetch dashboard data on initial load
  // ========================================================
  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/goals', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch data');
      const data = await res.json();

      const userGoals: Goal[] = data.goals || [];
      const userTasks: Task[] = data.tasks || [];

      setGoals(userGoals);
      setTasks(userTasks);

      // Smart Active Goal: server determines active goal (pending-first or newest)
      const active = data.activeGoal || (userGoals.length > 0 ? userGoals[userGoals.length - 1] : null);
      setActiveGoal(active);

      if (data.summaries && data.summaries.length > 0) {
        setSummary(data.summaries[0]);
      }
    } catch (err) {
      console.error('Fetch Dashboard Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  // Handler to switch active goal from quick tabs
  const handleSelectGoal = async (goal: Goal) => {
    setActiveGoal(goal);
    try {
      await fetch('/api/goals', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ goalId: goal.id })
      });
    } catch (err) {
      console.error('Select Goal Error:', err);
    }
  };

  // ========================================================
  // API INTEGRATION 2: Send goal to Gemini AI Planner
  // ========================================================
  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalInput.trim()) return;

    setIsPlanning(true);
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          goal: goalInput,
          replaceExisting: true // Replaces active plan with the new AI plan
        })
      });

      if (!res.ok) throw new Error('Planning failed');
      const data = await res.json();

      setGoalInput('');
      await fetchDashboardData(); // Refresh UI with the newly generated tasks!
    } catch (err) {
      console.error('Goal Creation Error:', err);
    } finally {
      setIsPlanning(false);
    }
  };

  // ========================================================
  // API INTEGRATION 3: Run autonomous tool on a specific task
  // ========================================================
  const handleRunTool = async (taskId: string) => {
    setRunningTaskId(taskId);
    setAgentMessage(null);
    try {
      const res = await fetch(`/api/tasks/${taskId}/tool`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Tool execution failed');
      const data = await res.json();
      setAgentMessage(`✓ ${data.message || 'Tool executed successfully!'}`);
      await fetchDashboardData(); // Refreshes task status to "completed"!
    } catch (err) {
      console.error('Tool execution error:', err);
    } finally {
      setRunningTaskId(null);
    }
  };

  // ========================================================
  // API INTEGRATION 4: Autonomous Agent Auto-Run Loop
  // ========================================================
  const handleAutoRun = async () => {
    setIsAutoRunning(true);
    setAgentMessage('Autonomous Agent is evaluating and verifying pending tasks...');
    try {
      const res = await fetch('/api/agent/auto-run', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Auto-run failed');
      const data = await res.json();
      setAgentMessage(`✓ Autonomous Loop Complete: ${data.message}`);
      await fetchDashboardData();
    } catch (err) {
      console.error('Auto-run error:', err);
    } finally {
      setIsAutoRunning(false);
    }
  };

  // Filter tasks strictly for the ACTIVE goal
  const activeGoalTasks = activeGoal
    ? tasks.filter((t) => t.goalId === activeGoal.id)
    : [];

  const activeGoalTotal = activeGoalTasks.length;
  const activeGoalCompleted = activeGoalTasks.filter((t) => t.status === 'completed').length;
  const progressPercent = activeGoalTotal > 0 ? Math.round((activeGoalCompleted / activeGoalTotal) * 100) : 0;

  // Identify in-progress / pending goals
  const pendingGoals = goals.filter((g) => {
    const gTasks = tasks.filter((t) => t.goalId === g.id);
    const done = gTasks.filter((t) => t.status === 'completed').length;
    return gTasks.length === 0 || done < gTasks.length;
  });

  const todayDateString = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* ========================================================= */}
      {/* 1. HERO WELCOME & GEMINI GOAL PLANNER CARD                */}
      {/* ========================================================= */}
      <div className="bg-gradient-to-r from-[#fbfaff] via-[#f5f1ff] to-[#ece5ff] rounded-3xl p-6 sm:p-8 border border-purple-100/80 shadow-xs relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left: Greeting & Goal Input */}
        <div className="flex-1 space-y-4 w-full">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Good Morning, <span className="text-[#6b46c1]">{user.name || 'Tanisha'}!</span> 👋
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Let's turn your goals into achievements today.
            </p>
          </div>

          {/* Goal Input Bar (Calls API #2) */}
          <form onSubmit={handleCreatePlan} className="relative flex items-center max-w-xl">
            <div className="relative w-full">
              <Sparkles className="w-4 h-4 text-purple-500 absolute left-4 top-3.5" />
              <input
                type="text"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                placeholder="Enter your goal... (e.g. Learn React, Build a portfolio, Launch MVP)"
                className="w-full pl-11 pr-32 py-3 rounded-2xl bg-white border border-purple-200/80 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 shadow-xs transition"
              />
              <button
                type="submit"
                disabled={isPlanning}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-xl bg-[#6b46c1] hover:bg-[#5b32a8] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition cursor-pointer disabled:opacity-50"
              >
                {isPlanning ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>{isPlanning ? 'Planning...' : 'Create Plan'}</span>
              </button>
            </div>
          </form>

          {/* Subtext */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="font-bold text-red-500">G</span>
            <span>Powered by <strong className="text-purple-700">Gemini 2.5 Flash</strong></span>
          </div>
        </div>

        {/* Right: AI Robot Badge & Motto */}
        <div className="hidden lg:flex items-center gap-4 shrink-0">
          <div className="w-24 h-24 rounded-3xl bg-white/95 border border-purple-200/70 shadow-md flex items-center justify-center p-2">
            <svg className="w-20 h-20 drop-shadow-xs" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Left & Right Ears */}
              <rect x="14" y="44" width="8" height="16" rx="4" fill="#805ad5" />
              <rect x="78" y="44" width="8" height="16" rx="4" fill="#805ad5" />
              {/* Antenna */}
              <rect x="47" y="12" width="6" height="14" rx="3" fill="#a78bfa" />
              <circle cx="50" cy="12" r="6" fill="#8b5cf6" />
              {/* Head */}
              <rect x="20" y="24" width="60" height="56" rx="20" fill="url(#botHeadGrad)" stroke="#c4b5fd" strokeWidth="2" />
              {/* Face screen */}
              <rect x="27" y="34" width="46" height="34" rx="12" fill="#1e1338" />
              {/* Eyes */}
              <circle cx="39" cy="50" r="5" fill="#38bdf8" />
              <circle cx="61" cy="50" r="5" fill="#38bdf8" />
              <circle cx="41" cy="48" r="1.5" fill="#ffffff" />
              <circle cx="63" cy="48" r="1.5" fill="#ffffff" />
              {/* Smile */}
              <path d="M45 56 Q50 60 55 56" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
              <defs>
                <linearGradient id="botHeadGrad" x1="20" y1="24" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#ffffff" />
                  <stop offset="1" stopColor="#ede9fe" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="text-right">
            <p className="text-sm font-extrabold text-purple-950 italic tracking-wide">Dream It.</p>
            <p className="text-sm font-extrabold text-purple-800 italic tracking-wide">Plan It.</p>
            <p className="text-sm font-extrabold text-[#6b46c1] italic tracking-wide">Achieve It.</p>
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 2. THE 4 QUICK STAT CARDS                                 */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Active Goal */}
        <div
          onClick={() => onNavigateTab?.('goals')}
          className="bg-white rounded-2xl p-4 border border-purple-100 shadow-xs flex items-center justify-between cursor-pointer hover:border-purple-300 transition"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xl font-extrabold text-slate-900 leading-tight">
                {activeGoal ? 1 : 0}
              </p>
              <p className="text-[11px] text-slate-500 font-medium truncate max-w-[110px]" title={activeGoal?.title || 'Active Goal'}>
                {activeGoal ? activeGoal.title : 'Active Goal'}
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300" />
        </div>

        {/* Card 2: Tasks Completed */}
        <div
          onClick={() => onNavigateTab?.('tasks')}
          className="bg-white rounded-2xl p-4 border border-purple-100 shadow-xs flex items-center justify-between cursor-pointer hover:border-purple-300 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-slate-900 leading-tight">
                {activeGoalCompleted} / {activeGoalTotal}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">Tasks Completed</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300" />
        </div>

        {/* Card 3: Overall Progress */}
        <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-slate-900 leading-tight">
                {progressPercent}%
              </p>
              <p className="text-[11px] text-slate-500 font-medium">Overall Progress</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300" />
        </div>

        {/* Card 4: Today's Date */}
        <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 leading-tight">Today</p>
              <p className="text-[11px] text-slate-500 font-medium">{todayDateString}</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300" />
        </div>

      </div>

      {/* ========================================================= */}
      {/* 3. SPLIT MAIN SECTION: TASKS (7 Cols) + SUMMARY (5 Cols)   */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ======================================================= */}
        {/* LEFT COLUMN: ACTIVE GOAL & AI TASK PLAN (7 Cols)        */}
        {/* ======================================================= */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-xs space-y-5">
            
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Target className="w-4 h-4 text-purple-600" />
                  <span>My Goals</span>
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                  Click any goal card below to open its specific task board.
                </p>
              </div>

              <button
                onClick={() => onNavigateTab?.('goals')}
                className="text-xs text-purple-600 font-semibold cursor-pointer hover:underline flex items-center gap-1"
              >
                <span>View All ({goals.length})</span>
                <span>&rarr;</span>
              </button>
            </div>

            {/* Goals in a Row / Grid */}
            {goals.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-purple-200 rounded-2xl text-slate-500 text-xs">
                No goals yet. Enter a goal in the banner above and click "Create Plan"!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {goals.map((goal) => {
                  const goalTasks = tasks.filter((t) => t.goalId === goal.id);
                  const total = goalTasks.length;
                  const completed = goalTasks.filter((t) => t.status === 'completed').length;
                  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
                  const isDone = total > 0 && completed === total;
                  const isActive = activeGoal?.id === goal.id;

                  return (
                    <div
                      key={goal.id}
                      onClick={() => onSelectGoalTasks ? onSelectGoalTasks(goal.id) : onNavigateTab?.('tasks')}
                      className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between gap-4 group ${
                        isActive
                          ? 'bg-[#fbfaff] border-purple-300 shadow-xs ring-2 ring-purple-100/80'
                          : 'bg-white border-slate-100 hover:border-purple-200 hover:shadow-md'
                      }`}
                    >
                      {/* Top: Icon + Status */}
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 group-hover:bg-purple-100 text-purple-600 flex items-center justify-center transition">
                          <Laptop className="w-5 h-5" />
                        </div>
                        {isDone ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Completed
                          </span>
                        ) : isActive ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-extrabold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse"></span>
                            Active
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                            In Progress
                          </span>
                        )}
                      </div>

                      {/* Title & Subtitle */}
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-700 transition line-clamp-2">
                          {goal.title}
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {total} {total === 1 ? 'subtask' : 'subtasks'} planned
                        </p>
                      </div>

                      {/* Progress Bar & Open Action */}
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <div className="w-full bg-purple-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>

                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-500">
                            {completed}/{total} Done ({percent}%)
                          </span>
                          <span className="font-bold text-purple-600 group-hover:translate-x-0.5 transition flex items-center gap-1">
                            <span>Open Tasks</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>

        {/* ======================================================= */}
        {/* RIGHT COLUMN: CIRCULAR PROGRESS & DAILY SUMMARY (5 Cols) */}
        {/* ======================================================= */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card A: Today's Progress & Donut Chart */}
          <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Today's Progress
            </h3>

            <div className="flex items-center gap-5">
              {/* SVG Circular Donut Chart */}
              <div className="relative w-20 h-20 shrink-0">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    stroke="#f3effe"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    stroke="#10b981"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray="213.6"
                    strokeDashoffset={213.6 - (213.6 * progressPercent) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-extrabold text-slate-800">
                  {progressPercent}%
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-900">
                  {activeGoalCompleted} of {activeGoalTotal} Tasks Done
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {progressPercent === 100 ? 'All finished! Outstanding velocity! 🎉' : `Great momentum on "${activeGoal?.title || 'active goal'}"!`}
                </p>
              </div>
            </div>

            {/* AI Suggestion Box */}
            <div className="p-3.5 rounded-2xl bg-[#faf8ff] border border-purple-100/80 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>AI Suggestion:</span>
              </div>
              <p className="text-xs text-purple-950/80 leading-relaxed">
                {summary?.aiRecommendation || 'Focus on completing your P1 tasks to maintain strong daily momentum!'}
              </p>
            </div>
          </div>

          {/* Card B: Daily Summary Highlights */}
          <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-purple-600" />
                <span>Daily Summary</span>
              </h3>
              <button
                onClick={() => onNavigateTab?.('summary')}
                className="text-[11px] text-purple-600 font-semibold cursor-pointer hover:underline"
              >
                View Details &rarr;
              </button>
            </div>

            <div className="bg-[#f0fdf4] border border-emerald-200/60 rounded-2xl p-4 space-y-2">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-950">
                    {progressPercent >= 60 ? 'You made great progress today!' : 'Keep pushing forward!'}
                  </h4>
                  <p className="text-[11px] text-emerald-800/80 mt-0.5 leading-relaxed">
                    Completed {activeGoalCompleted} tasks out of {activeGoalTotal} ({progressPercent}%) for active goal. Keep going!
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}