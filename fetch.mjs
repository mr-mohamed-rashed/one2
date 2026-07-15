import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

async function run() {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  const supabaseUrlMatch = envContent.match(/VITE_SUPABASE_URL\s*=\s*(.*)/);
  const supabaseKeyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY\s*=\s*(.*)/);
  
  if (!supabaseUrlMatch || !supabaseKeyMatch) {
    process.exit(1);
  }
  
  const supabaseUrl = supabaseUrlMatch[1].replace(/['"\r]/g, '');
  const supabaseKey = supabaseKeyMatch[1].replace(/['"\r]/g, '');
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data } = await supabase.from('site_settings').select('value_en').eq('key', 'tournament_bracket').single();
  console.log(data.value_en);
}
run();
