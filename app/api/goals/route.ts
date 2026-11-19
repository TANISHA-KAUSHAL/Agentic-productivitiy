import { NextResponse } from 'next/server';
import { readDB, writeDB, Goal, AgentLog } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { generatePlanFromGoal, generateDailySummary } from '@/lib/ai';

// 1. GET: Fetch active goal, user's tasks, summaries, and agent logs
export async function GET(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const db = readDB();
    const userGoals = db.goals.filter((g) => g.userId === userId);
    const userTasks = db.tasks.filter((t) => t.userId === userId);
    const userSummaries = db.summaries.filter((s) => s.userId === userId);
    const userLogs = db.agentLogs.filter((l) => l.userId === userId);

    // Rule for determining Active Goal:
    // 1. If an active goal has pending tasks, keep it active.
    // 2. If it's already 100% complete, switch to the most recently created goal with pending tasks.
    // 3. Otherwise, pick the most recently created goal.
    const hasPendingTasks = (gId: string) => {
      const gTasks = userTasks.filter((t) => t.goalId === gId);
      return gTasks.length > 0 && gTasks.some((t) => t.status !== 'completed');
    };

    let activeGoal = userGoals.find((g) => g.isActive && hasPendingTasks(g.id)) || null;

    if (!activeGoal) {
      activeGoal = [...userGoals].reverse().find((g) => hasPendingTasks(g.id)) || null;
    }

    if (!activeGoal) {
      activeGoal = userGoals.find((g) => g.isActive) || userGoals[userGoals.length - 1] || null;
    }

    return NextResponse.json({
      goals: userGoals,
      activeGoal,
      tasks: userTasks,
      summaries: userSummaries,
      agentLogs: userLogs,
    });
  } catch (error) {
    console.error('Fetch Goals Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 2. POST: Submit a new goal and let Gemini generate the prioritized plan
export async function POST(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const body = await req.json();
    const { goal, replaceExisting } = body;

    if (!goal || !goal.trim()) {
      return NextResponse.json({ error: 'Goal text is required.' }, { status: 400 });
    }

    const db = readDB();
    const goalId = `goal_${Date.now()}`;

    // 1. Save the new Goal (mark as active, deactivating previous goals)
    db.goals = db.goals.map((g) => (g.userId === userId ? { ...g, isActive: false } : g));

    const newGoal: Goal = {
      id: goalId,
      userId,
      title: goal.trim(),
      createdAt: new Date().toISOString(),
      isActive: true,
    };
    db.goals.push(newGoal);

    // 2. Call Gemini AI to break down the goal into prioritized tasks
    const generatedTasks = await generatePlanFromGoal(newGoal.title, userId, goalId);

    // 3. Prepend newly generated tasks (preserving existing tasks so every goal retains its history)
    db.tasks.unshift(...generatedTasks);

    // 4. Record action in Agent Logs
    const log: AgentLog = {
      id: `log_${Date.now()}`,
      userId,
      timestamp: new Date().toISOString(),
      level: 'INFO',
      source: 'GeminiPlanner',
      message: `Decomposed goal "${newGoal.title}" into ${generatedTasks.length} prioritized tasks.`,
    };
    db.agentLogs.unshift(log);

    // 5. Generate and save updated Daily Summary
    const summary = await generateDailySummary(db.tasks, userId);
    db.summaries.unshift(summary);

    // 6. Save all changes to data.json
    writeDB(db);

    return NextResponse.json({
      message: 'Goal plan generated successfully by Gemini!',
      goal: newGoal,
      tasks: db.tasks.filter((t) => t.userId === userId),
      summary,
    });
  } catch (error) {
    console.error('Goal Planning Error:', error);
    return NextResponse.json({ error: 'Failed to process goal planning' }, { status: 500 });
  }
}

// 3. PUT: Activate a specific goal
export async function PUT(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const { goalId } = await req.json();
    if (!goalId) {
      return NextResponse.json({ error: 'Goal ID required' }, { status: 400 });
    }

    const db = readDB();
    db.goals = db.goals.map((g) => {
      if (g.userId === userId) {
        return { ...g, isActive: g.id === goalId };
      }
      return g;
    });
    writeDB(db);

    return NextResponse.json({ success: true, activeGoalId: goalId });
  } catch (error) {
    console.error('Activate Goal Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
