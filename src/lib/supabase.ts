import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jertmzmngcocfzvprvsb.supabase.co';
const supabaseAnonKey = 'sb_publishable_hebcWXOhDHNpqPWsCsH_jg_r8Se4dbU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
