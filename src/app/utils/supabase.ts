/// <reference types="vite/client" />
import { createClient } from "@supabase/supabase-js";

// Vite's import.meta.env needs a project restart to pick up NEW .env files.
// Adding these as hardcoded fallbacks to fix the current white screen.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://sqflrnnakxxwhuwtqvkz.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_x3IYCmzY9JBITmwSX7_zjw_He3QpEnY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


