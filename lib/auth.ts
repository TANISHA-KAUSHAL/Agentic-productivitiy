import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"

const JWT_SECRET = 'ai-productivity-session-secret-key-2026';

export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}

// generate a JWT TOKEN 
export function generateSessionToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, {  expiresIn: '7d' });
}
// verify the jwt token and get the userid back
export function verifySessionToken(token: string): string | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        return decoded.userId;
    } catch {
        return null;
    }
}

// Extract and verify userId directly from the incoming Request headers
export function getUserIdFromRequest(req: Request): string | null {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;

  // The header looks like: "Bearer eyJhbGciOi..."
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  const token = parts[1];
  return verifySessionToken(token); // Returns the verified userId or null
}