import { createClient } from "@supabase/supabase-js";

// Create a single supabase client for interacting with your database
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL);
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_KEY as string
);
