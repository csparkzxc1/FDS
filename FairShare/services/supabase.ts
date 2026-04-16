import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key';

// eslint-disable-next-line no-console
if (!process.env.EXPO_PUBLIC_SUPABASE_URL) {
  console.warn(
    '[FairShare] EXPO_PUBLIC_SUPABASE_URL is not set. ' +
      'Copy .env.example to .env and fill in your Supabase project credentials.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export type SupabaseClient = typeof supabase;

// Helper: typed table helper to work around generic inference
// Use this for full type safety on queries: db('chores').select(...)
export function db(table: string) {
  return supabase.from(table as any);
}
