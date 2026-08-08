import React from 'react';
import { NavLink } from 'react-router-dom';
import { Navigation } from '@/components/one2/Navigation';
import { One2Footer } from '@/components/one2/One2Footer';
import { SponsorMarquee } from '@/components/one2/SponsorMarquee';
import { LiveMatchesRow } from '@/components/one2/LiveMatchesRow';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import { Trophy } from 'lucide-react';

const leagues = [
  {
    id: 'epl',
    title: { en: 'ENGLISH PREMIER LEAGUE', ar: 'الدوري الإنجليزي الممتاز' },
    image: '/images/hub/epl-bg.png', 
    logo: '/images/hub/epl-logo.png',
    link: '/league/epl', 
  },
  {
    id: 'ligue1',
    title: { en: 'LIGUE 1 (FRANCE)', ar: 'الدوري الفرنسي' },
    image: '/images/hub/ligue1-bg.png',
    logo: '/images/hub/ligue1-logo.png',
    link: '/league/ligue1',
  },
  {
    id: 'laliga',
    title: { en: 'LA LIGA (SPAIN)', ar: 'الدوري الإسباني' },
    image: '/images/hub/laliga-bg.png',
    logo: '/images/hub/laliga-logo.png',
    link: '/league/laliga',
  },
  {
    id: 'seriea',
    title: { en: 'SERIE A (ITALY)', ar: 'الدوري الإيطالي' },
    image: '/images/hub/seriea-bg.png',
    logo: '/images/hub/seriea-logo.png',
    link: '/league/seriea',
  },
  {
    id: 'ucl',
    title: { en: 'UEFA CHAMPIONS LEAGUE', ar: 'دوري أبطال أوروبا' },
    image: '/images/hub/ucl-bg.png',
    logo: '/images/hub/ucl-logo.png',
    link: '/league/ucl',
  },
  {
    id: 'epl_egypt',
    title: { en: 'EGYPTIAN PREMIER LEAGUE', ar: 'الدوري المصري الممتاز' },
    image: '/images/hub/egypt-bg.png',
    logo: '/images/hub/egypt-logo.png',
    link: '/league/epl_egypt',
  },
  {
    id: 'bundesliga',
    title: { en: 'BUNDESLIGA (GERMANY)', ar: 'الدوري الألماني' },
    image: '/images/hub/bundesliga-bg.png',
    logo: '/images/hub/bundesliga-logo.png',
    link: '/league/bundesliga',
  },
  {
    id: 'worldcup2026',
    title: { en: 'WORLD CUP 2026 ARCHIVE', ar: 'أرشيف كأس العالم 2026' },
    image: '/images/hub/worldcup-bg.png',
    logo: '/images/hub/worldcup-logo.png',
    link: '/world-cup',
  },
];

const Index = () => {
  const { lang, dir } = useLanguage();
  const isAr = lang === 'ar';

  return (
    <div className="min-h-screen bg-[#0a0f18] text-white" dir={dir}>
      <Navigation />

      {/* Hero Header Section */}
      <section className="relative w-full h-[350px] sm:h-[450px] flex flex-col items-center justify-center overflow-hidden border-b-2 border-primary/20">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
          style={{ backgroundImage: "url('/images/stadium-lights-bg.png')" }} 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f18]/30 via-[#0a0f18]/60 to-[#0a0f18]" />
        
        <div className="relative z-10 flex flex-col items-center justify-center mt-8">
          <div className="relative w-48 sm:w-64 md:w-80 h-32 sm:h-40 md:h-48 mb-4">
            <img 
              src="/images/one2-wings-logo.png" 
              alt="One 2 Logo" 
              className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(255,215,0,0.4)]"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                document.getElementById('wings-fallback')!.style.display = 'flex';
              }}
            />
            <div id="wings-fallback" className="hidden absolute inset-0 flex-col items-center justify-center text-primary">
              <Trophy className="w-16 h-16 sm:w-20 sm:h-20 mb-2 drop-shadow-neon" />
              <h1 className="font-display font-black text-4xl sm:text-5xl tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-primary to-primary/50">
                ONE2
              </h1>
            </div>
          </div>
          <h2 className="font-display font-bold text-lg sm:text-2xl tracking-[0.2em] text-white/90 uppercase [text-shadow:0_2px_10px_rgba(0,0,0,0.8)]">
            The Football Pulse
          </h2>
        </div>
      </section>

      <SponsorMarquee />

      <LiveMatchesRow />

      {/* Grid Section */}
      <section id="leagues" className="container mx-auto px-4 py-12 sm:py-16 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {leagues.map((league) => (
            <NavLink 
              key={league.id} 
              to={league.link}
              className="group relative overflow-hidden rounded-xl border-[3px] border-[#cda052]/50 hover:border-[#FFD700] transition-all duration-300 aspect-[4/3] bg-card flex items-end shadow-[0_10px_30px_-15px_rgba(0,0,0,0.8)] hover:shadow-[0_0_30px_rgba(255,215,0,0.3)] hover:-translate-y-2 cursor-pointer"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url('${league.image}')` }}
              />
              
              {/* Fallback pattern if image is missing */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#0a0f18] to-transparent opacity-80" />
              
              {/* Logo Overlay */}
              {'logo' in league && league.logo && (
                <div className="absolute inset-0 flex items-center justify-center pb-14 z-10 transition-transform duration-500 group-hover:scale-105">
                  <div className="w-36 h-24 bg-white/95 border border-[#cda052]/30 rounded-2xl flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.4)] group-hover:border-[#FFD700] group-hover:shadow-[0_0_20px_rgba(255,215,0,0.25)] transition-all duration-300 p-2">
                    <img 
                      src={league.logo} 
                      alt="" 
                      className="max-h-[64px] max-w-[110px] object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              
              <div className="relative z-10 w-full p-3 sm:p-4 text-center border-t border-[#cda052]/30 bg-black/40 backdrop-blur-sm">
                <h3 className={cn(
                  "font-bold text-[11px] sm:text-[13px] md:text-[15px] tracking-wider text-white group-hover:text-[#FFD700] transition-colors uppercase",
                  isAr && "font-arabic"
                )}>
                  {league.title[lang as keyof typeof league.title]}
                </h3>
              </div>
            </NavLink>
          ))}
        </div>
      </section>

      <One2Footer />
    </div>
  );
};

export default Index;
