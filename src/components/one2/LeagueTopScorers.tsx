import React from 'react';
import { useLeagueTopScorers, type ScorersPlayer } from '@/hooks/useFootballData';
import { useLanguage } from '@/context/LanguageContext';
import { Trophy, Loader2, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeagueTopScorersProps {
  leagueId: number;
  season: number;
  accentColor: string;
}

export function LeagueTopScorers({ leagueId, season, accentColor }: LeagueTopScorersProps) {
  const { lang, dir } = useLanguage();
  const { data: players = [], isLoading, error } = useLeagueTopScorers(leagueId, season);

  const isAr = lang === 'ar';
  const displayPlayers = players.slice(0, 10); // Display top 10

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-sm">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: accentColor }} />
      </div>
    );
  }

  if (error || players.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center backdrop-blur-sm">
        <Award className="mx-auto mb-3 h-10 w-10 text-white/20" />
        <h3 className={cn("font-bold text-sm text-white/70", isAr && "font-arabic")}>
          {isAr ? 'قائمة الهدافين غير متوفرة حالياً' : 'Top scorers list not available'}
        </h3>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden animate-fade-in" dir={dir}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse" dir={dir}>
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03] text-white/60 font-semibold text-xs uppercase tracking-wider">
              <th className="px-3 py-3 text-center w-10">#</th>
              <th className={cn("px-3 py-3 text-start", isAr && "font-arabic")}>{isAr ? 'اللاعب' : 'Player'}</th>
              <th className={cn("px-3 py-3 text-start", isAr && "font-arabic")}>{isAr ? 'النادي' : 'Club'}</th>
              <th className="px-3 py-3 text-center w-16" style={{ color: accentColor }}>{isAr ? 'الأهداف' : 'Goals'}</th>
              <th className="px-3 py-3 text-center w-16 text-white/70">{isAr ? 'التمريرات' : 'Assists'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {displayPlayers.map((player: ScorersPlayer) => {
              const isLeader = player.rank === 1;

              return (
                <tr 
                  key={player.name} 
                  className="hover:bg-white/[0.02] transition-colors duration-150 text-white/90"
                >
                  {/* Rank */}
                  <td className="px-3 py-3 text-center">
                    <span className={cn(
                      "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold",
                      isLeader ? "bg-amber-500/20 text-amber-500 border border-amber-500/20" : "text-white/60"
                    )}>
                      {player.rank}
                    </span>
                  </td>

                  {/* Player info */}
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img 
                          src={player.photo} 
                          alt={player.name}
                          className="w-8 h-8 rounded-full object-cover bg-white/5 border border-white/10"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://flagcdn.com/w160/un.png';
                          }}
                        />
                        {isLeader && (
                          <span className="absolute -top-1 -right-1 bg-amber-500 text-black rounded-full p-0.5 shadow-md">
                            <Trophy className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                      <span className="font-semibold text-xs sm:text-sm text-start truncate max-w-[120px] sm:max-w-none">{player.name}</span>
                    </div>
                  </td>

                  {/* Club */}
                  <td className="px-3 py-3 text-start">
                    <div className="flex items-center gap-2">
                      <img 
                        src={player.logo} 
                        alt={player.club}
                        className="w-5 h-5 rounded object-contain shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <span className="text-xs text-white/70 text-start truncate max-w-[100px] sm:max-w-none">{player.club}</span>
                    </div>
                  </td>

                  {/* Goals */}
                  <td className="px-3 py-3 text-center font-mono font-black text-sm" style={{ color: accentColor }}>
                    {player.goals}
                  </td>

                  {/* Assists */}
                  <td className="px-3 py-3 text-center font-mono text-xs text-white/60">
                    {player.assists}
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
