import { Task, DailySummary } from '@/lib/db';

export const AVAILABLE_TOOLS = [
  'workspace_file_checker',
  'code_syntax_validator',
  'git_commit_inspector',
  'api_endpoint_verifier',
  'focus_timer_tracker',
] as const;

/**
 * Helper: Call the Gemini REST API
 */
async function callGemini(prompt: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json', // Forces Gemini to return pure JSON!
          temperature: 0.3,
        },
      }),
    });

    if (!res.ok) {
      console.warn('Gemini API call returned status:', res.status);
      return null;
    }

    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (error) {
    console.error('Error calling Gemini:', error);
    return null;
  }
}

/**
 * 1. AI Task Planner: Breaks a goal into prioritized tasks using Gemini
 */
export async function generatePlanFromGoal(
  goal: string,
  userId: string,
  goalId: string
): Promise<Task[]> {
  const now = new Date().toISOString();
  const baseId = Date.now();

  const prompt = `
You are an expert AI Personal Productivity Agent.
The user has the following daily goal: "${goal}".

Decompose this goal into 3 to 5 realistic, sequential subtasks.
For each task:
- "title": Short actionable title.
- "description": 1 sentence explanation of what needs to be done.
- "priority": Exactly one of "P1", "P2", "P3", or "P4" (P1=Urgent/Critical, P2=High, P3=Medium, P4=Low).
- "category": e.g. "Planning", "Development", "Testing", "Documentation", "Operations".
- "toolRequired": Exactly one of ["workspace_file_checker", "code_syntax_validator", "git_commit_inspector", "api_endpoint_verifier", "focus_timer_tracker"].
- "estimatedMinutes": Realistic integer duration in minutes (e.g. 20, 30, 45, 60).

Return ONLY a JSON array with this schema:
[
  {
    "title": "...",
    "description": "...",
    "priority": "P1",
    "category": "Development",
    "toolRequired": "code_syntax_validator",
    "estimatedMinutes": 45
  }
]
`;

  const aiResponse = await callGemini(prompt);

  // If Gemini answered, parse the JSON tasks!
  if (aiResponse) {
    try {
      const parsed = JSON.parse(aiResponse);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item, index) => ({
          id: `task_${baseId}_${index + 1}`,
          userId,
          goalId,
          title: item.title || `Task ${index + 1}`,
          description: item.description || '',
          priority: ['P1', 'P2', 'P3', 'P4'].includes(item.priority) ? item.priority : 'P2',
          status: 'todo',
          category: item.category || 'General',
          toolRequired: item.toolRequired || 'workspace_file_checker',
          estimatedMinutes: Number(item.estimatedMinutes) || 30,
          toolExecutionLog: null,
          createdAt: now,
          updatedAt: now,
        }));
      }
    } catch (e) {
      console.warn('Failed to parse Gemini task plan, using fallback.', e);
    }
  }

  // Graceful Fallback if no API key or network glitch
  return [
    {
      id: `task_${baseId}_1`,
      userId,
      goalId,
      title: `Plan & Scope: "${goal.slice(0, 40)}"`,
      description: `Define key deliverables and requirements for ${goal}.`,
      priority: 'P1',
      status: 'todo',
      category: 'Planning',
      toolRequired: 'workspace_file_checker',
      estimatedMinutes: 30,
      toolExecutionLog: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `task_${baseId}_2`,
      userId,
      goalId,
      title: `Build Core Implementation`,
      description: `Execute main development logic for ${goal}.`,
      priority: 'P1',
      status: 'todo',
      category: 'Development',
      toolRequired: 'code_syntax_validator',
      estimatedMinutes: 60,
      toolExecutionLog: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `task_${baseId}_3`,
      userId,
      goalId,
      title: `Verify & Test Deliverables`,
      description: `Run automated tool checks and inspect results.`,
      priority: 'P2',
      status: 'todo',
      category: 'Testing',
      toolRequired: 'api_endpoint_verifier',
      estimatedMinutes: 45,
      toolExecutionLog: null,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

/**
 * 2. Daily Summary: Calculates progress metrics and AI insights
 */
export async function generateDailySummary(
  tasks: Task[],
  userId: string
): Promise<DailySummary> {
  const userTasks = tasks.filter((t) => t.userId === userId);
  const total = userTasks.length;
  const completed = userTasks.filter((t) => t.status === 'completed').length;
  const inProgress = userTasks.filter((t) => t.status === 'in_progress').length;
  const blocked = userTasks.filter((t) => t.status === 'blocked').length;

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const productivityScore = Math.min(
    100,
    Math.round(completed * 25 + inProgress * 10 + 20)
  );

  const highlights: string[] = [];
  if (completed > 0) {
    highlights.push(`Completed ${completed} priority task(s) through autonomous tool checks.`);
  }
  if (inProgress > 0) {
    highlights.push(`${inProgress} task(s) currently in progress.`);
  }
  if (total === 0) {
    highlights.push('No tasks scheduled today. Enter a goal to start!');
  }

  const aiRecommendation =
    completionRate >= 75
      ? 'Outstanding momentum today! High completion rate across all P1 priorities.'
      : completionRate >= 40
      ? 'Steady velocity. Focus on closing in-progress tasks before starting new ones.'
      : 'Prioritize tackling your highest-impact P1 task to kickstart velocity today.';

  // Ask Gemini to write tailored daily highlights and recommendation
  let aiHighlights = highlights;
  let aiRec = aiRecommendation;

  if (completed > 0 || inProgress > 0) {
    const taskBrief = userTasks.map(t => `- [${t.priority}] ${t.title} (${t.status})`).join('\n');
    const summaryPrompt = `
You are an expert executive productivity coach.
Review this user's task progress today:
${taskBrief}

Completion Rate: ${completionRate}% (${completed}/${total} completed).
Productivity Score: ${productivityScore}/100.

Return ONLY a JSON object:
{
  "highlights": ["highlight 1", "highlight 2"],
  "aiRecommendation": "Actionable, motivating 1-2 sentence advice for tomorrow."
}
`;
    const aiSummaryResponse = await callGemini(summaryPrompt);
    if (aiSummaryResponse) {
      try {
        const parsedSummary = JSON.parse(aiSummaryResponse);
        if (Array.isArray(parsedSummary.highlights) && parsedSummary.highlights.length > 0) {
          aiHighlights = parsedSummary.highlights;
        }
        if (parsedSummary.aiRecommendation) {
          aiRec = parsedSummary.aiRecommendation;
        }
      } catch (e) {
        // Fall back gracefully to calculated text
      }
    }
  }

  return {
    id: `summary_${Date.now()}`,
    userId,
    date: new Date().toISOString().split('T')[0],
    completionRate,
    totalTasks: total,
    completedTasks: completed,
    productivityScore,
    highlights: aiHighlights,
    blockers: blocked > 0 ? `${blocked} task(s) currently marked as blocked.` : 'No critical blockers detected.',
    aiRecommendation: aiRec,
    generatedAt: new Date().toISOString(),
  };
}