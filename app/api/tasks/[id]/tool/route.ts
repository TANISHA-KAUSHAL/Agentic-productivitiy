import { NextResponse } from 'next/server';
import { readDB, writeDB, AgentLog } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { executeToolForTask } from '@/lib/tools';
import { generateDailySummary } from '@/lib/ai';

// POST: Execute the assigned autonomous tool on a specific task
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const db = readDB();

    const task = db.tasks.find((t) => t.id === id && t.userId === userId);
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // 1. Record start in Agent Logs
    const startLog: AgentLog = {
      id: `log_${Date.now()}_start`,
      userId,
      timestamp: new Date().toISOString(),
      level: 'TOOL',
      source: 'AutonomousAgent',
      message: `Executing tool [${task.toolRequired}] for task "${task.title}"...`,
    };
    db.agentLogs.unshift(startLog);

    // 2. Execute the tool
    const toolResult = await executeToolForTask(task);

    // 3. Update task status and tool execution log
    task.status = toolResult.suggestedStatus;
    task.toolExecutionLog = toolResult.output;
    task.updatedAt = new Date().toISOString();

    // 4. Record result in Agent Logs
    const doneLog: AgentLog = {
      id: `log_${Date.now()}_done`,
      userId,
      timestamp: new Date().toISOString(),
      level: toolResult.success ? 'SUCCESS' : 'WARN',
      source: 'ToolRunner',
      message: `Tool [${task.toolRequired}] output: "${toolResult.output}" -> Status set to [${task.status}]`,
    };
    db.agentLogs.unshift(doneLog);

    // 5. Update Daily Summary
    const updatedSummary = await generateDailySummary(db.tasks, userId);
    db.summaries.unshift(updatedSummary);

    // 6. Save to data.json
    writeDB(db);

    return NextResponse.json({
      message: 'Tool executed successfully',
      task,
      toolResult,
      summary: updatedSummary,
    });
  } catch (error) {
    console.error('Execute Tool Error:', error);
    return NextResponse.json({ error: 'Failed to execute tool' }, { status: 500 });
  }
}
