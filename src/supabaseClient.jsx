import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qosmtmrldiohcmcyklbw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvc210bXJsZGlvaGNtY3lrbGJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5MjczMTgsImV4cCI6MjA1MDUwMzMxOH0.MeGCJFy7iwVbADdWDE5lJSq_8EstIpuKrVhcIWBWv10';

export const supabase = createClient(supabaseUrl, supabaseKey); 