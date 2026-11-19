import { generateSessionToken, verifyPassword } from "@/lib/auth";
import { readDB } from "@/lib/db";
import { NextResponse } from "next/server";


// Handles Post requests to 
// http://localhost:3000/api/auth/login
export async function POST(req: Request) {
    try {
        // 1. Read email and password from the request
        const body = await req.json();
        const {email, password } = body;

        // 2. Validate input fields
        if(!email || !password){
            return NextResponse.json({error: 'Email and password are required.'}, {status: 400}); // 400 = Bad Request
        }

        // 3. Find the user by email in data.json
        const db = readDB();
        const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());

        // If user not found, return error
        if(!user) {
            return NextResponse.json({error: 'Invalid email or password.'}, {status: 401}); // 401 = Unauthorized
        }

        // 4. Verify the password with bcrypt
        const isPasswordValid = await verifyPassword(password, user.passwordHash);

        if(!isPasswordValid) {
            return NextResponse.json({error: 'Invalid email or password.'}, {status: 401}); // 401 = Unauthorized
        }

        // 5. Generate a fresh JWT token for the user
        const token = generateSessionToken(user.id);

        // 6. Send back success response
        return NextResponse.json({
            message: 'Login successful!',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
            token,
        });
    } catch(error) {
        console.error('Login error: ', error);
        return NextResponse.json({ error: 'Internal server error' }, {status: 500});
    }
}