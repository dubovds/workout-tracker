import { createClient, SupabaseClient } from '@supabase/supabase-js';

function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    throw new Error(
      `Missing required environment variable: ${key}. Please check your .env.local file.`
    );
  }
  return value.trim();
}

function validateUrl(url: string, key: string): void {
  try {
    const urlObj = new URL(url);
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      throw new Error(`Invalid protocol: ${urlObj.protocol}`);
    }
  } catch (error) {
    throw new Error(
      `Invalid ${key}: "${url}" is not a valid HTTP or HTTPS URL. Please check your .env.local file.`
    );
  }
}

let supabaseInstance: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
    validateUrl(supabaseUrl, 'NEXT_PUBLIC_SUPABASE_URL');
    const supabaseAnonKey = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
}

export const supabase = getSupabase();
