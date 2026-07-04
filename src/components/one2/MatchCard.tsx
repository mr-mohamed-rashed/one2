import { useState, useEffect } from 'react';
import { Calendar, ExternalLink, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ReactPlayer from 'react-player/lazy';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/context/LanguageContext';
import { trackVisitEvent } from '@/hooks/useVisitTracking';
import { cn } from '@/lib/utils';
import { MatchPredictor } from './MatchPredictor';
import type { Match } from '@/lib/footballData';

interface MatchCardProps {
  match: Match;
  showCountdown?: boolean;
  onClick?: () => void;
}

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

function MiniCountdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateCountdown = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('00:00:00');
        return;
      }
      const h = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
      const s = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');
      setTimeLeft(`${h}:${m}:${s}`);
    };

    updateCountdown();
    const interval = setInterval(() => {
      if (document.hidden) return;
      updateCountdown();
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return <span>{timeLeft}</span>;
}

function TeamRow({
  team,
  isWinner,
  align,
}: {
  team: Match['home'];
  isWinner: boolean;
  align: 'left' | 'right';
}) {
  return (
    <div className={cn('flex items-center gap-2 sm:gap-3 flex-1', align === 'right' && 'flex-row-reverse text-right')}>
      <img
        src={team.flag}
        alt={team.name}
        className="w-7 h-7 sm:w-11 sm:h-11 rounded-md object-cover shadow-card ring-1 ring-border shrink-0"
      />
      <div className="min-w-0">
        <div className={cn('font-bold text-xs sm:text-base truncate', isWinner ? 'text-foreground' : 'text-foreground/70')}>
          {team.name}
        </div>
        <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider hidden sm:block">{team.shortName}</div>
      </div>
    </div>
  );
}

export function MatchCard({ match, showCountdown, onClick }: MatchCardProps) {
  const { lang } = useLanguage();
  const { user, signInWithGoogle } = useAuth();
  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';
  const isUpcoming = match.status === 'upcoming';

  const homeWin = isFinished && match.homeScore > match.awayScore;
  const awayWin = isFinished && match.awayScore > match.homeScore;
  const matchTitle = `${match.home.name} vs ${match.away.name} ${match.competition} highlights`;

  const openHighlights = async () => {
    if (!user) {
      await signInWithGoogle();
      return;
    }

    await trackVisitEvent({
      userId: user.id,
      eventType: 'match_highlight_click',
      page: '/results',
      metadata: {
        matchId: match.id,
        home: match.home.name,
        away: match.away.name,
        provider: match.highlight_url ? 'custom' : 'beIN SPORTS',
      },
    });

    const targetUrl = match.highlight_url || `https://www.youtube.com/results?search_query=${encodeURIComponent(matchTitle + ' highlights')}`;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card
      className={cn(
        'group relative overflow-hidden bg-gradient-card border-border transition-all hover:border-primary/50 hover:shadow-elevated',
        isLive && 'border-live/40 shadow-[0_0_30px_-10px_hsl(var(--live)/0.5)]',
      )}
    >
      {showCountdown && (
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
          <div 
            className="absolute left-0 top-0 bottom-0 w-1/2 bg-no-repeat bg-left bg-cover" 
            style={{ backgroundImage: `url(${match.home.flag})`, WebkitMaskImage: 'linear-gradient(to right, black 0%, transparent 80%)', filter: 'grayscale(50%)' }} 
          />
          <div 
            className="absolute right-0 top-0 bottom-0 w-1/2 bg-no-repeat bg-right bg-cover" 
            style={{ backgroundImage: `url(${match.away.flag})`, WebkitMaskImage: 'linear-gradient(to left, black 0%, transparent 80%)', filter: 'grayscale(50%)' }} 
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-40">
             <div className="text-[12rem] font-black italic tracking-tighter" style={{ WebkitTextStroke: '2px hsl(var(--primary))', color: 'transparent' }}>VS</div>
          </div>
          <div className="absolute inset-0 bg-background/50" />
        </div>
      )}

      <div className="relative z-10 flex items-center justify-between px-4 pt-3 pb-2 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="font-semibold text-primary">{match.competition}</span>
          <span className="text-border">|</span>
          <span>{match.stage}</span>
        </div>
        {isLive && (
          <Badge className="bg-live text-live-foreground gap-1.5 px-2 py-0.5 font-bold">
            <span className="w-1.5 h-1.5 bg-live-foreground rounded-full animate-pulse-live" />
            LIVE
          </Badge>
        )}
        {isFinished && (
          <Badge variant="outline" className="border-muted-foreground/40 text-muted-foreground font-bold">
            FT
          </Badge>
        )}
        {isUpcoming && (
          <Badge variant="outline" className="border-primary/40 text-primary font-bold gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(match.date)}
          </Badge>
        )}
      </div>

      <div className="relative z-10 px-2 py-3 sm:px-4 sm:py-4 flex items-center gap-1 sm:gap-4 cursor-pointer" onClick={onClick}>
        <TeamRow team={match.home} isWinner={homeWin} align="left" />

        <div className="shrink-0 px-1 sm:px-4 text-center">
          {isUpcoming ? (
            <div className="font-display font-bold text-base sm:text-2xl text-primary tabular-nums">
              {showCountdown ? <MiniCountdown targetDate={match.date} /> : formatTime(match.date)}
            </div>
          ) : (
            <div className={cn(
              "flex items-center gap-1.5 sm:gap-2 font-display font-extrabold text-xl sm:text-3xl tabular-nums",
              match.isScoreStale && "animate-pulse opacity-60"
            )}>
              <span className={cn(homeWin ? 'text-primary' : 'text-foreground')}>{match.homeScore}</span>
              <span className="text-border">-</span>
              <span className={cn(awayWin ? 'text-primary' : 'text-foreground')}>{match.awayScore}</span>
            </div>
          )}
          {isLive && match.minute && (
            <div className="text-[9px] sm:text-[10px] font-bold text-live mt-0.5 uppercase tracking-wider">{match.minute}</div>
          )}
          {isUpcoming && (
            <div className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">
               {showCountdown ? (lang === 'ar' ? 'الوقت المتبقي' : 'Time Left') : 'Kick-off'}
            </div>
          )}
        </div>

        <TeamRow team={match.away} isWinner={awayWin} align="right" />
      </div>

      {isUpcoming && (
        <div className="px-4 pb-4">
          <MatchPredictor homeTeam={match.home.name} awayTeam={match.away.name} />
        </div>
      )}

      {isFinished && (
        <div className="px-4 pb-4">
          {getYouTubeEmbedUrl(match.highlight_url || '') ? (
            <div className="aspect-video w-full overflow-hidden rounded-xl bg-black/50 ring-1 ring-border shadow-lg relative [&_.react-player\_\_preview]:rounded-xl [&_.react-player\_\_preview]:object-cover [&_iframe]:rounded-xl">
               <ReactPlayer
                  url={match.highlight_url}
                  width="100%"
                  height="100%"
                  className="absolute inset-0"
                  light={true}
                  playing={true}
                  controls={true}
                />
            </div>
          ) : match.highlight_url ? (
            <Button asChild variant="outline" className="w-full font-bold border-primary/40 text-primary hover:bg-primary/10">
              <a href={match.highlight_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 me-2" />
                {lang === 'ar' ? 'مشاهدة الملخص' : 'Watch Highlights'}
              </a>
            </Button>
          ) : (
            <Button onClick={openHighlights} variant="outline" className="w-full font-bold border-primary/40 text-primary hover:bg-primary/10">
              <ExternalLink className="h-4 w-4 me-2" />
              {lang === 'ar' ? 'بحث عن الملخص في يوتيوب' : 'Search Highlights on YouTube'}
            </Button>
          )}
        </div>
      )}

      <div className="relative z-10 border-t border-border/50 px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3 w-3" />
          <span className="truncate">{match.venue}</span>
        </div>
        <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
          {lang === 'ar' ? 'تفاصيل المباراة' : 'Match details'}
        </span>
      </div>
    </Card>
  );
}

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    if (urlObj.hostname.includes('youtube.com')) {
      const videoId = urlObj.searchParams.get('v');
      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=0` : null;
    }
    if (urlObj.hostname === 'youtu.be') {
      const videoId = urlObj.pathname.slice(1);
      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=0` : null;
    }
  } catch (e) {
    return null;
  }
  return null;
}
