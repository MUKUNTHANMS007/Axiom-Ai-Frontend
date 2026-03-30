import { supabase } from './supabase';

/**
 * Standard utility to retrieve the current user's identification.
 * It prioritizes official Supabase Auth but handles fallback to 
 * custom Vibe sessions from localStorage.
 */
export async function getUserId(): Promise<string | null> {
  try {
    // 1. Try Supabase Auth first
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) return user.id;

    // 2. Fallback to Local Vibe Session
    const localSession = localStorage.getItem("vibe_session");
    if (localSession) {
      const parsed = JSON.parse(localSession);
      const vibeUser = parsed.user;
      
      // Some parts of the system use the 'User Name' as the key
      // and others use 'id'. This handles both gracefully.
      return vibeUser?.['User Name'] || vibeUser?.id || null;
    }
  } catch (err) {
    console.error("Critical Failure: Identity resolution failed.", err);
  }
  
  return null;
}
