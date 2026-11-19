import { NextResponse } from 'next/server';
import { readDB, writeDB, AgentLog } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { generateDailySummary } from '@/lib/ai';

// POST: Regenerate the Daily Summary on demand
export async function POST(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = readDB();
    const summary = await generateDailySummary(db.tasks, userId);

    db.summaries.unshift(summary);

    const log: AgentLog = {
      id: `log_${Date.now()}`,
      userId,
      timestamp: new Date().toISOString(),
      level: 'INFO',
      source: 'SummaryEngine',
      message: `Daily Summary regenerated: Completion Rate ${summary.completionRate}%, Productivity Score ${summary.productivityScore}/100.`,
    };
    db.agentLogs.unshift(log);

    writeDB(db);

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Summary Error:', error);
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
  }
}
