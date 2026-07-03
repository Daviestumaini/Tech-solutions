require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);
console.log(
  process.env.SUPABASE_SECRET_KEY?.startsWith("sb_secret_")
);
console.log("Using Service Key:", process.env.SUPABASE_SECRET_KEY?.startsWith("sb_secret_"));

module.exports = supabase;