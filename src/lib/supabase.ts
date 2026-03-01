import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://nxzhlwpnvycesrietxuz.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54emhsd3BudnljZXNyaWV0eHV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyOTYyNzcsImV4cCI6MjA4Nzg3MjI3N30.9IKiF1cQG8zekaYh3O7t2LDvO1eODP6ov27CWpaJCVo";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
