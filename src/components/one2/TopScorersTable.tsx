import { useState } from 'react';
import { ArrowUpDown, Loader2, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLanguage } from '@/context/LanguageContext';
import { useTopScorers } from '@/hooks/useFootballData';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { Scorer } from '@/lib/footballData';

type SortKey = 'rank' | 'goals' | 'assists' | 'matches';

const BootIcon = ({ className, rank }: { className?: string, rank: number }) => {
  const gradientId = `boot-grad-${rank}`;
  const stop1 = rank === 1 ? '#FDE047' : rank === 2 ? '#E2E8F0' : '#FCA5A5'; // Light gold/silver/bronze
  const stop2 = rank === 1 ? '#D97706' : rank === 2 ? '#64748B' : '#9A3412'; // Dark gold/silver/bronze
  return (
    <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={stop1} />
          <stop offset="50%" stopColor={stop2} />
          <stop offset="100%" stopColor={stop1} />
        </linearGradient>
      </defs>
      <path d="M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1c0-1.5-1-3-2.5-3.5L14 12V7a2 2 0 0 0-4 0v2L7 11c-1.5 1-3 2.5-3 3z" fill={`url(#${gradientId})`} stroke={stop2} strokeWidth="0.5" strokeLinejoin="round"/>
      <path d="M6 20v1.5 M10 20v1.5 M14 20v1.5 M18 20v1.5" stroke={stop2} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M8 14l3-2" stroke="white" strokeOpacity="0.6" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="15" cy="15" r="1.5" fill="white" fillOpacity="0.4" />
    </svg>
  );
};

const getRankColors = (rank: number) => {
  if (rank === 1) return { 
    text: 'text-[#FFD700] drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]', 
    badge: 'bg-gradient-to-b from-[#FFF8DC] via-[#FFD700] to-[#B8860B] text-black shadow-[0_0_15px_rgba(255,215,0,0.5)] ring-1 ring-[#FFF8DC]', 
    rowStyle: 'relative z-10 bg-gradient-to-r from-[#FFD700]/10 via-[#FFD700]/5 to-transparent [&>td]:border-y-2 [&>td]:border-[#FFD700] first:[&>td]:border-l-2 first:[&>td]:rounded-l-md last:[&>td]:border-r-2 last:[&>td]:rounded-r-md shadow-[inset_0_0_20px_rgba(255,215,0,0.15)]' 
  };
  if (rank === 2) return { 
    text: 'text-[#E2E8F0] drop-shadow-[0_0_8px_rgba(226,232,240,0.5)]', 
    badge: 'bg-gradient-to-b from-[#FFFFFF] via-[#C0C0C0] to-[#808080] text-black shadow-[0_0_15px_rgba(192,192,192,0.5)] ring-1 ring-[#FFFFFF]', 
    rowStyle: 'relative z-10 bg-gradient-to-r from-[#C0C0C0]/10 via-[#C0C0C0]/5 to-transparent [&>td]:border-y-2 [&>td]:border-[#E2E8F0] first:[&>td]:border-l-2 first:[&>td]:rounded-l-md last:[&>td]:border-r-2 last:[&>td]:rounded-r-md shadow-[inset_0_0_20px_rgba(192,192,192,0.15)]' 
  };
  if (rank === 3) return { 
    text: 'text-[#CD7F32] drop-shadow-[0_0_8px_rgba(205,127,50,0.5)]', 
    badge: 'bg-gradient-to-b from-[#FFCC99] via-[#CD7F32] to-[#8B4513] text-white shadow-[0_0_15px_rgba(205,127,50,0.5)] ring-1 ring-[#FFCC99]', 
    rowStyle: 'relative z-10 bg-gradient-to-r from-[#CD7F32]/10 via-[#CD7F32]/5 to-transparent [&>td]:border-y-2 [&>td]:border-[#CD7F32] first:[&>td]:border-l-2 first:[&>td]:rounded-l-md last:[&>td]:border-r-2 last:[&>td]:rounded-r-md shadow-[inset_0_0_20px_rgba(205,127,50,0.15)]' 
  };
  return { 
    text: 'text-foreground', 
    badge: 'bg-muted text-foreground border border-border', 
    rowStyle: 'border-y border-border hover:bg-muted/50 [&>td]:border-y [&>td]:border-border' 
  };
};

export function TopScorersTable({ compact = false }: { compact?: boolean }) {
  const { lang } = useLanguage();
  const { data: scorersData, isLoading } = useTopScorers();
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [isAscending, setIsAscending] = useState(true);

  const scorers = [...(scorersData ?? [])].filter(s => s.goals > 0).sort((a, b) => {
    const first = a[sortKey] as number;
    const second = b[sortKey] as number;
    return isAscending ? first - second : second - first;
  });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setIsAscending((value) => !value);
      return;
    }
    setSortKey(key);
    setIsAscending(key === 'rank');
  };

  const SortButton = ({ sortBy, label }: { sortBy: SortKey; label: string }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => toggleSort(sortBy)}
      className="h-8 px-2 -ml-2 font-bold text-muted-foreground hover:text-primary uppercase text-xs tracking-wider"
    >
      {label}
      <ArrowUpDown className={cn('ml-1 h-3 w-3', sortKey === sortBy && 'text-primary')} />
    </Button>
  );

  const displayScorers = compact ? scorers.slice(0, 10) : scorers;

  return (
    <Card className="overflow-hidden bg-gradient-card border-border flex flex-col">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-card/50">
        <div className="p-2 rounded-lg bg-gold/15">
          <Trophy className="h-5 w-5 text-gold" />
        </div>
        <div>
          <h3 className={cn('font-display font-extrabold text-xl', lang === 'ar' && 'font-arabic')}>
            {lang === 'ar' ? 'ترتيب هدافي كأس العالم 2026' : 'World Cup 2026 Top Scorers'}
          </h3>
          <p className={cn('text-xs text-muted-foreground', lang === 'ar' && 'font-arabic')}>
            {lang === 'ar' ? 'آخر أرقام الهدافين في البطولة' : 'Latest tournament scorer numbers'}
          </p>
        </div>
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-primary ms-auto" />}
      </div>

      <div className="overflow-x-auto flex-1">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-14">
                <SortButton sortBy="rank" label="#" />
              </TableHead>
              <TableHead className={lang === 'ar' ? 'font-arabic' : ''}>{t('player', lang)}</TableHead>
              <TableHead className={cn('hidden md:table-cell', lang === 'ar' && 'font-arabic')}>{t('club', lang)}</TableHead>
              <TableHead className="text-center">
                <SortButton sortBy="goals" label={t('goals', lang)} />
              </TableHead>
              <TableHead className="text-center hidden md:table-cell">
                <SortButton sortBy="matches" label={t('matches', lang)} />
              </TableHead>
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
            {!isLoading && displayScorers.map((scorer: Scorer) => {
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
                    scorer.goals > 0 ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground',
                  )}>
                    {scorer.goals}
                  </span>
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
