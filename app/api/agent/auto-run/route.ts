import { NextResponse } from 'next/server';
import { readDB, writeDB, AgentLog } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { executeToolForTask } from '@/lib/tools';
import { generateDailySummary } from '@/lib/ai';

// POST: Run the Autonomous Agent Loop across all pending tasks for this user
export async function POST(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = readDB();
    const pendingTasks = db.tasks.filter(
      (t) => t.userId === userId && (t.status === 'todo' || t.status === 'in_progress')
    );

    const executionResults = [];

    for (const task of pendingTasks) {
      const toolResult = await executeToolForTask(task);
      task.status = toolResult.suggestedStatus;
      task.toolExecutionLog = toolResult.output;
      task.updatedAt = new Date().toISOString();

      executionResults.push({
        taskId: task.id,
        title: task.title,
        tool: task.toolRequired,
        result: toolResult,
      });

      const log: AgentLog = {
        id: `log_${Date.now()}_${task.id}`,
        userId,
        timestamp: new Date().toISOString(),
        level: toolResult.success ? 'SUCCESS' : 'WARN',
        source: 'AutonomousLoop',
        message: `Auto-verified "${task.title}" via [${task.toolRequired}]: ${toolResult.output} -> Status: [${task.status}]`,
      };
      db.agentLogs.unshift(log);
    }

    // Generate fresh Daily Summary
    const updatedSummary = await generateDailySummary(db.tasks, userId);
    db.summaries.unshift(updatedSummary);

    writeDB(db);

    return NextResponse.json({
      message: `Autonomous Agent completed runs on ${pendingTasks.length} task(s)!`,
      processedCount: pendingTasks.length,
      results: executionResults,
      tasks: db.tasks.filter((t) => t.userId === userId),
      summary: updatedSummary,
    });
  } catch (error) {
    console.error('Agent Auto-Run Error:', error);
    return NextResponse.json({ error: 'Agent auto-run failed' }, { status: 500 });
  }
}
