/**
 * Shared TypeScript types for the GAMA authentication system.
 * Uses Supabase Auth as the identity provider.
 */

import type { User, Session } from '@supabase/supabase-js';

// ─── Auth User ──────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  fullName?: string | null;
  avatarUrl?: string | null;
}

// ─── Auth Context ────────────────────────────────────────────────────────────

export interface AuthContextType {
  /** The raw Supabase User object, null when not authenticated */
  currentUser: User | null;
  /** The active Supabase session, null when not authenticated */
  session: Session | null;
  /** True while initial session is being loaded */
  loading: boolean;
  /** Whether the current user's email has been confirmed */
  isEmailVerified: boolean;
  /** Sign in with email + password */
  login: (email: string, password: string) => Promise<void>;
  /** Sign out and clear session */
  logout: () => Promise<void>;
  /** Create a new Supabase Auth account */
  signup: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<void>;
  /** Resend the email verification link/OTP */
  resendVerification: (email?: string) => Promise<void>;
  /** Force-refresh the current session token */
  refreshSession: () => Promise<void>;
}

// ─── Register Form ───────────────────────────────────────────────────────────

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  username: string;
  dob: string;
  gender: string;
  height: string;
  weight: string;
  primaryGoal: string;
}

// ─── Complete Profile Payload ─────────────────────────────────────────────────

export interface CompleteProfilePayload {
  email: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  dob?: string;
  gender?: string;
  height?: string;
  weight?: string;
  primaryGoal?: string;
}
