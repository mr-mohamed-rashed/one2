import React, { useMemo, useState } from 'react';
import { useLeagueAllFixtures } from '@/hooks/useFootballData';
import { useLanguage } from '@/context/LanguageContext';
import { MatchCard } from './MatchCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Radio, Calendar, CheckCircle2, ChevronLeft, ChevronRight, Loader2, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Match } from '@/lib/footballData';

interface LeagueMatchCenterProps {
  leagueId: number;
  season: number;
  accentColor: string;
}

const PAGE_SIZE = 3;

export function LeagueMatchCenter({ leagueId, season, accentColor }: LeagueMatchCenterProps) {
  const { lang, dir } = useLanguage();
  const { data: fixtures = [], isLoading } = useLeagueAllFixtures(leagueId, season);
  const [pages, setPages] = useState({ live: 1, fixtures: 1, results: 1 });

  const isAr = lang === 'ar';

  // Filter fixtures by status
  const live = useMemo(() => fixtures.filter((m) => m.status === 'live'), [fixtures]);
  
  const upcoming = useMemo(() => 
    fixtures
      .filter((m) => m.status === 'upcoming')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()), 
    [fixtures]
  );
  
  const finished = useMemo(() => 
    fixtures
      .filter((m) => m.status === 'finished')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), 
    [fixtures]
  );

  const setTabPage = (tab: keyof typeof pages, page: number) => {
    setPages((current) => ({ ...current, [tab]: page }));
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-sm">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: accentColor }} />
      </div>
    );
  }

  return (
    <Tabs defaultValue="fixtures" className="w-full" dir={dir}>
      <TabsList className="bg-card border border-border h-auto p-1 grid grid-cols-3 w-full max-w-md">
        <TabsTrigger
          value="live"
          className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-neon font-semibold text-xs sm:text-sm"
        >
          <Radio className="h-4 w-4" />
          <span className={isAr ? 'font-arabic' : ''}>{isAr ? 'مباشر' : 'Live'}</span>
          <span className="text-xs opacity-70">({live.length})</span>
        </TabsTrigger>
        <TabsTrigger 
          value="fixtures" 
          className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-neon font-semibold text-xs sm:text-sm"
        >
          <Calendar className="h-4 w-4" />
          <span className={isAr ? 'font-arabic' : ''}>{isAr ? 'المباريات' : 'Fixtures'}</span>
          <span className="text-xs opacity-70">({upcoming.length})</span>
        </TabsTrigger>
        <TabsTrigger 
          value="results" 
          className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-neon font-semibold text-xs sm:text-sm"
        >
          <CheckCircle2 className="h-4 w-4" />
          <span className={isAr ? 'font-arabic' : ''}>{isAr ? 'النتائج' : 'Results'}</span>
          <span className="text-xs opacity-70">({finished.length})</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="live" className="mt-6">
        {live.length > 0 ? (
          <PaginatedMatchGrid 
            matches={live} 
            page={pages.live} 
            onPageChange={(page) => setTabPage('live', page)} 
            lang={lang} 
          />
        ) : (
          <EmptyMatchesMessage type="live" lang={lang} />
        )}
      </TabsContent>

      <TabsContent value="fixtures" className="mt-6">
        {upcoming.length > 0 ? (
          <PaginatedMatchGrid 
            matches={upcoming} 
            page={pages.fixtures} 
            onPageChange={(page) => setTabPage('fixtures', page)} 
            lang={lang} 
          />
        ) : (
          <EmptyMatchesMessage type="fixtures" lang={lang} />
        )}
      </TabsContent>

      <TabsContent value="results" className="mt-6">
        {finished.length > 0 ? (
          <PaginatedMatchGrid 
            matches={finished} 
            page={pages.results} 
            onPageChange={(page) => setTabPage('results', page)} 
            lang={lang} 
          />
        ) : (
          <EmptyMatchesMessage type="results" lang={lang} />
        )}
      </TabsContent>
    </Tabs>
  );
}

function EmptyMatchesMessage({ type, lang }: { type: 'live' | 'fixtures' | 'results'; lang: string }) {
  const isAr = lang === 'ar';
  return (
    <div className="rounded-lg border border-border border-dashed bg-gradient-card p-8 text-center">
      <Trophy className="mx-auto mb-4 h-10 w-10 text-[#cda052]" />
      <h3 className={isAr ? 'font-arabic font-bold text-lg text-white/90' : 'font-bold text-lg text-white/90'}>
        {type === 'live'
          ? (isAr ? 'لا توجد مباريات مباشرة حالياً' : 'No live matches right now')
          : type === 'fixtures'
          ? (isAr ? 'لا توجد مباريات قادمة حالياً' : 'No upcoming fixtures right now')
          : (isAr ? 'لا توجد نتائج مسجلة حالياً' : 'No results recorded right now')}
      </h3>
      <p className={isAr ? 'font-arabic mt-1 text-sm text-muted-foreground' : 'mt-1 text-sm text-muted-foreground'}>
        {isAr
          ? 'سيتم تحديث هذا القسم تلقائياً عند بدء أو توفر بيانات المباريات.'
          : 'This section will update automatically when match data is available.'}
      </p>
    </div>
  );
}

function PaginatedMatchGrid({
  matches,
  page,
  onPageChange,
  lang,
}: {
  matches: Match[];
  page: number;
  onPageChange: (page: number) => void;
  lang: string;
}) {
  const { dir } = useLanguage();
  const totalPages = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visibleMatches = useMemo(
    () => matches.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [matches, safePage],
  );

  const isAr = lang === 'ar';

  const goToPage = (nextPage: number) => {
    const targetPage = Math.min(Math.max(nextPage, 1), totalPages);
    onPageChange(targetPage);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visibleMatches.map((match) => (
          <MatchCard 
            key={match.id} 
            match={match} 
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-border bg-card/60 p-3">
          <div className={isAr ? 'font-arabic text-sm text-muted-foreground' : 'text-sm text-muted-foreground'}>
            {isAr
              ? `صفحة ${safePage} من ${totalPages}`
              : `Page ${safePage} of ${totalPages}`}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => goToPage(safePage - 1)}
              disabled={safePage === 1}
              className="gap-1 h-9 px-3"
            >
              {dir === 'rtl' ? <ChevronRight className="h-4 w-4 ml-1" /> : <ChevronLeft className="h-4 w-4 mr-1" />}
              {isAr ? 'السابق' : 'Prev'}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => goToPage(safePage + 1)}
              disabled={safePage === totalPages}
              className="gap-1 h-9 px-3"
            >
              {isAr ? 'التالي' : 'Next'}
              {dir === 'rtl' ? <ChevronLeft className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
