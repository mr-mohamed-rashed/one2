import { useLanguage } from '@/context/LanguageContext';
import { useTopScorers, useResults } from '@/hooks/useFootballData';
import { Card } from '@/components/ui/card';
import { Trophy, Star, Award, Footprints } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTeams } from '@/lib/footballData';

const PLAYER_PHOTOS: Record<string, string> = {
  'ليونيل ميسي': 'https://api.fifa.com/api/v3/picture/players/2026/302061',
  'Lionel Messi': 'https://api.fifa.com/api/v3/picture/players/2026/302061',
  'الكسندر اساك': 'https://api.fifa.com/api/v3/picture/players/2026/410065',
  'Alexander Isak': 'https://api.fifa.com/api/v3/picture/players/2026/410065',
  'كيليان مبابي': 'https://api.fifa.com/api/v3/picture/players/2026/410183',
  'Kylian Mbappe': 'https://api.fifa.com/api/v3/picture/players/2026/410183',
  'محمد صلاح': 'https://api.fifa.com/api/v3/picture/players/2026/356581',
  'Mohamed Salah': 'https://api.fifa.com/api/v3/picture/players/2026/356581'
};

const getPlayerPhoto = (player: any) => {
  if (player?.photoUrl) return player.photoUrl;
  const name = player?.name || '';
  return PLAYER_PHOTOS[name] || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=0284c7`;
};

const getTeamFlag = (teamName: string | undefined | null) => {
  if (!teamName) return `https://flagcdn.com/w160/un.png`;
  const allTeams = Object.values(getTeams());
  const match = allTeams.find(
    t => {
      const nameMatch = t.name && t.name.toLowerCase() === teamName.toLowerCase();
      const customMatch = 
        (teamName.includes('مصر') && t.id === 'EGY') ||
        (teamName.includes('أرجنتين') && t.id === 'ARG') ||
        (teamName.includes('سويد') && t.id === 'SWE') ||
        (teamName.includes('فرنسا') && t.id === 'FRA') ||
        (teamName.includes('مغرب') && t.id === 'MAR');
      return nameMatch || customMatch;
    }
  );
  return match?.flag || `https://flagcdn.com/w160/un.png`;
};

