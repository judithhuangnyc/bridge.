import { createClient } from "@supabase/supabase-js";

// Replace these values with your Supabase project settings before enabling auth/data.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "YOUR_SUPABASE_URL";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "YOUR_SUPABASE_ANON_KEY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
