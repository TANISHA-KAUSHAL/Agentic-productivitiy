import fs from "fs";
import path from "path";

// define the path to our data.json file
const DB_PATH = path.join(process.cwd(), "data.json");

// 1. Data Models (Typescript interfaces)
export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface Task {
  id: string;
  userId: string; // Links this task to a specific user!
  goalId?: string;
  title: string;
  description: string;
  priority: "P1" | "P2" | "P3" | "P4";
  status: "todo" | "in_progress" | "completed" | "blocked";
  category: string;
  toolRequired: string;
  estimatedMinutes: number;
  toolExecutionLog?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  isActive?: boolean;
}

export interface DailySummary {
  id: string;
  userId: string;
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

export interface AgentLog {
  id: string;
  userId: string;
  timestamp: string;
  level: "INFO" | "SUCCESS" | "WARN" | "TOOL";
  source: string;
  message: string;
}

export interface DatabaseSchema {
  users: User[];
  goals: Goal[];
  tasks: Task[];
  summaries: DailySummary[];
  agentLogs: AgentLog[];
}

// 2. Helper to read from the JSON file
export function readDB(): DatabaseSchema {
  if (!fs.existsSync(DB_PATH)) {
    const emptyDB: DatabaseSchema = {
      users: [],
      goals: [],
      tasks: [],
      summaries: [],
      agentLogs: [],
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(emptyDB, null, 2), "utf-8");
    return emptyDB;
  }
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw) as DatabaseSchema;
}
// 3. Helper to save to data.json
export function writeDB(data: DatabaseSchema): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}
