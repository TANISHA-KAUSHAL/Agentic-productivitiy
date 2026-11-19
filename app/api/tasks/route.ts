import { NextResponse } from 'next/server';
import { readDB, writeDB, Task, AgentLog } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';

// 1. GET: Fetch all tasks for the logged-in user
export async function GET(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = readDB();
    const userTasks = db.tasks.filter((t) => t.userId === userId);
    return NextResponse.json({ tasks: userTasks });
  } catch (error) {
    console.error('Fetch Tasks Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 2. POST: Create a manual task
export async function POST(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, priority, category, toolRequired, estimatedMinutes } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Task title is required' }, { status: 400 });
    }

    const db = readDB();
    const now = new Date().toISOString();

    const newTask: Task = {
      id: `task_${Date.now()}`,
      userId,
      title: title.trim(),
      description: description?.trim() || '',
      priority: ['P1', 'P2', 'P3', 'P4'].includes(priority) ? priority : 'P2',
      status: 'todo',
      category: category?.trim() || 'General',
      toolRequired: toolRequired || 'workspace_file_checker',
      estimatedMinutes: Number(estimatedMinutes) || 30,
      toolExecutionLog: null,
      createdAt: now,
      updatedAt: now,
    };

    db.tasks.unshift(newTask);

    // Record in Agent Logs
    const log: AgentLog = {
      id: `log_${Date.now()}`,
      userId,
      timestamp: now,
      level: 'INFO',
      source: 'TaskEngine',
      message: `Manual task created: "${newTask.title}" [${newTask.priority}]`,
    };
    db.agentLogs.unshift(log);

    writeDB(db);

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('Create Task Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
