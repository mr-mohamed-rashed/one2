import { useEffect, useState } from 'react';
import { Mic, Goal, Square, RefreshCw, AlertCircle, Zap, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getCommentary, type CommentaryEvent } from '@/lib/footballData';
import { useLanguage } from '@/context/LanguageContext';
import { useAIAgent } from '@/hooks/useAIAgent';

const typeMeta: Record<CommentaryEvent['type'], { icon: typeof Goal; ring: string; bg: string; label: string }> = {
  goal:    { icon: Goal,        ring: 'ring-primary',        bg: 'bg-primary text-primary-foreground',    label: 'GOAL' },
  yellow:  { icon: Square,      ring: 'ring-gold',           bg: 'bg-gold text-gold-foreground',           label: 'YELLOW' },
  red:     { icon: Square,      ring: 'ring-destructive',    bg: 'bg-destructive text-destructive-foreground', label: 'RED' },
  sub:     { icon: RefreshCw,   ring: 'ring-blue-400',       bg: 'bg-blue-500 text-white',                 label: 'SUB' },
  chance:  { icon: Zap,         ring: 'ring-orange-400',     bg: 'bg-orange-500 text-white',               label: 'CHANCE' },
  info:    { icon: AlertCircle, ring: 'ring-muted-foreground', bg: 'bg-muted text-muted-foreground',       label: 'INFO' },
};

// A wrapper component to fetch AI commentary for a specific event
function AICommentaryItem({ event, meta, isGoal }: { event: CommentaryEvent, meta: Record<string, unknown>, isGoal: boolean }) {
  const { lang } = useLanguage();
  const { data, isLoading } = useAIAgent<{ text: string }>('commentary', { event: event.text }, lang);
  const Icon = meta.icon as React.ElementType;

  return (
    <div
      className={cn(
        'animate-commentary flex gap-3 p-3 rounded-lg border border-border bg-card/60',
        isGoal && 'border-primary/60 bg-primary/5 shadow-neon'
      )}
    >
      <div className="shrink-0 flex flex-col items-center gap-1">
        <span className="font-display font-extrabold text-primary text-lg tabular-nums">{event.minute}</span>
        <span className={cn('inline-flex items-center justify-center w-8 h-8 rounded-full ring-2', meta.ring as string, meta.bg as string)}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="flex-1 pt-1">
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 font-sans">
          {meta.label as string}
        </div>
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="h-3 w-3 animate-spin text-primary" />
            <span className={cn(lang === 'ar' && 'font-arabic')}>
              {lang === 'ar' ? 'جاري توليد التعليق...' : 'Generating commentary...'}
            </span>
          </div>
        ) : (
          <p className={cn('text-sm leading-relaxed text-foreground/90', isGoal && 'font-bold text-foreground', lang === 'ar' && 'font-arabic')}>
            {data?.text || event.text}
          </p>
        )}
      </div>
    </div>
  );
}

export function LiveCommentary() {
  const { lang } = useLanguage();
  const [events, setEvents] = useState<CommentaryEvent[]>(() => getCommentary());

  // Simulate a new commentary event appearing every 15s
  useEffect(() => {
    const samples: Omit<CommentaryEvent, 'id'>[] = [
      { minute: "70'", type: 'chance', text: 'A powerful shot from outside the box goes just over the crossbar.' },
      { minute: "72'", type: 'info',   text: 'Attacking pressure from the Brazilian team in these minutes.' },
      { minute: "74'", type: 'sub',    text: 'Substitution: Striker out, midfielder in to reinforce the defense.' },
      { minute: "76'", type: 'yellow', text: 'A new yellow card after a strong tackle in midfield.' },
    ];
    let i = 0;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      const sample = samples[i % samples.length];
      i++;
      setEvents((prev) => [{ ...sample, id: Date.now() }, ...prev].slice(0, 50));
    }, 15000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <Card className="bg-gradient-card border-border overflow-hidden flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-card/60">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/15">
            <Mic className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className={cn("font-display font-extrabold text-xl", lang === 'ar' && 'font-arabic')}>
              {lang === 'ar' ? 'التعليق المباشر' : 'Live Commentary'}
            </h3>
            <p className="text-xs text-muted-foreground font-arabic">
              {lang === 'ar' ? 'مدعوم بالذكاء الاصطناعي' : 'AI Powered'}
            </p>
          </div>
        </div>
        <Badge className="bg-live text-live-foreground gap-1.5 font-bold">
          <span className="w-1.5 h-1.5 bg-live-foreground rounded-full animate-pulse-live" />
          LIVE
        </Badge>
      </div>

      <div
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
        className="commentary-scroll flex-1 overflow-y-auto p-4 space-y-3"
        style={{ maxHeight: '520px' }}
      >
        {events.map((e) => {
          const meta = typeMeta[e.type];
          const isGoal = e.type === 'goal';
          return <AICommentaryItem key={e.id} event={e} meta={meta} isGoal={isGoal} />;
        })}
      </div>
    </Card>
  );
}
