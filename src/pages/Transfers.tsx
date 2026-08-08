import React, { useState } from 'react';
import { Navigation } from '@/components/one2/Navigation';
import { NewsTicker } from '@/components/one2/NewsTicker';
import { One2Footer } from '@/components/one2/One2Footer';
import { useLanguage } from '@/context/LanguageContext';
import { useManualNews } from '@/hooks/useManualNews';
import { Card } from '@/components/ui/card';
import { ArrowLeftRight, Calendar, Landmark, Info, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { leaguesConfig } from '@/lib/leaguesConfig';

const Transfers = () => {
  const { lang, dir } = useLanguage();
  const isAr = lang === 'ar';
  const { news: allNews, loading } = useManualNews(true);
  const [activeLeague, setActiveLeague] = useState<string>('all');

  // Filter out transfers from manual_news where category starts with 'transfers:'
  const transfers = allNews
    .filter((n) => n.category && n.category.startsWith('transfers:'))
    .map((n) => {
      const leagueId = n.category.replace('transfers:', '');
      return {
        ...n,
        leagueId,
        leagueName: leaguesConfig[leagueId] 
          ? (isAr ? leaguesConfig[leagueId].nameAr : leaguesConfig[leagueId].nameEn)
          : (isAr ? 'آخر الانتقالات' : 'Transfers'),
        accentColor: leaguesConfig[leagueId]?.colors?.accent || '#22c55e',
        primaryColor: leaguesConfig[leagueId]?.colors?.primary || '#3b82f6',
      };
    })
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

  // Available leagues with transfers
  const availableLeagues = [
    { id: 'all', nameAr: 'كل الانتقالات', nameEn: 'All Transfers' },
    ...Object.values(leaguesConfig).map((l) => ({
      id: l.id,
      nameAr: l.nameAr,
      nameEn: l.nameEn,
    })),
  ];

  // Filtered transfers based on active tab
  const filteredTransfers = activeLeague === 'all'
    ? transfers
    : transfers.filter((t) => t.leagueId === activeLeague);

  return (
    <div className="min-h-screen bg-background text-white" dir={dir}>
      <Navigation />
      <NewsTicker />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-card to-background py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.08)_0%,transparent_75%)]" />
        <div className="container relative mx-auto px-4 text-center space-y-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-neon border border-primary/25">
            <ArrowLeftRight className="h-6 w-6" />
          </div>
          <h1 className={cn("text-4xl sm:text-5xl font-display font-extrabold tracking-tight text-white", isAr && "font-arabic")}>
            {isAr ? 'سوق الانتقالات الرسمي' : 'Official Transfer Market'}
          </h1>
          <p className={cn("max-w-xl mx-auto text-sm sm:text-base text-muted-foreground", isAr && "font-arabic")}>
            {isAr 
              ? 'متابعة حية ولحظية لجميع صفقات الأندية الرسمية، الانتقالات الحرة، وأسعار اللاعبين في الدوريات الكبرى.' 
              : 'Real-time coverage of official club signings, free transfers, and player values across top leagues.'}
          </p>
        </div>
      </section>

      {/* Main Container */}
      <main className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
        
        {/* League Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 border-b border-border pb-4">
          {availableLeagues.map((league) => (
            <button
              key={league.id}
              onClick={() => setActiveLeague(league.id)}
              className={cn(
                "px-4 py-2 text-xs sm:text-sm font-bold rounded-lg border transition-all duration-300",
                activeLeague === league.id
                  ? "bg-primary text-primary-foreground border-primary shadow-neon shadow-primary/20 scale-105"
                  : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white",
                isAr && "font-arabic"
              )}
            >
              {isAr ? league.nameAr : league.nameEn}
            </button>
          ))}
        </div>

        {/* Transfers Feed */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <span className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
            </div>
          ) : filteredTransfers.length > 0 ? (
            <div className="grid gap-4">
              {filteredTransfers.map((transfer) => {
                const title = isAr ? transfer.title_ar || transfer.title_en : transfer.title_en || transfer.title_ar;
                
                // Parse excerpt: expected to have "From Team ➡️ To Team" format
                // In Arabic we use ➡️ or إلى
                const desc = isAr ? transfer.excerpt_ar || transfer.excerpt_en : transfer.excerpt_en || transfer.excerpt_ar;
                const value = isAr ? transfer.title_en : transfer.excerpt_en; // Fallbacks for fee
                
                return (
                  <Card 
                    key={transfer.id}
                    className="overflow-hidden border border-white/10 bg-gradient-card p-5 hover:border-primary/40 hover:shadow-card transition-all duration-300"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      
                      {/* Left: Player info & Clubs */}
                      <div className="flex items-center gap-4 flex-1">
                        <div 
                          className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border shadow-inner"
                          style={{ 
                            backgroundColor: `${transfer.accentColor}10`,
                            borderColor: `${transfer.accentColor}30`,
                            color: transfer.accentColor
                          }}
                        >
                          <Landmark className="h-6 w-6" />
                        </div>
                        <div className="space-y-1.5 text-start">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className={cn("text-lg font-black text-white leading-none", isAr && "font-arabic")}>
                              {title}
                            </h3>
                            <Badge 
                              className="text-[9px] font-bold py-0.5 border"
                              style={{ 
                                backgroundColor: `${transfer.accentColor}15`, 
                                color: transfer.accentColor, 
                                borderColor: `${transfer.accentColor}35` 
                              }}
                            >
                              {transfer.leagueName}
                            </Badge>
                          </div>
                          <div className={cn("flex items-center gap-2 text-sm text-white/80 font-medium", isAr && "font-arabic")}>
                            <Landmark className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span>{desc}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Date & Fee */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-white/5 pt-3 sm:border-t-0 sm:pt-0 shrink-0">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground" dir="ltr">
                          <Calendar className="h-3.5 w-3.5 text-primary" />
                          <span>{transfer.published_at}</span>
                        </div>
                        
                        <div 
                          className="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold border shadow-[0_0_15px_rgba(0,0,0,0.2)] font-mono"
                          style={{
                            backgroundColor: `${transfer.accentColor}15`,
                            color: '#fff',
                            borderColor: transfer.accentColor,
                            boxShadow: `0 0 10px ${transfer.accentColor}25`
                          }}
                        >
                          {value || (isAr ? 'انتقال حر' : 'Free Transfer')}
                        </div>
                      </div>

                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-white/10 p-12 text-center bg-card/20 space-y-3">
              <Info className="h-8 w-8 text-muted-foreground mx-auto" />
              <h3 className={cn("text-lg font-bold text-white", isAr && "font-arabic")}>
                {isAr ? 'لا توجد صفقات حالياً' : 'No transfers recorded yet'}
              </h3>
              <p className={cn("text-sm text-muted-foreground max-w-md mx-auto", isAr && "font-arabic")}>
                {isAr 
                  ? 'سيتم تحديث الصفحة فور تسجيل صفقات جديدة من قِبل المشرفين في لوحة التحكم.' 
                  : 'This page will populate once transfers are logged by administrators in the dashboard.'}
              </p>
            </div>
          )}
        </div>
      </main>

      <One2Footer />
    </div>
  );
};

// Simple internal Badge
const Badge = ({ children, style, className }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) => (
  <span 
    className={cn("px-2 py-0.5 rounded text-[10px] uppercase font-bold", className)}
    style={style}
  >
    {children}
  </span>
);

export default Transfers;
