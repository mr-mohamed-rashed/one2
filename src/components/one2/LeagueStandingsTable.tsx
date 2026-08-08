import React from 'react';
import { useLeagueStandings, type StandingsTeam } from '@/hooks/useFootballData';
import { useLanguage } from '@/context/LanguageContext';
import { Trophy, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeagueStandingsTableProps {
  leagueId: number;
  season: number;
  accentColor: string;
}

export function LeagueStandingsTable({ leagueId, season, accentColor }: LeagueStandingsTableProps) {
  const { lang, dir } = useLanguage();
  const { data: standings = [], isLoading, error } = useLeagueStandings(leagueId, season);

  const isAr = lang === 'ar';

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-sm">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: accentColor }} />
      </div>
    );
  }

  if (error || standings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center backdrop-blur-sm">
        <Trophy className="mx-auto mb-3 h-10 w-10 text-white/20" />
        <h3 className={cn("font-bold text-sm text-white/70", isAr && "font-arabic")}>
          {isAr ? 'جدول الترتيب غير متوفر حالياً' : 'Standings not available'}
        </h3>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden" dir={dir}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse" dir={dir}>
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03] text-white/60 font-semibold text-xs uppercase tracking-wider">
              <th className="px-3 py-3 text-center w-10">#</th>
              <th className={cn("px-3 py-3 text-start", isAr && "font-arabic")}>{isAr ? 'الفريق' : 'Team'}</th>
              <th className="px-2 py-3 text-center w-8">P</th>
              <th className="px-2 py-3 text-center w-8">W</th>
              <th className="px-2 py-3 text-center w-8">D</th>
              <th className="px-2 py-3 text-center w-8">L</th>
              <th className="px-2 py-3 text-center w-10">GD</th>
              <th className="px-3 py-3 text-center w-12 font-bold" style={{ color: accentColor }}>PTS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {standings.map((row: StandingsTeam) => {
              const isTop = row.rank <= 4; 
              const isBottom = row.rank >= standings.length - 2; 
              
              return (
                <tr 
                  key={row.team.id} 
                  className="hover:bg-white/[0.02] transition-colors duration-150 text-white/90"
                >
                  <td className="px-3 py-3 text-center">
                    <span className={cn(
                      "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold",
                      isTop && "bg-primary/20 text-[#cda052] border border-primary/20",
                      isBottom && "bg-red-500/10 text-red-500 border border-red-500/10",
                      !isTop && !isBottom && "text-white/60"
                    )}>
                      {row.rank}
                    </span>
                  </td>
                  
                  <td className="px-3 py-3 font-semibold text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <img 
                        src={row.team.logo} 
                        alt={row.team.name}
                        className="w-5 h-5 rounded object-contain shrink-0 bg-white/5 border border-white/10 p-0.5"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://flagcdn.com/w160/un.png';
                        }}
                      />
                      <span className="truncate text-start">{row.team.name}</span>
                    </div>
                  </td>
                  
                  <td className="px-2 py-3 text-center font-mono text-xs text-white/70">{row.played}</td>
                  <td className="px-2 py-3 text-center font-mono text-xs text-white/70">{row.won}</td>
                  <td className="px-2 py-3 text-center font-mono text-xs text-white/70">{row.drawn}</td>
                  <td className="px-2 py-3 text-center font-mono text-xs text-white/70">{row.lost}</td>
                  
                  <td className={cn(
                    "px-2 py-3 text-center font-mono text-xs font-bold",
                    row.gd > 0 ? "text-emerald-500" : row.gd < 0 ? "text-red-500" : "text-white/50"
                  )}>
                    {row.gd > 0 ? `+${row.gd}` : row.gd}
                  </td>
                  
                  <td className="px-3 py-3 text-center font-mono font-black text-sm" style={{ color: accentColor }}>
                    {row.points}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
