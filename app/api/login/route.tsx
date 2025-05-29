import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';

// You should put this in an env var in real apps!
const SECRET_KEY = new TextEncoder().encode('your-very-secure-secret');

async function generateJWT(payload: object) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7h') // token valid for 1 hour
    .sign(SECRET_KEY);
}

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  // Dummy login validation (replace with your DB check)
  if (email === process.env.AD_EMAIL && password === process.env.AD_PASSWORD) {
    const token = await generateJWT({ email });

    const response = NextResponse.json({ success: true });

    // Set token in cookie
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true, // Secure from JS access
      secure: process.env.NODE_ENV === 'production', // Only HTTPS in prod
      path: '/',
      sameSite: 'strict',
      maxAge: 60 * 60, // 1 hour
    });

    return response;
  }

  return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
}
