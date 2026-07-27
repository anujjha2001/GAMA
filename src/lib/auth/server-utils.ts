/**
 * Server-side authentication utilities.
 * Import these only in Server Components, API routes, or server actions.
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import type { CompleteProfilePayload } from '@/lib/auth/types';

// ─── Get Server Session ───────────────────────────────────────────────────────

/**
 * Returns the Supabase user from the server-side session, or null.
 * Does NOT redirect — use requireAuth() for protected routes.
 */
export async function getServerUser() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
  } catch {
    return null;
  }
}

// ─── Require Auth ─────────────────────────────────────────────────────────────

/**
 * Redirects to /login if there is no valid session.
 * Use in Server Components for protected pages.
 */
export async function requireAuth() {
  const user = await getServerUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}

// ─── Require Email Verified ───────────────────────────────────────────────────

/**
 * Redirects to /auth/verify if the user's email is not confirmed.
 * Use after requireAuth().
 */
export async function requireEmailVerified(user: { email?: string | null; email_confirmed_at?: string | null }) {
  if (!user.email_confirmed_at) {
    const email = user.email ? `?email=${encodeURIComponent(user.email)}` : '';
    redirect(`/auth/verify${email}`);
  }
}

// ─── Ensure User Profile ──────────────────────────────────────────────────────

/**
 * Creates the Prisma UserProfile for a Supabase user if it does not exist.
 * Safe to call multiple times — never creates duplicates.
 */
export async function ensureUserProfile(payload: {
  supabaseId: string;
  email: string;
  fullName?: string | null;
  completeProfile?: CompleteProfilePayload;
}) {
  const { supabaseId, email, fullName, completeProfile } = payload;
  const emailNormalized = email.toLowerCase().trim();

  // Try finding by userId (Supabase UID) first
  let profile = await prisma.userProfile.findFirst({
    where: { userId: supabaseId },
  });

  if (profile) {
    // Profile already exists, nothing to do
    return profile;
  }

  // Check if a profile with this email already exists (from old system)
  const existingByEmail = await prisma.userProfile.findUnique({
    where: { email: emailNormalized },
  });

  if (existingByEmail) {
    // Link existing profile to Supabase UID if not already linked
    if (!existingByEmail.userId || existingByEmail.userId !== supabaseId) {
      profile = await prisma.userProfile.update({
        where: { id: existingByEmail.id },
        data: { userId: supabaseId },
      });
    } else {
      profile = existingByEmail;
    }
    return profile;
  }

  // Check username uniqueness if provided
  if (completeProfile?.username) {
    const existingUsername = await prisma.userPreference.findFirst({
      where: {
        category: 'username',
        value: { equals: completeProfile.username.trim(), mode: 'insensitive' },
      },
    });
    if (existingUsername) {
      throw new Error('Username is already taken. Please choose another one.');
    }
  }

  // Create new profile
  const computedFullName =
    fullName ||
    completeProfile?.fullName ||
    (completeProfile?.firstName && completeProfile?.lastName
      ? `${completeProfile.firstName} ${completeProfile.lastName}`
      : emailNormalized.split('@')[0]);

  profile = await prisma.userProfile.create({
    data: {
      userId: supabaseId,
      email: emailNormalized,
      fullName: computedFullName,
      role: 'user',
      settings: {
        create: {
          theme: 'dark',
          notifications: true,
          language: 'en',
        },
      },
      ...(completeProfile
        ? {
            preferences: {
              create: [
                { category: 'gender', value: completeProfile.gender || 'other' },
                { category: 'dob', value: completeProfile.dob || '' },
                { category: 'height', value: completeProfile.height?.toString() || '' },
                { category: 'weight', value: completeProfile.weight?.toString() || '' },
                { category: 'username', value: completeProfile.username || '' },
                { category: 'primaryGoal', value: completeProfile.primaryGoal || 'fitness' },
              ],
            },
          }
        : {}),
    },
  });

  return profile;
}
