import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inluc2did2l6aG14dmV5cXJ2aXpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzOTc3NjYsImV4cCI6MjA5ODk3Mzc2Nn0.g0P_Aq43c8iUNi0FbAmsmnNeGNpj_Mb1YhE5GTGXYmI'
  );
}
