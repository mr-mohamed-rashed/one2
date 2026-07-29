import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Navigation } from '@/components/one2/Navigation';
import { One2Footer } from '@/components/one2/One2Footer';
import { useLanguage } from '@/context/LanguageContext';
import { leaguesConfig } from '@/lib/leaguesConfig';
import { Trophy, Calendar, Newspaper, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const LeagueHome = () => {
  const { leagueId } = useParams<{ leagueId: string }>();
  const { lang, dir } = useLanguage();
  const isAr = lang === 'ar';

  if (!leagueId || !leaguesConfig[leagueId]) {
    return <Navigate to="/404" replace />;
  }

  const league = leaguesConfig[leagueId];

  return (
    <div 
      className="min-h-screen text-white transition-colors duration-500" 
      dir={dir}
      style={{ backgroundColor: league.colors.background }}
    >
      <Navigation />

      {/* Dynamic Themed Hero Section */}
      <section 
        className="relative w-full h-[400px] sm:h-[500px] flex flex-col items-center justify-center overflow-hidden"
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
        
        <div className="relative z-10 flex flex-col items-center justify-center mt-12 px-4 text-center">
          <div className="relative w-32 sm:w-48 h-32 sm:h-48 mb-6">
            <img 
              src={league.logo} 
              alt={isAr ? league.nameAr : league.nameEn} 
              className="w-full h-full object-contain"
              style={{ filter: `drop-shadow(0 0 30px ${league.colors.accent}80)` }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                document.getElementById('league-logo-fallback')!.style.display = 'flex';
              }}
            />
            <div id="league-logo-fallback" className="hidden absolute inset-0 flex-col items-center justify-center">
              <Trophy className="w-20 h-20 mb-2" style={{ color: league.colors.accent }} />
            </div>
          </div>
          <h1 
            className={cn(
              "font-display font-black text-4xl sm:text-6xl tracking-wider mb-2",
              isAr && "font-arabic"
            )}
            style={{ 
              textShadow: `0 4px 20px ${league.colors.secondary}`,
              color: '#ffffff'
            }}
          >
            {isAr ? league.nameAr : league.nameEn}
          </h1>
          <Badge text={isAr ? 'تغطية شاملة للموسم' : 'FULL SEASON COVERAGE'} color={league.colors.accent} />
        </div>
      </section>

      {/* Content Placeholders */}
      <section className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            <ContentCard 
              title={isAr ? 'آخر الأخبار' : 'Latest News'} 
              icon={<Newspaper />} 
              primaryColor={league.colors.primary}
              accentColor={league.colors.accent}
            >
              <div className="h-64 flex items-center justify-center text-white/50 border border-dashed border-white/20 rounded-lg">
                {isAr ? 'سيتم إضافة الأخبار قريباً' : 'News integration coming soon'}
              </div>
            </ContentCard>

            <ContentCard 
              title={isAr ? 'المباريات القادمة' : 'Upcoming Matches'} 
              icon={<Calendar />} 
              primaryColor={league.colors.primary}
              accentColor={league.colors.accent}
            >
              <div className="h-48 flex items-center justify-center text-white/50 border border-dashed border-white/20 rounded-lg">
                {isAr ? 'سيتم إضافة جدول المباريات قريباً' : 'Fixtures integration coming soon'}
              </div>
            </ContentCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <ContentCard 
              title={isAr ? 'الترتيب' : 'Standings'} 
              icon={<BarChart3 />} 
              primaryColor={league.colors.primary}
              accentColor={league.colors.accent}
            >
              <div className="h-96 flex items-center justify-center text-white/50 border border-dashed border-white/20 rounded-lg">
                {isAr ? 'سيتم إضافة جدول الترتيب قريباً' : 'Standings table coming soon'}
              </div>
            </ContentCard>
          </div>

        </div>
      </section>

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
