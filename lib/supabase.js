const { createClient } = require("@supabase/supabase-js");

const supabase_url = process.env.SUPABASE_URL;
const anon_key = process.env.SUPABASE_ANON_KEY;

if (!supabase_url || !anon_key) {
  console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY");
}

// Admin client with service role key (bypasses RLS)
const supabase = createClient(supabase_url, anon_key, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

module.exports = supabase;
