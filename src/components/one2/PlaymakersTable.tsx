import { Trophy, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { useTopScorers } from '@/hooks/useFootballData';
import { cn } from '@/lib/utils';
import type { Scorer } from '@/lib/footballData';

const BootIcon = ({ className, rank }: { className?: string, rank: number }) => {
  const gradientId = `assist-grad-${rank}`;
  const stop1 = rank === 1 ? '#FDE68A' : rank === 2 ? '#F1F5F9' : '#FECACA'; 
  const stop2 = rank === 1 ? '#D97706' : rank === 2 ? '#64748B' : '#9A3412';
  return (
    <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={gradientId} cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor={stop1} />
          <stop offset="60%" stopColor={stop2} />
          <stop offset="100%" stopColor="#000" stopOpacity="0.6" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="8" fill={`url(#${gradientId})`} />
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14h-2v-4h2zm0-6h-2V7h2z" fill="#000" fillOpacity="0.2" />
    </svg>
  );
};

const getRankColors = (rank: number) => {
  if (rank === 1) return { text: 'text-yellow-500', badge: 'bg-gradient-to-b from-amber-100 to-yellow-300 text-amber-900 border border-yellow-300 shadow-[0_2px_10px_rgba(234,179,8,0.15)]', rowStyle: 'bg-yellow-500/5 hover:bg-yellow-500/10 border-y border-yellow-500/20 [&>td]:border-y [&>td]:border-yellow-500/20' };
  if (rank === 2) return { text: 'text-slate-300', badge: 'bg-gradient-to-b from-slate-100 to-slate-300 text-slate-900 border border-slate-300', rowStyle: 'bg-slate-400/5 hover:bg-slate-400/10 border-y border-slate-400/20 [&>td]:border-y [&>td]:border-slate-400/20' };
  if (rank === 3) return { text: 'text-amber-600', badge: 'bg-gradient-to-b from-orange-100 to-orange-300 text-orange-950 border border-orange-300', rowStyle: 'bg-orange-600/5 hover:bg-orange-600/10 border-y border-orange-600/20 [&>td]:border-y [&>td]:border-orange-600/20' };
  return { text: 'text-foreground', badge: 'bg-muted text-foreground border border-border', rowStyle: 'border-y border-border hover:bg-muted/50 [&>td]:border-y [&>td]:border-border' };
};

export function PlaymakersTable() {
  const { lang } = useLanguage();
  const { data: scorers = [], isLoading } = useTopScorers();

  // Sort by assists descending
  const playmakersList = [...scorers]
    .filter(s => s.assists > 0)
    .sort((a, b) => {
      if (b.assists !== a.assists) return b.assists - a.assists;
      return b.goals - a.goals;
    })
    .map((p, idx) => ({
      ...p,
      rank: idx + 1
    }));

  return (
    <Card className="overflow-hidden bg-gradient-card border-border flex flex-col">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-card/50">
        <div className="p-2 rounded-lg bg-emerald-500/15">
          <Trophy className="h-5 w-5 text-emerald-500" />
        </div>
        <div>
          <h3 className={cn('font-display font-extrabold text-xl', lang === 'ar' && 'font-arabic')}>
            {lang === 'ar' ? 'أفضل صانعي الأهداف - كأس العالم 2026' : 'World Cup 2026 Top Playmakers'}
          </h3>
          <p className={cn('text-xs text-muted-foreground', lang === 'ar' && 'font-arabic')}>
            {lang === 'ar' ? 'ترتيب اللاعبين حسب التمريرات الحاسمة (الأسيست)' : 'Latest tournament playmaker statistics'}
          </p>
        </div>
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-primary ms-auto" />}
      </div>

      <div className="overflow-x-auto flex-1">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-16 text-center">{lang === 'ar' ? 'الترتيب' : 'Rank'}</TableHead>
              <TableHead className={lang === 'ar' ? 'font-arabic' : ''}>{lang === 'ar' ? 'اللاعب' : 'Player'}</TableHead>
              <TableHead className={cn('hidden md:table-cell', lang === 'ar' && 'font-arabic')}>{lang === 'ar' ? 'المنتخب' : 'Team'}</TableHead>
              <TableHead className="text-center">{lang === 'ar' ? 'صنع أهداف' : 'Assists'}</TableHead>
              <TableHead className="text-center hidden sm:table-cell">{lang === 'ar' ? 'سجل أهداف' : 'Goals'}</TableHead>
              <TableHead className="text-center hidden md:table-cell">{lang === 'ar' ? 'مباريات' : 'Matches'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && Array.from({ length: 7 }).map((_, index) => (
              <TableRow key={index} className="border-border">
                <TableCell colSpan={6}>
                  <div className="h-8 bg-muted rounded animate-pulse" />
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && playmakersList.map((scorer: Scorer) => {
              const colors = getRankColors(scorer.rank);
              const isTop3 = scorer.rank <= 3;
              return (
              <TableRow
                key={scorer.name}
                className={cn(
                  'transition-colors',
                  colors.rowStyle
                )}
              >
                <TableCell>
                  <div 
                    className={cn(
                      'w-8 h-9 flex items-center justify-center text-sm font-bold font-display relative mx-auto',
                      colors.badge
                    )}
                    style={isTop3 ? {
                      clipPath: 'polygon(0 0, 100% 0, 100% 75%, 50% 100%, 0 75%)',
                      paddingBottom: '4px'
                    } : { borderRadius: '6px' }}
                  >
                    {isTop3 ? `#${scorer.rank}` : scorer.rank}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div>
                      <div className={cn('font-bold text-sm flex items-center gap-2', isTop3 && colors.text)}>
                        {scorer.name}
                        {isTop3 && <BootIcon className="w-5 h-5 drop-shadow-md" rank={scorer.rank} />}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground md:hidden mt-0.5">
                        {scorer.country?.flag && (
                          <img 
                            src={scorer.country.flag} 
                            alt={scorer.club} 
                            className="w-4.5 h-3 object-cover rounded-sm border border-border/40"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://flagcdn.com/w160/un.png';
                            }}
                          />
                        )}
                        <span>{scorer.club}</span>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    {scorer.country?.flag && (
                      <img 
                        src={scorer.country.flag} 
                        alt={scorer.club} 
                        className="w-5 h-3.5 object-cover rounded-sm border border-border/40"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://flagcdn.com/w160/un.png';
                        }}
                      />
                    )}
                    <span>{scorer.club}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <span className={cn(
                    'inline-flex items-center justify-center min-w-8 h-7 px-2 rounded-md font-display font-extrabold tabular-nums',
                    scorer.assists > 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-muted text-muted-foreground',
                  )}>
                    {scorer.assists}
                  </span>
                </TableCell>
                <TableCell className="text-center hidden sm:table-cell font-semibold tabular-nums text-muted-foreground">
                  {scorer.goals}
                </TableCell>
                <TableCell className="text-center hidden md:table-cell text-muted-foreground tabular-nums">
                  {scorer.matches}
                </TableCell>
              </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
