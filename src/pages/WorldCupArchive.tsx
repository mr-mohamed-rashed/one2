import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ArrowRight, Trophy, Radio, Newspaper, LayoutGrid, MapPin, Calendar } from 'lucide-react';
import { Navigation } from '@/components/one2/Navigation';
import { NewsTicker } from '@/components/one2/NewsTicker';
import { MatchCenter } from '@/components/one2/MatchCenter';
import { TopScorersTable } from '@/components/one2/TopScorersTable';
import { One2Footer } from '@/components/one2/One2Footer';
import { ApiSportsWidget } from '@/components/one2/ApiSportsWidget';
import { WorldCupRoadmap } from '@/components/one2/WorldCupRoadmap';
import { TrendingSidebar } from '@/components/one2/TrendingSidebar';
import { AdBanner } from '@/components/one2/AdBanner';
import { EditModeToggle } from '@/components/one2/EditModeToggle';
import { StatsSummaryCard } from '@/components/one2/StatsSummaryCard';
import { EditableSiteText } from '@/components/one2/EditableSiteText';
import { EditableImage } from '@/components/one2/EditableImage';
import { AdSlotSelector } from '@/components/one2/AdSlotSelector';
import { SponsorMarquee } from '@/components/one2/SponsorMarquee';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getFeaturedNews, getLiveMatches, getNextMatch } from '@/lib/footballData';
import { useLanguage } from '@/context/LanguageContext';
import { useSiteSettingsContext } from '@/context/SiteSettingsContext';
import { useManualNews } from '@/hooks/useManualNews';
import { useEditMode } from '@/hooks/useEditMode';
import { useLiveFixtures, useUpcomingFixtures } from '@/hooks/useFootballData';
import { t, T } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const WorldCupArchive = () => {
  const { lang, dir } = useLanguage();
  const { get } = useSiteSettingsContext();
  const { news: manualNews } = useManualNews(true);
  const pulseNews = manualNews.filter((item) => item.category === 'Pulse');
  const [pulsePage, setPulsePage] = useState(1);
  const PULSE_PAGE_SIZE = 5;
  const pulseTotalPages = Math.max(1, Math.ceil(pulseNews.length / PULSE_PAGE_SIZE));
  const safePulsePage = Math.min(pulsePage, pulseTotalPages);
  const visiblePulseNews = pulseNews.slice((safePulsePage - 1) * PULSE_PAGE_SIZE, safePulsePage * PULSE_PAGE_SIZE);

  const goToPulsePage = (nextPage: number) => {
    setPulsePage(Math.min(Math.max(nextPage, 1), pulseTotalPages));
  };

  const featured = getFeaturedNews(lang);
  const { data: upcomingMatches = [] } = useUpcomingFixtures();
  const { data: liveMatches = [] } = useLiveFixtures();
  const nextMatch = upcomingMatches[0] || getNextMatch();
  const liveMatch = liveMatches[0] || getLiveMatches()[0];
  const isEditMode = useEditMode();

  useEffect(() => {
    if (!nextMatch) return;
    const triggerPulseNews = async () => {
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        await supabase.functions.invoke('generate-pulse-news', {
          body: {
            matchId: nextMatch.id,
            home: nextMatch.home.name,
            away: nextMatch.away.name,
            stage: nextMatch.stage,
          }
        });
      } catch (err) {
        console.error('Failed to trigger AI Pulse News:', err);
      }
    };
    triggerPulseNews();
  }, [nextMatch?.id]);

  const label = (key: string, fallback: string) => get(key, lang) ?? fallback;

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <EditModeToggle />
      <NewsTicker />
      <Navigation />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 opacity-100" style={{ backgroundImage: `url('/images/hero-bg.png')`, backgroundSize: 'cover', backgroundPosition: 'top center' }} />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />

        <div className="container relative mx-auto px-4 lg:px-8 py-16 md:py-24">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            <div className="flex-1 min-w-0">
              <Badge className="bg-primary text-primary-foreground mb-5 px-3 py-1 font-bold uppercase tracking-wider shadow-neon">
                {featured.category}
              </Badge>
              <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl leading-[1.05] mb-5">
                <EditableSiteText settingKey="hero_footballTitle" fallbackEn="Football." fallbackAr="كرة القدم." className={cn('text-foreground', lang === 'ar' && 'font-arabic')} />{' '}
                <EditableSiteText settingKey="hero_livePulse" fallbackEn="Live." fallbackAr="مباشر." className="text-primary [text-shadow:0_0_30px_hsl(var(--primary)/0.5)]" />
              </h1>
              <>
                {nextMatch ? (
                  <div className={cn('mb-8 max-w-2xl', lang === 'ar' && 'font-arabic')}>
                    <p className="mb-3 text-sm font-bold uppercase tracking-wider text-primary">
                      {lang === 'ar' ? 'الماتش اللي عليه الدور' : 'Up Next'}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-2xl sm:text-3xl font-extrabold text-foreground">
                      <TeamHeroName name={nextMatch.home?.name || ''} flag={nextMatch.home?.flag || ''} />
                      <span className="text-primary">vs</span>
                      <TeamHeroName name={nextMatch.away?.name || ''} flag={nextMatch.away?.flag || ''} />
                    </div>
                    <p className="mt-3 text-sm sm:text-base text-foreground/75 leading-relaxed">
                      {featured.excerpt
                        .replace(`${nextMatch.home?.name || ''} vs ${nextMatch.away?.name || ''} at `, '')
                        .replace(`الماتش اللي عليه الدور: ${nextMatch.home?.name || ''} ضد ${nextMatch.away?.name || ''} في `, '')}
                    </p>
                    {nextMatch.venue && (
                      <p className="mt-2 inline-flex items-center gap-2 text-sm text-foreground/70">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>{nextMatch.venue}</span>
                      </p>
                    )}
                  </div>
                ) : (
                  <div className={cn('mb-8 max-w-2xl', lang === 'ar' && 'font-arabic')}>
                    <p className="mb-3 text-sm font-bold uppercase tracking-wider text-primary">
                      {lang === 'ar' ? 'الماتش اللي عليه الدور' : 'Up Next'}
                    </p>
                    <p className="text-foreground/75">
                      {lang === 'ar' ? 'لا توجد مباريات قادمة حالياً' : 'No upcoming matches scheduled'}
                    </p>
                  </div>
                )}
                <div className="flex flex-wrap items-start gap-3">
                  <div className="flex flex-col items-center gap-2">
                    {liveMatches.length > 0 ? (
                      <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary-glow font-bold shadow-neon">
                        <NavLink to="/live">
                          <Radio className="h-4 w-4 me-2" />
                          <EditableSiteText settingKey="hero_watchLiveNow" fallbackEn={T.watchLiveNow.en} fallbackAr={T.watchLiveNow.ar} className={lang === 'ar' ? 'font-arabic' : ''} />
                        </NavLink>
                      </Button>
                    ) : (
                      <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary-glow font-bold shadow-neon" onClick={() => document.getElementById('match-center')?.scrollIntoView({ behavior: 'smooth' })}>
                        <Calendar className="h-4 w-4 me-2" />
                        <EditableSiteText settingKey="hero_exploreMatches" fallbackEn="Match Center" fallbackAr="مركز المباريات" className={lang === 'ar' ? 'font-arabic' : ''} />
                      </Button>
                    )}
                    {liveMatches.length > 0 && liveMatch && (
                      <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-background/45 px-3 py-1.5 shadow-card backdrop-blur mt-2">
                        <img src={liveMatch.home.flag} alt={liveMatch.home.name} className="h-7 w-7 rounded-full object-cover ring-2 ring-primary/40 animate-flag-breathe" />
                        <span className="text-xs font-extrabold text-primary">LIVE</span>
                        <img src={liveMatch.away.flag} alt={liveMatch.away.name} className="h-7 w-7 rounded-full object-cover ring-2 ring-primary/40 animate-flag-breathe [animation-delay:0.45s]" />
                      </div>
                    )}
                  </div>
                  <Button asChild size="lg" variant="outline" className="border-primary/40 text-foreground hover:bg-primary/10 hover:text-primary font-bold">
                    <NavLink to="/standings">
                      <Trophy className="h-4 w-4 me-2" />
                      <EditableSiteText settingKey="hero_topScorersButton" fallbackEn="Top Scorers" fallbackAr="ترتيب الهدافين" className={lang === 'ar' ? 'font-arabic' : ''} />
                    </NavLink>
                  </Button>
                </div>
              </>
            </div>
            <div className="flex-shrink-0 w-full lg:w-auto lg:max-w-sm xl:max-w-md flex flex-col gap-4">
              <AdSlotSelector location="hero" onAdd={() => { }} />
              <AdBanner slotId="hero-sidebar-1" />
              <AdBanner slotId="hero-sidebar-2" />
            </div>
          </div>
        </div>
      </section>

      <SponsorMarquee />

      <main className="container mx-auto px-4 lg:px-8 py-12 space-y-16">
        <section id="match-center">
          <SectionHeader
            icon={<Radio className="h-5 w-5" />}
            title={<EditableSiteText settingKey="section_matchCenter" fallbackEn={T.matchCenter.en} fallbackAr={T.matchCenter.ar} />}
            subtitle={<EditableSiteText settingKey="section_matchCenterSub" fallbackEn={T.matchCenterSub.en} fallbackAr={T.matchCenterSub.ar} />}
            linkTo="/live"
            linkLabel={<EditableSiteText settingKey="link_allMatches" fallbackEn={T.allMatches.en} fallbackAr={T.allMatches.ar} />}
            lang={lang}
          />
          <MatchCenter defaultTab="live" />
          <StatsSummaryCard />
        </section>

        {/* ApiSportsWidget removed temporarily */}

        <section>
          <TrendingSidebar />
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <SectionHeader
              icon={<Trophy className="h-5 w-5" />}
              title={<EditableSiteText settingKey="section_goldenBoot" fallbackEn={T.goldenBoot.en} fallbackAr={T.goldenBoot.ar} />}
              subtitle={<EditableSiteText settingKey="section_goldenBootSub" fallbackEn={T.goldenBootSub.en} fallbackAr={T.goldenBootSub.ar} />}
              linkTo="/standings"
              linkLabel={<EditableSiteText settingKey="link_fullStandings" fallbackEn={T.fullStandings.en} fallbackAr={T.fullStandings.ar} />}
              lang={lang}
            />
            <TopScorersTable compact={true} />
          </div>

          <aside className="space-y-6">
            <div>
              <SectionHeader
                icon={<Newspaper className="h-5 w-5" />}
                title={<EditableSiteText settingKey="section_worldCupPulse" fallbackEn={T.worldCupPulse.en} fallbackAr={T.worldCupPulse.ar} />}
                subtitle={<EditableSiteText settingKey="section_latestHeadlines" fallbackEn={T.latestHeadlines.en} fallbackAr={T.latestHeadlines.ar} />}
                lang={lang}
              />
              <div className="space-y-3">
                {/* Manual news from dashboard */}
                {visiblePulseNews.map(n => (
                  <div key={n.id} className="block p-4 rounded-lg border border-border bg-gradient-card hover:border-primary/50 hover:shadow-card transition-all group">
                    <Badge variant="outline" className="border-primary/40 text-primary text-[10px] font-bold mb-2">{n.title_en || 'PULSE'}</Badge>
                    <p className={cn('text-sm font-medium group-hover:text-primary transition-colors leading-relaxed', lang === 'ar' && 'font-arabic')}>
                      {lang === 'ar' ? n.title_ar || n.title_en : n.title_en || n.title_ar}
                    </p>
                  </div>
                ))}
              </div>

              {pulseTotalPages > 1 && (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-border bg-card/40 p-4 mt-2 rounded-lg">
                  <div className={lang === 'ar' ? 'font-arabic text-sm text-muted-foreground' : 'text-sm text-muted-foreground'}>
                    {lang === 'ar'
                      ? `صفحة ${safePulsePage} من ${pulseTotalPages}`
                      : `Page ${safePulsePage} of ${pulseTotalPages}`}
                  </div>

                  <div className="flex flex-wrap items-center gap-2" dir="ltr">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => goToPulsePage(safePulsePage - 1)}
                      disabled={safePulsePage === 1}
                      className="h-8 px-2"
                    >
                      {lang === 'ar' ? 'التالي' : 'Next'}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => goToPulsePage(safePulsePage + 1)}
                      disabled={safePulsePage === pulseTotalPages}
                      className="h-8 px-2"
                    >
                      {lang === 'ar' ? 'السابق' : 'Prev'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </section>

      </main>

      <One2Footer />
    </div>
  );
};

