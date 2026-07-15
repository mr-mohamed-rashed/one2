import { useState } from 'react';
import { ArrowUpDown, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLanguage } from '@/context/LanguageContext';
import { usePlayerCards } from '@/hooks/useFootballData';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { getCountryFlag } from '@/lib/flags';

type SortKey = 'rank' | 'red_cards' | 'yellow_cards';

const CardIcon = ({ color, count }: { color: 'red' | 'yellow', count: number }) => {
  const bgColor = color === 'red' ? 'bg-red-500' : 'bg-yellow-400';
  if (count === 0) return null;
  
  if (count === 1) {
    return <div className={`w-3 h-4 rounded-sm shadow-[0_2px_4px_rgba(0,0,0,0.2)] border border-white/20 ${bgColor}`} />;
  }
  
  return (
    <div className="relative w-4 h-4 mr-1">
      <div className={`absolute left-0 top-0 w-3 h-4 rounded-sm shadow-[0_2px_4px_rgba(0,0,0,0.2)] border border-white/20 ${bgColor} -rotate-12`} />
      <div className={`absolute left-1.5 top-0.5 w-3 h-4 rounded-sm shadow-[0_2px_4px_rgba(0,0,0,0.2)] border border-white/20 ${bgColor} rotate-6`} />
    </div>
  );
};

const getRankColors = (rank: number) => {
  if (rank === 1) return { 
    text: 'text-red-500', 
    badge: 'bg-gradient-to-b from-red-100 to-red-300 text-red-900 border border-red-300', 
    rowStyle: 'bg-red-500/5 hover:bg-red-500/10' 
  };
  return { 
    text: 'text-foreground', 
    badge: 'bg-muted text-foreground border border-border', 
    rowStyle: 'border-y border-border hover:bg-muted/50 [&>td]:border-y [&>td]:border-border' 
  };
};

export function CardsTable() {
  const { lang } = useLanguage();
  const { data: cardsData, isLoading } = usePlayerCards();
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [isAscending, setIsAscending] = useState(true);

  const players = [...(cardsData ?? [])].sort((a, b) => {
    const first = (a as any)[sortKey] as number;
    const second = (b as any)[sortKey] as number;
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

  const displayPlayers = players;

  return (
    <Card className="overflow-hidden bg-gradient-card border-border flex flex-col">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-card/50">
        <div className="p-2 rounded-lg bg-red-500/15">
          <AlertTriangle className="h-5 w-5 text-red-500" />
        </div>
        <div>
          <h3 className={cn('font-display font-extrabold text-xl', lang === 'ar' && 'font-arabic')}>
            {lang === 'ar' ? 'سجل البطاقات - كأس العالم 2026' : 'World Cup 2026 Cards Record'}
          </h3>
          <p className={cn('text-xs text-muted-foreground', lang === 'ar' && 'font-arabic')}>
            {lang === 'ar' ? 'سجل الكروت الحمراء والصفراء' : 'Red and Yellow cards records'}
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
                <SortButton sortBy="red_cards" label={t('red_cards', lang)} />
              </TableHead>
              <TableHead className="text-center hidden sm:table-cell">
                <SortButton sortBy="yellow_cards" label={t('yellow_cards', lang)} />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && Array.from({ length: 7 }).map((_, index) => (
              <TableRow key={index} className="border-border">
                <TableCell colSpan={5}>
                  <div className="h-8 bg-muted rounded animate-pulse" />
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && displayPlayers.length === 0 && (
              <TableRow className="border-border hover:bg-transparent">
                <TableCell colSpan={5} className={cn("text-center py-12 text-muted-foreground", lang === 'ar' && 'font-arabic')}>
                  {lang === 'ar' ? 'لا توجد بطاقات مسجلة حتى الآن' : 'No cards recorded yet'}
                </TableCell>
              </TableRow>
            )}
            {!isLoading && displayPlayers.map((player: any) => {
              const colors = getRankColors(player.rank);
              return (
              <TableRow
                key={player.name}
                className={cn('transition-colors', colors.rowStyle)}
              >
                <TableCell>
                  <div className={cn('w-8 h-9 flex items-center justify-center text-sm font-bold font-display relative mx-auto rounded-md', colors.badge)}>
                    {player.rank}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div>
                      <div className={cn('font-bold text-sm flex items-center gap-2', colors.text)}>
                        {player.name}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground md:hidden mt-0.5">
                        <span className="text-sm drop-shadow-sm">{getCountryFlag(player.club)}</span>
                        <span>{player.club}</span>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="text-lg drop-shadow-sm">{getCountryFlag(player.club)}</span>
                    <span>{player.club}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <span className={cn(
                    'inline-flex items-center justify-center gap-2 min-w-8 h-7 px-2 rounded-md font-display font-extrabold tabular-nums',
                    player.red_cards > 0 ? 'bg-red-500/10 text-red-500' : 'text-muted-foreground',
                  )}>
                    {player.red_cards}
                    <CardIcon color="red" count={player.red_cards} />
                  </span>
                </TableCell>
                <TableCell className="text-center hidden sm:table-cell font-semibold tabular-nums text-muted-foreground">
                  <span className={cn(
                    'inline-flex items-center justify-center gap-2 min-w-8 h-7 px-2 rounded-md font-display font-extrabold tabular-nums',
                    player.yellow_cards > 0 ? 'bg-yellow-500/10 text-yellow-500' : 'text-muted-foreground',
                  )}>
                    {player.yellow_cards}
                    <CardIcon color="yellow" count={player.yellow_cards} />
                  </span>
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
