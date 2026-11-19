'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Sparkles,
  Trophy,
  CheckCircle2,
  Calendar,
  Lightbulb,
  Loader2,
  RefreshCw,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface DailySummary {
  id: string;
  date: string;
  completionRate: number;
  totalTasks: number;
  completedTasks: number;
  productivityScore: number;
  highlights: string[];
  blockers: string;
  aiRecommendation: string;
  generatedAt: string;
}

interface SummaryViewProps {
  user: { id: string; name: string; email: string };
  token: string;
}

export default function SummaryView({ user, token }: SummaryViewProps) {
  const [summaries, setSummaries] = useState<DailySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchSummaries = async () => {
    try {
      const res = await fetch('/api/goals', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch summaries');
      const data = await res.json();
      setSummaries(data.summaries || []);
    } catch (err) {
      console.error('Fetch summaries error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummaries();
  }, [token]);

  const handleGenerateSummary = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/summary', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        await fetchSummaries();
      }
    } catch (err) {
      console.error('Generate summary error:', err);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  const latestSummary = summaries[0];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-purple-600" />
            <span>Daily Summaries & Insights</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            AI-synthesized reflections, completion velocity metrics, and productivity coaching.
          </p>
        </div>

        <button
          onClick={handleGenerateSummary}
          disabled={generating}
          className="self-start sm:self-auto px-4 py-2.5 rounded-2xl bg-[#6b46c1] hover:bg-[#5833a6] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-purple-600/20 transition cursor-pointer disabled:opacity-50"
        >
          {generating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          <span>{generating ? 'Synthesizing...' : 'Generate New Summary'}</span>
        </button>
      </div>

      {/* Latest Summary Spotlight */}
      {latestSummary && (
        <div className="bg-gradient-to-br from-white to-purple-50/40 rounded-3xl p-6 sm:p-8 border border-purple-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/30">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Latest Daily Report ({latestSummary.date})
                </h2>
                <p className="text-xs text-slate-500">
                  Productivity Score: <strong className="text-purple-700">{latestSummary.productivityScore}/100</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-2xl font-black text-slate-900">
                  {latestSummary.completionRate}%
                </p>
                <p className="text-[11px] text-slate-500 font-medium">Completion Rate</p>
              </div>
              <div className="text-right border-l border-purple-100 pl-4">
                <p className="text-2xl font-black text-purple-700">
                  {latestSummary.completedTasks} / {latestSummary.totalTasks}
                </p>
                <p className="text-[11px] text-slate-500 font-medium">Tasks Closed</p>
              </div>
            </div>
          </div>

          {/* Highlights & AI Coaching */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Highlights */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Key Highlights</span>
              </h3>
              {latestSummary.highlights && latestSummary.highlights.length > 0 ? (
                <ul className="space-y-2">
                  {latestSummary.highlights.map((h, i) => (
                    <li
                      key={i}
                      className="text-xs text-slate-700 bg-white/80 p-3 rounded-xl border border-purple-100/60 leading-relaxed"
                    >
                      • {h}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400 italic">No specific milestones completed yet today.</p>
              )}
            </div>

            {/* AI Recommendation */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>Gemini 2.5 Coach Advice</span>
              </h3>
              <div className="bg-[#fbf9ff] border border-purple-200/80 rounded-2xl p-4 text-xs text-purple-950 leading-relaxed shadow-2xs">
                {latestSummary.aiRecommendation || 'Focus on your core priorities to drive steady execution.'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Historical Summaries List */}
      <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
          Previous Summaries History ({summaries.length})
        </h3>

        {summaries.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-400">
            No summary reports generated yet. Click "Generate New Summary" above!
          </div>
        ) : (
          <div className="space-y-3">
            {summaries.map((s) => (
              <div
                key={s.id}
                className="p-4 rounded-2xl border border-slate-100 hover:border-purple-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{s.date}</h4>
                    <p className="text-[11px] text-slate-500">
                      Score: <strong className="text-purple-600">{s.productivityScore}</strong> • {s.completedTasks}/{s.totalTasks} tasks completed ({s.completionRate}%)
                    </p>
                  </div>
                </div>

                <div className="text-xs text-slate-600 max-w-md italic line-clamp-1">
                  "{s.aiRecommendation}"
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
