'use client';

import React, { useState, useEffect } from 'react';
import {
  Target,
  Sparkles,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Loader2,
  Plus,
  Laptop,
  ChevronDown,
  ChevronUp,
  Play,
  Check,
  CheckCheck
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

interface GoalsViewProps {
  user: { id: string; name: string; email: string };
  token: string;
  onNavigateToDashboard?: () => void;
  onSelectGoalTasks?: (goalId: string) => void;
}

export default function GoalsView({ user, token, onNavigateToDashboard, onSelectGoalTasks }: GoalsViewProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);
  const [newGoalInput, setNewGoalInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);
  const [activatingGoalId, setActivatingGoalId] = useState<string | null>(null);
  const [runningTaskId, setRunningTaskId] = useState<string | null>(null);

  const fetchGoalsAndTasks = async () => {
    try {
      const res = await fetch('/api/goals', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch goals');
      const data = await res.json();
      setActiveGoal(data.activeGoal);
      setGoals(data.goals || []);
      setTasks(data.tasks || []);
      // Auto-expand the active goal by default
      if (data.activeGoal && !expandedGoalId) {
        setExpandedGoalId(data.activeGoal.id);
      }
    } catch (err) {
      console.error('Fetch Goals Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoalsAndTasks();
  }, [token]);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalInput.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ goal: newGoalInput })
      });
      if (!res.ok) throw new Error('Failed to create goal');
      setNewGoalInput('');
      await fetchGoalsAndTasks();
    } catch (err) {
      console.error('Create Goal Error:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleSetActiveGoal = async (goalId: string) => {
    setActivatingGoalId(goalId);
    try {
      const res = await fetch('/api/goals', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ goalId })
      });
      if (res.ok) {
        await fetchGoalsAndTasks();
      }
    } catch (err) {
      console.error('Set Active Goal Error:', err);
    } finally {
      setActivatingGoalId(null);
    }
  };

  const handleRunTool = async (taskId: string) => {
    setRunningTaskId(taskId);
    try {
      const res = await fetch(`/api/tasks/${taskId}/tool`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        await fetchGoalsAndTasks();
      }
    } catch (err) {
      console.error('Run Tool Error:', err);
    } finally {
      setRunningTaskId(null);
    }
  };

  const getToolDisplayName = (tool: string) => {
    switch (tool) {
      case 'workspace_file_checker': return 'File Checker';
      case 'code_syntax_validator': return 'Code Editor';
      case 'git_commit_inspector': return 'Git Inspector';
      case 'api_endpoint_verifier': return 'API Verifier';
      case 'focus_timer_tracker': return 'Focus Timer';
      default: return tool || 'Tool';
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Target className="w-6 h-6 text-purple-600" />
            <span>My Goals & AI Task Decompositions</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Review all your planned goals, inspect their individual subtasks, and switch your active focus.
          </p>
        </div>
      </div>

      {/* Create New Goal Banner */}
      <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>Set a New Goal with Gemini 2.5 Flash</span>
        </h2>
        <form onSubmit={handleCreateGoal} className="flex gap-2">
          <input
            type="text"
            value={newGoalInput}
            onChange={(e) => setNewGoalInput(e.target.value)}
            placeholder="e.g. Master Next.js 15, Launch Mobile App, Write Tech Resume"
            className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 border border-purple-100 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-500 focus:bg-white transition"
          />
          <button
            type="submit"
            disabled={creating}
            className="px-5 py-2.5 rounded-2xl bg-[#6b46c1] hover:bg-[#5833a6] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-purple-600/20 transition cursor-pointer disabled:opacity-50"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span>{creating ? 'Planning...' : 'Create & Plan'}</span>
          </button>
        </form>
      </div>

      {/* Goals List with Subtasks */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
          All Goals & Subtasks ({goals.length})
        </h3>

        {goals.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-purple-200">
            <Target className="w-10 h-10 text-purple-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">No goals created yet</p>
            <p className="text-xs text-slate-400 mt-1">
              Enter your first goal above to let Gemini break it down into prioritized subtasks.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => {
              const isActive = activeGoal?.id === goal.id;
              const dateStr = new Date(goal.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              // Tasks tied specifically to this goal
              const goalTasks = tasks.filter((t) => t.goalId === goal.id);
              const totalTasks = goalTasks.length;
              const completedTasks = goalTasks.filter((t) => t.status === 'completed').length;
              const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
              const isExpanded = expandedGoalId === goal.id;

              return (
                <div
                  key={goal.id}
                  className={`bg-white rounded-3xl border transition duration-200 overflow-hidden ${
                    isActive
                      ? 'border-purple-400 shadow-md ring-2 ring-purple-100'
                      : 'border-purple-100 hover:border-purple-200 shadow-xs'
                  }`}
                >
                  {/* Goal Header Row */}
                  <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Laptop className="w-6 h-6" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h4 className="text-base font-extrabold text-slate-900">
                            {goal.title}
                          </h4>
                          {isActive ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              Active Goal
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSetActiveGoal(goal.id)}
                              disabled={activatingGoalId === goal.id}
                              className="px-2.5 py-0.5 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-[10px] font-bold transition cursor-pointer"
                            >
                              {activatingGoalId === goal.id ? 'Setting...' : 'Set as Active'}
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{dateStr}</span>
                          </span>
                          <span>•</span>
                          <span className="font-semibold text-slate-600">
                            {completedTasks} / {totalTasks} Tasks Completed ({progressPercent}%)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar & Toggle Button */}
                    <div className="flex items-center gap-4 self-end md:self-center">
                      <div className="w-32 hidden sm:block">
                        <div className="w-full bg-purple-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                          ></div>
                        </div>
                        <div className="text-right text-[10px] font-bold text-slate-500 mt-1">
                          {progressPercent}% Complete
                        </div>
                      </div>

                      {isActive && onNavigateToDashboard && (
                        <button
                          onClick={onNavigateToDashboard}
                          className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <span>Dashboard</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => setExpandedGoalId(isExpanded ? null : goal.id)}
                        className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold flex items-center gap-1.5 border border-slate-200/60 transition cursor-pointer"
                      >
                        <span>{isExpanded ? 'Hide Tasks' : `View Tasks (${totalTasks})`}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-500" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Subtasks List */}
                  {isExpanded && (
                    <div className="border-t border-purple-100 bg-[#faf9fe] p-6 space-y-3 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between pb-1">
                        <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                          <span>Subtasks Planned by Gemini ({totalTasks})</span>
                        </span>
                        {onSelectGoalTasks && (
                          <button
                            onClick={() => onSelectGoalTasks(goal.id)}
                            className="text-[11px] font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl border border-purple-200 shadow-2xs cursor-pointer transition"
                          >
                            <span>Open in Tasks Board</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {goalTasks.length === 0 ? (
                        <div className="py-4 text-center text-xs text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                          No subtasks currently associated with this goal.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {goalTasks.map((task) => {
                            const priorityColors = {
                              P1: 'bg-rose-50 text-rose-700 border-rose-200',
                              P2: 'bg-amber-50 text-amber-700 border-amber-200',
                              P3: 'bg-yellow-50 text-yellow-800 border-yellow-200',
                              P4: 'bg-blue-50 text-blue-700 border-blue-200',
                            };
                            const isCompleted = task.status === 'completed';

                            return (
                              <div
                                key={task.id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-100 hover:border-purple-200 transition gap-2"
                              >
                                <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
                                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border shrink-0 ${priorityColors[task.priority]}`}>
                                    {task.priority}
                                  </span>
                                  <div className="min-w-0">
                                    <p className={`text-xs font-semibold text-slate-800 truncate ${isCompleted ? 'line-through text-slate-400' : ''}`}>
                                      {task.title}
                                    </p>
                                    {task.description && (
                                      <p className="text-[11px] text-slate-400 truncate">
                                        {task.description}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                  <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 hidden md:inline">
                                    {task.category || 'General'}
                                  </span>

                                  <span className="text-[10px] font-medium text-purple-700 bg-purple-50 px-2 py-1 rounded-lg border border-purple-100">
                                    {getToolDisplayName(task.toolRequired)}
                                  </span>

                                  <button
                                    onClick={() => handleRunTool(task.id)}
                                    disabled={runningTaskId === task.id || isCompleted}
                                    className={`px-3 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 transition cursor-pointer ${
                                      isCompleted
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : 'bg-purple-600 hover:bg-purple-700 text-white shadow-2xs'
                                    }`}
                                  >
                                    {runningTaskId === task.id ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : isCompleted ? (
                                      <Check className="w-3 h-3 text-emerald-600" />
                                    ) : (
                                      <Play className="w-2.5 h-2.5 fill-current" />
                                    )}
                                    <span>{isCompleted ? 'Completed' : 'Run Tool'}</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
