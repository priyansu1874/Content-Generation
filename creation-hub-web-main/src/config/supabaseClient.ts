import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wvpxohkscgjwrykpxnoj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2cHhvaGtzY2dqd3J5a3B4bm9qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTcyODM3NiwiZXhwIjoyMDY1MzA0Mzc2fQ._S2AzGrYK1ZAU6EJDHC8ZJ1g0Ql1TxvXp6fPxnIAOk0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);