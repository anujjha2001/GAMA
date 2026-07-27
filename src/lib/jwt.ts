import { type NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'gama-super-secret-key-change-in-production-12345';

export interface DecodedToken {
  id: string;
  email: string;
  fullName: string;
  emailVerified: boolean;
}

export async function verifyToken(req: NextRequest): Promise<DecodedToken | null> {
  const authCookie = req.cookies.get('gama_session');
  if (!authCookie || !authCookie.value) return null;

  try {
    const decoded = jwt.verify(authCookie.value, JWT_SECRET) as DecodedToken;
    return decoded;
  } catch (error) {
    return null;
  }
}

export function signToken(payload: DecodedToken): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
}
