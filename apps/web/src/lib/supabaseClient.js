import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://msuvlmmwrpnqimddudfo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zdXZsbW13cnBucWltZGR1ZGZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczODI0MTYsImV4cCI6MjA5Mjk1ODQxNn0.7ag7sy2JwHTvWF8meNwEYcCg-C6h0LoescjLxs2optY';

export const supabase = createClient(supabaseUrl, supabaseKey);
