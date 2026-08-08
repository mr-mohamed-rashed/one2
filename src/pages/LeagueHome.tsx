import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Navigation } from '@/components/one2/Navigation';
import { NewsTicker } from '@/components/one2/NewsTicker';
import { SponsorMarquee } from '@/components/one2/SponsorMarquee';
import { One2Footer } from '@/components/one2/One2Footer';
import { useLanguage } from '@/context/LanguageContext';
import { leaguesConfig } from '@/lib/leaguesConfig';
import { Trophy, Calendar, Newspaper, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useManualNews } from '@/hooks/useManualNews';
import { LeagueMatchCenter } from '@/components/one2/LeagueMatchCenter';
import { LeagueStandingsTable } from '@/components/one2/LeagueStandingsTable';
import { LeagueTopScorers } from '@/components/one2/LeagueTopScorers';

const LeagueHome = () => {
  const { leagueId } = useParams<{ leagueId: string }>();
  const { lang, dir } = useLanguage();
  const isAr = lang === 'ar';
  
  const { news: allNews } = useManualNews(true);

  if (!leagueId || !leaguesConfig[leagueId]) {
    return <Navigate to="/404" replace />;
  }

  const league = leaguesConfig[leagueId];

  // Filter news: category matching leagueId (case-insensitive or simple mapping)
  const leagueNews = allNews.filter((item) => {
    const cat = item.category?.toLowerCase() || '';
    const lid = leagueId.toLowerCase();
    
    // Custom check for epl_egypt to match Egypt/مصر categories as well
    if (lid === 'epl_egypt') {
      return cat.includes('egypt') || cat.includes('مصر') || cat.includes('egy') || cat === 'egyptian';
    }
    
    return cat === lid || cat.includes(lid);
  });

  return (
    <div 
      className="min-h-screen text-white transition-colors duration-500" 
      dir={dir}
      style={{ backgroundColor: league.colors.background }}
    >
      <Navigation />
      
      {/* News Ticker */}
      <NewsTicker />

      {/* Dynamic Themed Hero Section */}
      <section 
        className="relative w-full min-h-[380px] sm:min-h-[450px] py-12 flex flex-col items-center justify-center overflow-hidden"
        style={{ borderBottom: `4px solid ${league.colors.accent}` }}
      >
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-luminosity"
          style={{ backgroundImage: `url('${league.coverImage}')` }} 
        />
        
        {/* Dynamic Gradients based on league colors */}
        <div 
          className="absolute inset-0 opacity-80"
          style={{ 
            background: `linear-gradient(to bottom, ${league.colors.primary} 0%, transparent 50%, ${league.colors.background} 100%)` 
          }} 
        />
        <div 
          className="absolute inset-0 opacity-60"
          style={{ 
            background: `radial-gradient(circle at center, ${league.colors.secondary} 0%, transparent 70%)` 
          }} 
        />
        
        <div className="relative z-10 flex flex-col items-center justify-center mt-6 px-4 text-center">
          {/* Header Row: League Logo next to ONE2 Neon Name */}
          <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
            <div className="w-20 h-20 sm:w-28 sm:h-28 bg-white/95 border border-[#cda052]/30 rounded-2xl flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.4)] p-2 shrink-0">
              <img 
                src={league.logo} 
                alt="" 
                className="max-h-[64px] max-w-[90px] object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            
            <span 
              className="text-5xl sm:text-7xl font-display font-black tracking-widest uppercase"
              style={{
                color: '#ffffff',
                textShadow: `0 0 10px ${league.colors.accent}, 0 0 20px ${league.colors.secondary}, 0 0 30px ${league.colors.primary}`
              }}
            >
              ONE2
            </span>
          </div>

          <h1 
            className={cn(
              "font-display font-extrabold text-2xl sm:text-4xl mb-4 text-white/95",
              isAr && "font-arabic"
            )}
            style={{ 
              textShadow: `0 2px 10px ${league.colors.primary}`,
            }}
          >
            {isAr ? league.nameAr : league.nameEn}
          </h1>
          <Badge text={isAr ? 'تغطية شاملة للموسم' : 'FULL SEASON COVERAGE'} color={league.colors.accent} />
        </div>
      </section>

      {/* Sponsor Marquee */}
      <SponsorMarquee />

      {/* Main Content Body */}
      <main className="container mx-auto px-4 py-12 relative z-10 space-y-12">
        
        {/* Full-width Match Center on Top */}
        {league.apiLeagueId ? (
          <section id="match-center">
            <ContentCard 
              title={isAr ? 'مركز مباريات الدوري' : 'League Match Center'} 
              icon={<Calendar className="h-5 w-5" />} 
              primaryColor={league.colors.primary}
              accentColor={league.colors.accent}
            >
              <LeagueMatchCenter 
                leagueId={league.apiLeagueId} 
                season={league.season || 2026} 
                accentColor={league.colors.accent} 
              />
            </ContentCard>
          </section>
        ) : (
          <section id="match-center">
            <ContentCard 
              title={isAr ? 'مركز المباريات' : 'Match Center'} 
              icon={<Calendar className="h-5 w-5" />} 
              primaryColor={league.colors.primary}
              accentColor={league.colors.accent}
            >
              <div className="h-48 flex items-center justify-center text-white/50 border border-dashed border-white/20 rounded-lg">
                {isAr ? 'سيتم إضافة جدول المباريات قريباً' : 'Fixtures integration coming soon'}
              </div>
            </ContentCard>
          </section>
        )}

        {/* Latest 3 News Cards Section */}
        <section id="trending-news">
          <div className="rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm border border-white/10" style={{ backgroundColor: `${league.colors.primary}40` }}>
            <div className="px-6 py-4 flex items-center justify-between border-b border-white/10" style={{ backgroundColor: `${league.colors.primary}80` }}>
              <div className="flex items-center gap-3">
                <div style={{ color: league.colors.accent }}>
                  <Newspaper className="h-5 w-5" />
                </div>
                <div>
                  <h3 className={cn('text-xl font-bold', isAr && 'font-arabic')}>
                    {isAr ? 'آخر أخبار الدوري الممتازة' : 'Featured League News'}
                  </h3>
                </div>
              </div>
            </div>

            <div className="grid gap-4 p-6 md:grid-cols-3">
              {leagueNews.slice(0, 3).length > 0 ? (
                leagueNews.slice(0, 3).map((item) => {
                  const title = isAr ? item.title_ar || item.title_en : item.title_en || item.title_ar;
                  const excerpt = isAr ? item.excerpt_ar || item.excerpt_en : item.excerpt_en || item.excerpt_ar;
                  const urlId = item.post_id || item.id;
                  
                  return (
                    <NavLink 
                      key={item.id} 
                      to={`/news/sports/${urlId}`} 
                      className="group overflow-hidden rounded-lg border border-white/10 bg-black/45 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 block hover:shadow-2xl"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-black/40">
                        <img
                          src={item.image_url || 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&q=80'}
                          alt={title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&q=80';
                          }}
                        />
                        <span className="absolute right-2 top-2 px-2 py-0.5 rounded text-[9px] font-bold border" style={{ backgroundColor: `${league.colors.accent}d0`, color: '#000', borderColor: league.colors.accent }}>
                          {isAr ? 'خبر عاجل' : 'BREAKING'}
                        </span>
                      </div>
                      <div className="p-4 space-y-2">
                        <h4 className={cn('line-clamp-2 text-sm font-bold leading-relaxed text-white group-hover:text-primary-glow transition-colors text-start', isAr && 'font-arabic')}>
                          {title}
                        </h4>
                        <p className={cn('line-clamp-2 text-xs text-white/60 leading-relaxed text-start', isAr && 'font-arabic')}>
                          {excerpt}
                        </p>
                        <p className="text-[10px] text-white/40 text-start" dir="ltr">{item.published_at}</p>
                      </div>
                    </NavLink>
                  );
                })
              ) : (
                <div className="col-span-full h-48 flex items-center justify-center text-white/50 border border-dashed border-white/20 rounded-lg">
                  {isAr ? 'لا توجد أخبار مضافة حالياً لهذا الدوري' : 'No news articles available for this league yet'}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Split Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column (2/3) - Standings & Top Scorers */}
          <div className="lg:col-span-2 space-y-8">
            {league.apiLeagueId ? (
              <section id="standings">
                <ContentCard 
                  title={isAr ? 'جدول ترتيب الدوري' : 'League Standings'} 
                  icon={<BarChart3 className="h-5 w-5" />} 
                  primaryColor={league.colors.primary}
                  accentColor={league.colors.accent}
                >
                  <LeagueStandingsTable 
                    leagueId={league.apiLeagueId} 
                    season={league.season || 2026} 
                    accentColor={league.colors.accent} 
                  />
                </ContentCard>
              </section>
            ) : (
              <section id="standings">
                <ContentCard 
                  title={isAr ? 'الترتيب' : 'Standings'} 
                  icon={<BarChart3 className="h-5 w-5" />} 
                  primaryColor={league.colors.primary}
                  accentColor={league.colors.accent}
                >
                  <div className="h-96 flex items-center justify-center text-white/50 border border-dashed border-white/20 rounded-lg">
                    {isAr ? 'سيتم إضافة جدول الترتيب قريباً' : 'Standings table coming soon'}
                  </div>
                </ContentCard>
              </section>
            )}

            {league.apiLeagueId && (
              <section id="top-scorers">
                <ContentCard 
                  title={isAr ? 'ترتيب الهدافين (الحذاء الذهبي)' : 'Top Scorers (Golden Boot)'} 
                  icon={<Trophy className="h-5 w-5" />} 
                  primaryColor={league.colors.primary}
                  accentColor={league.colors.accent}
                >
                  <LeagueTopScorers 
                    leagueId={league.apiLeagueId} 
                    season={league.season || 2026} 
                    accentColor={league.colors.accent} 
                  />
                </ContentCard>
              </section>
            )}
          </div>

          {/* Sidebar Column (1/3) - Pulse/Latest News */}
          <aside className="space-y-8">
            <section id="league-pulse">
              <ContentCard 
                title={isAr ? 'نبض الدوري' : 'League Pulse News'} 
                icon={<Newspaper className="h-5 w-5" />} 
                primaryColor={league.colors.primary}
                accentColor={league.colors.accent}
              >
                <div className="space-y-3">
                  {leagueNews.length > 0 ? (
                    leagueNews.map((n) => (
                      <div 
                        key={n.id} 
                        className="block p-4 rounded-lg border border-white/10 bg-black/35 hover:border-white/20 hover:shadow-lg transition-all group"
                      >
                        <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold mb-2 border" style={{ backgroundColor: `${league.colors.accent}15`, color: league.colors.accent, borderColor: `${league.colors.accent}30` }}>
                          {isAr ? 'نبض الدوري' : 'PULSE'}
                        </span>
                        <p className={cn('text-sm font-medium transition-colors leading-relaxed text-start text-white group-hover:text-primary-glow', isAr && 'font-arabic')}>
                          {isAr ? n.title_ar || n.title_en : n.title_en || n.title_ar}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="h-48 flex items-center justify-center text-white/50 border border-dashed border-white/20 rounded-lg">
                      {isAr ? 'لا توجد أخبار مضافة حالياً لهذا الدوري' : 'No news articles available for this league yet'}
                    </div>
                  )}
                </div>
              </ContentCard>
            </section>
          </aside>

        </section>
      </main>

      <One2Footer />
    </div>
  );
};

// Helper Components
const Badge = ({ text, color }: { text: string, color: string }) => (
  <span 
    className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-widest backdrop-blur-md border"
    style={{ 
      backgroundColor: `${color}20`,
      color: '#fff',
      borderColor: color,
      boxShadow: `0 0 10px ${color}40`
    }}
  >
    {text}
  </span>
);

const ContentCard = ({ 
  title, icon, children, primaryColor, accentColor 
}: { 
  title: string, icon: React.ReactNode, children: React.ReactNode, primaryColor: string, accentColor: string 
}) => (
  <div 
    className="rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm border border-white/10"
    style={{ backgroundColor: `${primaryColor}40` }}
  >
    <div 
      className="px-6 py-4 flex items-center gap-3 border-b border-white/10"
      style={{ backgroundColor: `${primaryColor}80` }}
    >
      <div style={{ color: accentColor }}>{icon}</div>
      <h2 className="text-xl font-bold">{title}</h2>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

export default LeagueHome;
