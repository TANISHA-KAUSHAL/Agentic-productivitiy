'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  Sparkles,
  Play,
  Check,
  Trash2,
  Filter,
  Loader2,
  Search,
  Bot,
  Target,
  X,
  ChevronDown
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
}

interface TasksViewProps {
  user: { id: string; name: string; email: string };
  token: string;
  selectedGoalId?: string | null;
  onClearGoalFilter?: () => void;
  onSelectGoalId?: (goalId: string | null) => void;
}

export default function TasksView({
  user,
  token,
  selectedGoalId,
  onClearGoalFilter,
  onSelectGoalId
}: TasksViewProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [runningTaskId, setRunningTaskId] = useState<string | null>(null);

  const fetchTasksAndGoals = async () => {
    try {
      const [tasksRes, goalsRes] = await Promise.all([
        fetch('/api/tasks', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/goals', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      let allTasks: Task[] = [];

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        allTasks = Array.isArray(tasksData) ? tasksData : (tasksData.tasks || []);
      }

      if (goalsRes.ok) {
        const goalsData = await goalsRes.json();
        setGoals(goalsData.goals || []);
        if (allTasks.length === 0 && goalsData.tasks) {
          allTasks = goalsData.tasks;
        }
      }

      setTasks(allTasks);
    } catch (err) {
      console.error('Fetch Tasks Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksAndGoals();
  }, [token]);

  const handleToggleStatus = async (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'completed' ? 'todo' : 'completed';
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t))
        );
      }
    } catch (err) {
      console.error('Update status error:', err);
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
        await fetchTasksAndGoals();
      }
    } catch (err) {
      console.error('Run tool error:', err);
    } finally {
      setRunningTaskId(null);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to remove this task?')) return;
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
      }
    } catch (err) {
      console.error('Delete task error:', err);
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

  const activeFilteredGoal = goals.find((g) => g.id === selectedGoalId);

  const filteredTasks = tasks.filter((task) => {
    const matchesGoal = selectedGoalId ? task.goalId === selectedGoalId : true;
    const matchesPriority = filterPriority === 'ALL' || task.priority === filterPriority;
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGoal && matchesPriority && matchesSearch;
  });

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
            <CheckCircle2 className="w-6 h-6 text-purple-600" />
            <span>Tasks</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Eisenhower prioritized tasks with autonomous agent tool verification.
          </p>
        </div>

        {/* Goal Selector Dropdown */}
        {goals.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Filter by Goal:</span>
            <select
              value={selectedGoalId || 'ALL'}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'ALL') {
                  onClearGoalFilter?.();
                } else {
                  onSelectGoalId?.(val);
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-white border border-purple-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-100 cursor-pointer shadow-2xs"
            >
              <option value="ALL">All Goals ({tasks.length} tasks)</option>
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title} ({tasks.filter((t) => t.goalId === g.id).length} tasks)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Active Goal Filter Pill (If filtered from Dashboard) */}
      {selectedGoalId && activeFilteredGoal && (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50/60 border border-purple-200 text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-[#6b46c1] text-white flex items-center justify-center shrink-0">
              <Target className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-slate-500 text-[11px] font-medium">Showing tasks for goal: </span>
              <strong className="text-purple-950 font-bold">{activeFilteredGoal.title}</strong>
              <span className="text-slate-400 text-[10px] ml-2">
                ({filteredTasks.length} tasks)
              </span>
            </div>
          </div>

          <button
            onClick={() => onClearGoalFilter?.()}
            className="px-2.5 py-1 rounded-xl bg-white hover:bg-slate-100 border border-purple-200 text-[11px] font-bold text-purple-700 flex items-center gap-1 transition cursor-pointer shadow-2xs"
          >
            <X className="w-3 h-3" />
            <span>Show All Tasks</span>
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks by name or category..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-purple-100 text-slate-800 focus:outline-none focus:border-purple-400 focus:bg-white transition"
          />
        </div>

        {/* Priority & Status Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Priority Filter */}
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-purple-100 text-xs">
            {['ALL', 'P1', 'P2', 'P3', 'P4'].map((p) => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer text-[11px] ${
                  filterPriority === p
                    ? 'bg-[#6b46c1] text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Task List Table / Cards */}
      <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <span>Task Detail</span>
          <span>Tool & Actions</span>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No tasks match your active filters.
          </div>
        ) : (
          filteredTasks.map((task) => {
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
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 hover:border-purple-200 hover:shadow-xs transition gap-3"
              >
                {/* Left: Checkbox + Priority + Title */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => handleToggleStatus(task.id, task.status)}
                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition cursor-pointer shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 hover:border-purple-500 bg-white'
                    }`}
                  >
                    {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${priorityColors[task.priority]}`}>
                        {task.priority}
                      </span>
                      <span className={`text-xs font-bold text-slate-900 ${isCompleted ? 'line-through text-slate-400' : ''}`}>
                        {task.title}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-[11px] text-slate-400 line-clamp-1">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Category + Tool + Execution */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 hidden md:inline">
                    {task.category || 'General'}
                  </span>

                  <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">
                    {getToolDisplayName(task.toolRequired)}
                  </span>

                  <button
                    onClick={() => handleRunTool(task.id)}
                    disabled={runningTaskId === task.id || isCompleted}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer ${
                      isCompleted
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-[#6b46c1] hover:bg-[#5833a6] text-white shadow-xs'
                    }`}
                  >
                    {runningTaskId === task.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : isCompleted ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Play className="w-2.5 h-2.5 fill-current" />
                    )}
                    <span>{isCompleted ? 'Completed' : 'Run Tool'}</span>
                  </button>

                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
