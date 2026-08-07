import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAllLiveFixtures } from '@/hooks/useFootballData';
import { useLanguage } from '@/context/LanguageContext';
import { ChevronLeft, ChevronRight, Play, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LiveMatchesRow() {
  const { lang, dir } = useLanguage();
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { data: matches = [], isLoading } = useAllLiveFixtures();

  const isAr = lang === 'ar';

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 relative z-10" dir={dir}>
        <div className="flex items-center justify-between mb-4">
          <div className="h-8 w-48 bg-white/10 rounded animate-pulse" />
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="min-w-[290px] sm:min-w-[340px] h-[160px] bg-white/5 border border-white/10 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const hasMatches = matches && matches.length > 0;

  return (
    <div className="container mx-auto px-4 py-8 relative z-10" dir={dir}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className={cn(
              "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
              hasMatches ? "bg-red-500" : "bg-emerald-500"
            )}></span>
            <span className={cn(
              "relative inline-flex rounded-full h-3 w-3",
              hasMatches ? "bg-red-600" : "bg-emerald-600"
            )}></span>
          </div>
          <div>
            <h2 className={cn(
              "font-display font-extrabold text-xl sm:text-2xl text-white tracking-wide flex items-center gap-2",
              isAr && "font-arabic"
            )}>
              {isAr ? 'المباريات المباشرة الآن' : 'Live Matches Now'}
            </h2>
            <p className={cn(
              "text-xs sm:text-sm text-foreground/60 mt-0.5",
              isAr && "font-arabic"
            )}>
              {isAr ? 'تابع نتائج المباريات الجارية حالياً في جميع الدوريات' : 'Follow real-time scores for matches currently in progress'}
            </p>
          </div>
        </div>

        {hasMatches && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll(dir === 'rtl' ? 'right' : 'left')}
              className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-primary/50 text-white/70 hover:text-white transition-all"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll(dir === 'rtl' ? 'left' : 'right')}
              className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-primary/50 text-white/70 hover:text-white transition-all"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {!hasMatches ? (
        <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center backdrop-blur-sm">
          <Radio className="mx-auto mb-3 h-10 w-10 text-emerald-500/70 animate-pulse" />
          <h3 className={cn("font-bold text-lg text-white/80", isAr && "font-arabic")}>
            {isAr ? 'لا توجد مباريات مباشرة حالياً' : 'No matches live right now'}
          </h3>
          <p className={cn("mt-1 text-sm text-white/50 max-w-md mx-auto", isAr && "font-arabic")}>
            {isAr 
              ? 'جميع المباريات حالياً في حالة انتظار أو انتهت. تابعنا لتغطية مباشرة بمجرد بدء المباريات.' 
              : 'All matches are currently scheduled or finished. Check back once kickoff begins.'}
          </p>
        </div>
      ) : (
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {matches.map((match) => {
            const isMatchLive = match.status === 'live';
            return (
              <div
                key={match.id}
                onClick={() => navigate('/live')}
                className="min-w-[290px] sm:min-w-[340px] max-w-[340px] snap-start shrink-0 rounded-xl border border-white/10 bg-gradient-to-br from-[#121824] to-[#0d121c] p-4 hover:border-primary/40 hover:shadow-[0_0_20px_rgba(205,160,82,0.15)] transition-all duration-300 cursor-pointer group flex flex-col justify-between"
              >
                {/* Competition Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
                  <span className="text-[10px] sm:text-xs font-semibold text-[#cda052] uppercase tracking-wider truncate max-w-[180px]">
                    {match.competition}
                  </span>
                  
                  {isMatchLive && (
                    <span className="flex items-center gap-1.5 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-500 border border-red-500/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                      {match.minute || (isAr ? 'مباشر' : 'LIVE')}
                    </span>
                  )}
                </div>

                {/* Match Scoreboard */}
                <div className="flex flex-col gap-3 py-1">
                  {/* Home Team */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={match.home.flag}
                        alt={match.home.name}
                        className="w-6 h-6 rounded-md object-cover bg-white/5 border border-white/10 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://flagcdn.com/w160/un.png';
                        }}
                      />
                      <span className={cn(
                        "font-bold text-sm text-white/90 truncate group-hover:text-[#FFD700] transition-colors",
                        isAr && "font-arabic"
                      )}>
                        {match.home.name}
                      </span>
                    </div>
                    <span className="font-mono font-black text-lg text-white">
                      {match.homeScore}
                    </span>
                  </div>

                  {/* Away Team */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={match.away.flag}
                        alt={match.away.name}
                        className="w-6 h-6 rounded-md object-cover bg-white/5 border border-white/10 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://flagcdn.com/w160/un.png';
                        }}
                      />
                      <span className={cn(
                        "font-bold text-sm text-white/90 truncate group-hover:text-[#FFD700] transition-colors",
                        isAr && "font-arabic"
                      )}>
                        {match.away.name}
                      </span>
                    </div>
                    <span className="font-mono font-black text-lg text-white">
                      {match.awayScore}
                    </span>
                  </div>
                </div>

                {/* Watch Indicator */}
                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-white/40 group-hover:text-white/60 transition-colors">
                  <span className={isAr ? "font-arabic truncate max-w-[150px]" : "truncate max-w-[150px]"}>
                    {match.venue || (isAr ? 'شاهد التفاصيل' : 'View Details')}
                  </span>
                  <div className="flex items-center gap-1 text-[#cda052]">
                    <span className={cn("font-semibold", isAr && "font-arabic")}>{isAr ? 'شاهد الآن' : 'Watch Live'}</span>
                    <Play className="h-2.5 w-2.5 fill-current" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
