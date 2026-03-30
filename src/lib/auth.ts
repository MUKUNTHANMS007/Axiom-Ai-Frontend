import { supabase } from './supabase';

/**
 * Standard utility to retrieve the current user's identification.
 * It prioritizes official Supabase Auth but handles fallback to 
 * custom Vibe sessions from localStorage.
 */
export async function getUserId(): Promise<string | null> {
  try {
    // 1. Try Local Vibe Session first (most reliable for custom DB keyed by Username)
    const localSession = localStorage.getItem("vibe_session");
    if (localSession) {
      const parsed = JSON.parse(localSession);
      const vibeUser = parsed.user;
      
      // Prefer Username as it's the primary key in the explorations table
      const id = vibeUser?.name || vibeUser?.['User Name'] || vibeUser?.id;
      if (id) return id;
    }

    // 2. Fallback to Supabase Auth UUID
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) return user.id;
  } catch (err) {
    console.error("Critical Failure: Identity resolution failed.", err);
  }
  
  return null;
}