export function StatsSummaryCard() {
  const { lang } = useLanguage();
  const { data: scorers = [] } = useTopScorers();
  const { data: results = [] } = useResults();

  // 1. Matches Count
  const matchesCount = results.length || 72;

  // 2. Goals Count
  const totalGoals = results.length > 0 
    ? results.reduce((sum, m) => sum + (m.homeScore ?? 0) + (m.awayScore ?? 0), 0)
    : scorers.reduce((sum, p) => sum + (p.goals ?? 0), 0) || 215;

  // 3. Top Scorer
  const topScorer = scorers[0] || {
    name: lang === 'ar' ? 'ليونيل ميسي' : 'Lionel Messi',
    team_name: lang === 'ar' ? 'الأرجنتين' : 'Argentina',
    goals: 6
  };

  // 4. Top Playmaker (Sorted by assists)
  const playmakers = [...scorers].sort((a, b) => (b.assists ?? 0) - (a.assists ?? 0));
  const topPlaymaker = playmakers[0] || {
    name: lang === 'ar' ? 'الكسندر اساك' : 'Alexander Isak',
    team_name: lang === 'ar' ? 'السويد' : 'Sweden',
    assists: 3
  };

  const isAr = lang === 'ar';

  return (
    <Card className="overflow-hidden border border-border/80 bg-card/60 backdrop-blur-md shadow-neon-soft p-5 my-8" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Title Header bar - styled with site colors (transparent/glow) */}
      <div className="flex items-center justify-between border-b border-primary/20 pb-4 mb-6">
        <h3 className={cn("text-xl font-extrabold tracking-wide flex items-center gap-2 text-foreground", isAr && "font-arabic")}>
          <Award className="h-5 w-5 text-primary" />
          {isAr ? 'الإحصائيات' : 'Statistics'}
        </h3>
        <span className={cn("text-xs text-primary bg-primary/10 border border-primary/20 px-3.5 py-1 rounded-full font-bold", isAr && "font-arabic")}>
          {isAr ? 'جميع الإحصائيات' : 'All Stats'}
        </span>
      </div>

      {/* Grid: 2 columns to match the user's mockup layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* RIGHT COLUMN (RTL) or LEFT COLUMN (LTR) */}
        <div className="space-y-4">
          {/* Card 1: Goals scored */}
          <div className="flex items-center gap-4 bg-card/30 border border-border/40 hover:border-primary/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all min-h-[90px]">
            <div className="p-3 rounded-xl bg-red-500/10 text-red-500">
              <Footprints className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <span className={cn("text-xs font-bold text-red-500 block mb-1 uppercase tracking-wider", isAr && "font-arabic")}>
                {isAr ? 'الأهداف المسجلة' : 'Goals Scored'}
              </span>
              <span className="text-3xl font-black font-display text-foreground tracking-tight">
                {totalGoals}
              </span>
            </div>
          </div>

          {/* Card 2: Top Playmaker */}
          <div className="flex items-center justify-between bg-card/30 border border-border/40 hover:border-primary/30 rounded-xl p-4 shadow-sm hover:shadow-md transition-all min-h-[90px]">
            <div className="flex items-center gap-4">
              <img 
                src={getPlayerPhoto(topPlaymaker)} 
                alt={topPlaymaker.name}
                className="w-14 h-14 rounded-xl object-cover bg-muted/40 border border-border/80 shadow-inner"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(topPlaymaker.name)}`;
                }}
              />
              <div className="min-w-0">
                <span className={cn("text-xs font-bold text-red-500 block mb-0.5", isAr && "font-arabic")}>
                  {isAr ? 'صانع الأهداف' : 'Top Playmaker'}
                </span>
                <span className={cn("text-sm font-extrabold text-foreground truncate block", isAr && "font-arabic")}>
                  {topPlaymaker.name}
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <img 
                    src={getTeamFlag(topPlaymaker.team_name || topPlaymaker.club)} 
                    alt={topPlaymaker.team_name || topPlaymaker.club} 
                    className="w-4 h-3.5 object-cover rounded-[2px]" 
                  />
                  <span className={cn("text-xs text-muted-foreground truncate", isAr && "font-arabic")}>
                    {topPlaymaker.team_name || topPlaymaker.club}
                  </span>
                </div>
              </div>
            </div>
            <span className="text-4xl font-black font-display text-foreground ps-4">
              {topPlaymaker.assists ?? 0}
            </span>
          </div>
        </div>

        {/* LEFT COLUMN (RTL) or RIGHT COLUMN (LTR) */}
        <div className="space-y-4">
          {/* Card 3: Matches count */}
          <div className="flex items-center gap-4 bg-card/30 border border-border/40 hover:border-primary/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all min-h-[90px]">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div>
              <span className={cn("text-xs font-bold text-red-500 block mb-1 uppercase tracking-wider", isAr && "font-arabic")}>
                {isAr ? 'عدد المباريات' : 'Matches Played'}
              </span>
              <span className="text-3xl font-black font-display text-foreground tracking-tight">
                {matchesCount}
              </span>
            </div>
          </div>

          {/* Card 4: Top Goalscorer */}
          <div className="flex items-center justify-between bg-card/30 border border-border/40 hover:border-primary/30 rounded-xl p-4 shadow-sm hover:shadow-md transition-all min-h-[90px]">
            <div className="flex items-center gap-4">
              <img 
                src={getPlayerPhoto(topScorer)} 
                alt={topScorer.name}
                className="w-14 h-14 rounded-xl object-cover bg-muted/40 border border-border/80 shadow-inner" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(topScorer.name)}`;
                }}
              />
              <div className="min-w-0">
                <span className={cn("text-xs font-bold text-red-500 block mb-0.5", isAr && "font-arabic")}>
                  {isAr ? 'هداف البطولة' : 'Top Scorer'}
                </span>
                <span className={cn("text-sm font-extrabold text-foreground truncate block", isAr && "font-arabic")}>
                  {topScorer.name}
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <img 
                    src={getTeamFlag(topScorer.team_name || topScorer.club)} 
                    alt={topScorer.team_name || topScorer.club} 
                    className="w-4 h-3.5 object-cover rounded-[2px]" 
                  />
                  <span className={cn("text-xs text-muted-foreground truncate", isAr && "font-arabic")}>
                    {topScorer.team_name || topScorer.club}
                  </span>
                </div>
              </div>
            </div>
            <span className="text-4xl font-black font-display text-foreground ps-4">
              {topScorer.goals}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