function SectionHeader({ icon, title, subtitle, linkTo, linkLabel, lang }: {
  icon: React.ReactNode; title: React.ReactNode; subtitle?: React.ReactNode;
  linkTo?: string; linkLabel?: React.ReactNode; lang: string;
}) {
  return (
    <div className="flex items-end justify-between mb-6 gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-primary/15 text-primary shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.25)]">{icon}</div>
        <div>
          <h2 className={cn('font-display font-extrabold text-2xl sm:text-3xl', lang === 'ar' && 'font-arabic')}>{title}</h2>
          {subtitle && <p className={cn('text-sm text-muted-foreground', lang === 'ar' && 'font-arabic')}>{subtitle}</p>}
        </div>
      </div>
      {linkTo && linkLabel && (
        <NavLink to={linkTo} className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-glow transition-colors">
          <span className={lang === 'ar' ? 'font-arabic' : ''}>{linkLabel}</span> <ArrowRight className="h-4 w-4" />
        </NavLink>
      )}
    </div>
  );
}

function TeamHeroName({ name, flag }: { name: string; flag: string }) {
  return (
    <span className="inline-flex items-center gap-2 min-w-0">
      <img src={flag} alt="" className="h-7 w-7 sm:h-8 sm:w-8 rounded-full object-cover ring-2 ring-primary/40 shadow-neon" />
      <span className="truncate">{name}</span>
    </span>
  );
}

export default WorldCupArchive;
