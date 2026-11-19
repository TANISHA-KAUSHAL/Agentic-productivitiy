import { readDB, User, writeDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { generateSessionToken, hashPassword } from "@/lib/auth";
// Handles Post requests to 
// http://localhost:3000/api/auth/register
export async function POST(req: Request) {
    try {
        //1. Read the json body sent by the user
        const body = await req.json();
        const {name, email, password} = body;

        //2. Validate input fields
        if(!name || !email || !password) {
            return NextResponse.json({error: 'Name, email and password are all required.'},{status: 400} // 400 = Bad Request
            );
        }

        if(password.length < 6){
            return NextResponse.json({error: 'Password must be at least 6 characters long.'},
                {status: 400} // 400 = Bad Request
            );
        }

        //3. Load database and check if this email is already registered
        const db = readDB();
        const existingUser = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
        if(existingUser) {
            return NextResponse.json({error: 'Email is already registered.'}, {status: 409}); // 409 = Conflict
        }

        //4. Hash the password securely with bcryptjs
        const hashedPassword = await hashPassword(password)

        //5. Create the new user object
        const newUser: User = {
            id: `usr_${Date.now()}`,
            name:name.trim(),
            email:email.toLowerCase().trim(),
            passwordHash: hashedPassword,
            createdAt: new Date().toISOString()
        };

        //6. Save the new user into data.json
        db.users.push(newUser);
        writeDB(db);

         // 7. Generate a Jwt token for the user
         const token = generateSessionToken(newUser.id);

         // 8. Send back success response(Never return passwordHash!)
         return NextResponse.json({
            message: 'User resgistered successfully!',
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
            },
            token,
         },
        {status: 201} // 201 = Created
        ); 
    } catch(error) {
        console.error('Registration error: ', error)
        return NextResponse.json(
            { error: 'Internal server error'},
            {status: 500}
        );
    }
}