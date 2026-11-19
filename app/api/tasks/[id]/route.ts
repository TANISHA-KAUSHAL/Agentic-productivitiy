import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { generateDailySummary } from '@/lib/ai';

// 1. PUT: Update a task's status or details
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const db = readDB();

    const taskIndex = db.tasks.findIndex((t) => t.id === id && t.userId === userId);
    if (taskIndex === -1) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Update allowed fields
    db.tasks[taskIndex] = {
      ...db.tasks[taskIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    // Recalculate daily summary
    const summary = await generateDailySummary(db.tasks, userId);
    db.summaries.unshift(summary);

    writeDB(db);

    return NextResponse.json(db.tasks[taskIndex]);
  } catch (error) {
    console.error('Update Task Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 2. DELETE: Delete a task
export async function DELETE(
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

    db.tasks = db.tasks.filter((t) => !(t.id === id && t.userId === userId));

    const summary = await generateDailySummary(db.tasks, userId);
    db.summaries.unshift(summary);

    writeDB(db);

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete Task Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
