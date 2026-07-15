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

  const { data } = await supabase.from('site_settings').select('*').eq('key', 'tournament_bracket').single();
  let bracket = JSON.parse(data.value_en);
  
  bracket.matches['m29'].team1Id = 'ENG';
  bracket.matches['m29'].team2Id = 'ARG';
  bracket.matches['m29'].score1 = null;
  bracket.matches['m29'].score2 = null;
  bracket.matches['m29'].winnerId = null;

  bracket.matches['m30'].team1Id = 'FRA';
  bracket.matches['m30'].team2Id = 'ESP';
  bracket.matches['m30'].score1 = null;
  bracket.matches['m30'].score2 = null;
  bracket.matches['m30'].winnerId = null;

  bracket.matches['m31'].team1Id = null;
  bracket.matches['m31'].team2Id = null;
  bracket.matches['m31'].score1 = null;
  bracket.matches['m31'].score2 = null;
  bracket.matches['m31'].winnerId = null;

  if (bracket.matches['m32']) {
    bracket.matches['m32'].team1Id = null;
    bracket.matches['m32'].team2Id = null;
    bracket.matches['m32'].score1 = null;
    bracket.matches['m32'].score2 = null;
    bracket.matches['m32'].winnerId = null;
  }

  await supabase.from('site_settings').update({
    value_en: JSON.stringify(bracket),
    value_ar: JSON.stringify(bracket)
  }).eq('key', 'tournament_bracket');
}
run();
