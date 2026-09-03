import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;

if (!url || !key) {
  throw new Error(
    "Supabase env vars are missing. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY."
  );
}

// Secret key — SOMENTE no servidor.
// Nunca utilizar NEXT_PUBLIC_ nesta chave.
export const supabaseAdmin = createClient(url, key, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});