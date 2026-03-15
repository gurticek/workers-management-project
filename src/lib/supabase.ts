import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jertmzmngcocfzvprvsb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplcnRtem1uZ2NvY2Z6dnBydnNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MzM3NzMsImV4cCI6MjA4OTEwOTc3M30.TIs0mzZxx3MOWbAKz2j15NlQJ7SjAgksJEVNXDN2LmM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
