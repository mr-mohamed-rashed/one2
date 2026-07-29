import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { t, T } from '@/lib/i18n';
import { EditableSiteText } from '@/components/one2/EditableSiteText';
import { ShareMenu } from '@/components/one2/ShareMenu';
import { LayoutGrid } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const TelegramIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.98-.65-.35-1.01.21-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.12-.05-.18-.06-.05-.15-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.28-.01.07-.01.18 0 .27z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
  </svg>
);
const TikTokIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.23-.9 4.4-2.42 5.92-1.48 1.48-3.47 2.32-5.56 2.34-2.06.02-4.1-.81-5.56-2.27-1.54-1.54-2.41-3.66-2.45-5.83-.04-2.18.84-4.29 2.4-5.83 1.52-1.5 3.55-2.33 5.66-2.35 1.04-.01 2.08.16 3.08.51v4.11c-.53-.25-1.1-.38-1.68-.4-1.12-.03-2.22.4-3.03 1.18-.84.81-1.3 1.94-1.33 3.1-.03 1.15.38 2.29 1.14 3.12.8.87 1.95 1.34 3.15 1.35 1.25.01 2.47-.48 3.36-1.37.89-.89 1.39-2.11 1.4-3.37.04-4.8.02-9.6.02-14.4z" />
  </svg>
);
const YouTubeIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);
const ArrowIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

export function One2Footer() {
  const { lang } = useLanguage();
  const { get } = useSiteSettings();
  const [email, setEmail] = useState('');
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(id);
  }, []);

  const columns = [
    {
      title: <EditableSiteText settingKey="footer_col1_title" fallbackEn="Sections" fallbackAr="الأقسام" />,
      links: [
        { label: <EditableSiteText settingKey="footer_col1_link1" fallbackEn={T.home.en} fallbackAr={T.home.ar} />, href: '/' },
        { label: <EditableSiteText settingKey="footer_col1_link2" fallbackEn={T.worldCupNews.en} fallbackAr={T.worldCupNews.ar} />, href: '/news' },
        { label: <EditableSiteText settingKey="footer_col1_link3" fallbackEn={T.groups.en} fallbackAr={T.groups.ar} />, href: '/groups' },
        { label: <EditableSiteText settingKey="footer_col1_link4" fallbackEn={T.standings.en} fallbackAr={T.standings.ar} />, href: '/standings' },
        { label: <EditableSiteText settingKey="footer_col1_link5" fallbackEn={T.liveMatches.en} fallbackAr={T.liveMatches.ar} />, href: '/live' },
      ],
    },
    {
      title: <EditableSiteText settingKey="footer_col2_title" fallbackEn="Coverage" fallbackAr="التغطية" />,
      links: [
        { label: <EditableSiteText settingKey="footer_col2_link1" fallbackEn="Live Scores" fallbackAr="النتائج المباشرة" />, href: '/live' },
        { label: <EditableSiteText settingKey="footer_col2_link2" fallbackEn="Fixtures" fallbackAr="المواعيد" />, href: '/live' },
        { label: <EditableSiteText settingKey="footer_col2_link3" fallbackEn="Top Scorers" fallbackAr="الهدافون" />, href: '/standings' },
        { label: <EditableSiteText settingKey="footer_col2_link4" fallbackEn="Highlights" fallbackAr="الملخصات" />, href: '/' },
      ],
    },
    {
      title: <EditableSiteText settingKey="footer_col3_title" fallbackEn="Company" fallbackAr="الشركة" />,
      links: [
        { label: <EditableSiteText settingKey="footer_col3_link1" fallbackEn="About" fallbackAr="عن الموقع" />, href: '#' },
        { label: <EditableSiteText settingKey="footer_col3_link2" fallbackEn="Contact" fallbackAr="تواصل معنا" />, href: '#' },
        { label: <EditableSiteText settingKey="footer_col3_link3" fallbackEn="Privacy" fallbackAr="الخصوصية" />, href: '#' },
        { label: <EditableSiteText settingKey="footer_col3_link4" fallbackEn="Terms" fallbackAr="الشروط" />, href: '#' },
      ],
    },
  ];

  const rawSocials = [
    { id: 'tiktok', icon: <TikTokIcon />, key: 'social_tiktok_url', hoverClass: 'hover:bg-[#000000] hover:text-white hover:border-[#000000] hover:shadow-[0_5px_20px_rgba(255,0,80,0.4)]' },
    { id: 'facebook', icon: <FacebookIcon />, key: 'social_facebook_url', hoverClass: 'hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] hover:shadow-[0_5px_20px_rgba(24,119,242,0.4)]' },
    { id: 'youtube', icon: <YouTubeIcon />, key: 'social_youtube_url', hoverClass: 'hover:bg-[#FF0000] hover:text-white hover:border-[#FF0000] hover:shadow-[0_5px_20px_rgba(255,0,0,0.4)]' },
    { id: 'telegram', icon: <TelegramIcon />, key: 'social_telegram_url', hoverClass: 'hover:bg-[#229ED9] hover:text-white hover:border-[#229ED9] hover:shadow-[0_5px_20px_rgba(34,158,217,0.4)]' },
  ];

  const socialLinks = rawSocials
    .map(s => ({ ...s, href: get(s.key) }))
    .filter(s => s.href && s.href.trim() !== '');

  const policyLinks = [
    { label: <EditableSiteText settingKey="footer_policy_1" fallbackEn="Privacy Policy" fallbackAr="سياسة الخصوصية" />, href: '/privacy-policy' },
    { label: <EditableSiteText settingKey="footer_policy_2" fallbackEn="Terms of Service" fallbackAr="شروط الخدمة" />, href: '/terms-of-service' },
  ];

  return (
    <div className="relative w-full mt-20 group overflow-hidden border-t border-primary/20 bg-[#0A0A0A]">

      <footer className="relative z-10 w-full pt-16 pb-0">
        <div className="w-full px-6 md:px-12 lg:px-16 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            
            {/* Left Column: Description, Socials, Subscribe, Big Text */}
            <div className={`lg:col-span-7 flex flex-col justify-start space-y-8 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <p className="text-[#A1A1AA] text-lg leading-relaxed hover:text-[#D4D4D8] transition-colors duration-300 max-w-xl">
                <EditableSiteText settingKey="footer_statement" fallbackEn={T.footerStatement.en} fallbackAr={T.footerStatement.ar} multiline />
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-xl">
                <div className="flex items-center gap-2 shrink-0">
                  {socialLinks.map((s, i) => (
                    <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                      className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-white/80 flex items-center justify-center hover:scale-110 hover:-translate-y-1.5 transition-all duration-300 backdrop-blur-md ${s.hoverClass || ''}`}>
                      {s.icon}
                    </a>
                  ))}
                  <div className="h-6 w-[1px] bg-white/10 mx-2" />
                  <ShareMenu />
                </div>

                <div className={`flex flex-1 items-center bg-[#18181B] rounded-lg overflow-hidden transition-all duration-300 w-full ${focused ? 'ring-2 ring-primary/50 shadow-neon' : 'hover:bg-[#1F1F23]'}`}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder={t('footerEmail', lang)}
                    className="bg-transparent px-4 py-3 text-white text-sm placeholder-[#52525B] focus:outline-none w-full min-w-[130px]"
                  />
                  <button className="group flex items-center gap-2 px-4 py-3 text-white text-sm font-medium hover:text-primary transition-all duration-300 whitespace-nowrap bg-white/5 hover:bg-white/10">
                    <EditableSiteText settingKey="footer_subscribe" fallbackEn={T.footerSubscribe.en} fallbackAr={T.footerSubscribe.ar} />
                    <span className="group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform duration-300"><ArrowIcon /></span>
                  </button>
                </div>
              </div>

              {/* The big text was moved to the bottom center */}
            </div>

            {/* Right Column: Links */}
            <div className="lg:col-span-5 flex flex-col justify-start pt-2">
              <div className="grid grid-cols-3 gap-4 sm:gap-8 w-full justify-items-end text-right">
                {columns.map((col, i) => (
                  <div
                    key={i}
                    className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                    style={{ transitionDelay: `${150 + i * 100}ms` }}
                  >
                    <h3 className="text-white font-semibold text-base mb-4">{col.title}</h3>
                    <ul className="space-y-3">
                      {col.links.map((link, j) => (
                        <li key={j}>
                          <NavLink to={link.href} className="text-[#71717A] text-sm hover:text-primary hover:-translate-x-1 inline-block transition-all duration-200">
                            {link.label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Big Centered ONE2 text/logo */}
          <div className={`w-full flex justify-center py-12 transition-all duration-1000 delay-300 relative z-10 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            <div className="relative group hover:scale-105 transition-transform duration-500 w-full max-w-4xl h-40 sm:h-64 flex items-center justify-center">
              <img 
                src="/images/one2-wings-logo.png" 
                alt="One2 Logo" 
                className="w-auto h-full max-w-full object-contain drop-shadow-[0_0_50px_rgba(34,197,94,0.3)]"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  document.getElementById('footer-logo-fallback')!.style.display = 'block';
                }}
              />
              <span 
                id="footer-logo-fallback"
                className="hidden font-display font-black text-7xl sm:text-8xl md:text-[140px] tracking-tighter select-none leading-none relative z-10"
                style={{
                  background: 'repeating-linear-gradient(45deg, #4ade80, #4ade80 20px, #22c55e 20px, #22c55e 40px)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0px 15px 8px rgba(0,0,0,0.8)) drop-shadow(0px 0px 20px rgba(34,197,94,0.15))',
                  WebkitTextStroke: '2px #14532d'
                }}
              >
                ONE2
              </span>
            </div>
          </div>

        </div>
        {/* Baseline */}
        <div className="w-full px-6 md:px-12 lg:px-16 bg-[#0A0A0A]/80 backdrop-blur-sm border-t border-white/5 relative z-10">
          <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <p className="text-[#71717A] text-sm"><EditableSiteText settingKey="footer_copyright" fallbackEn={T.footerCopyright.en} fallbackAr={T.footerCopyright.ar} /></p>
              <NavLink
                to="/admin"
                className="flex items-center gap-1.5 text-[#52525B] text-xs font-medium hover:text-primary transition-colors duration-200"
              >
                <LayoutGrid className="h-3 w-3" />
                {lang === 'ar' ? 'أدمن' : 'Admin'}
              </NavLink>
            </div>
            <div className="flex items-center gap-6">
              {policyLinks.map((l, i) => (
                <NavLink key={i} to={l.href} className="text-[#71717A] text-sm hover:text-white hover:underline underline-offset-4 transition-all duration-200">
                  {l.label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
        
        {/* Neon Pitch Background */}
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-40 pointer-events-none overflow-hidden" style={{ perspective: '1000px' }}>
          <div style={{ transform: 'rotateX(65deg) translateY(-100px) scale(1.5)' }} className="w-full max-w-[1400px] aspect-[2/1] relative">
            <style>
              {`
                .pitch-line {
                  fill: none;
                  stroke: rgba(34, 197, 94, 0.25);
                  stroke-width: 2;
                }
              `}
            </style>
            <svg viewBox="0 0 1000 600" className="w-full h-full">
              {/* Outer boundary */}
              <rect x="50" y="50" width="900" height="500" className="pitch-line" />
              {/* Center line */}
              <line x1="500" y1="50" x2="500" y2="550" className="pitch-line" />
              {/* Center circle */}
              <circle cx="500" cy="300" r="80" className="pitch-line" />
              {/* Center dot */}
              <circle cx="500" cy="300" r="4" fill="#22c55e" className="pitch-line" />
              
              {/* Left Penalty Area */}
              <rect x="50" y="150" width="150" height="300" className="pitch-line" />
              {/* Left Goal Area */}
              <rect x="50" y="225" width="50" height="150" className="pitch-line" />
              {/* Left Penalty Arc */}
              <path d="M 200 230 A 80 80 0 0 1 200 370" className="pitch-line" />
              
              {/* Right Penalty Area */}
              <rect x="800" y="150" width="150" height="300" className="pitch-line" />
              {/* Right Goal Area */}
              <rect x="900" y="225" width="50" height="150" className="pitch-line" />
              {/* Right Penalty Arc */}
              <path d="M 800 230 A 80 80 0 0 0 800 370" className="pitch-line" />
              
              {/* Corner Arcs */}
              <path d="M 50 80 A 30 30 0 0 0 80 50" className="pitch-line" />
              <path d="M 920 50 A 30 30 0 0 0 950 80" className="pitch-line" />
              <path d="M 950 520 A 30 30 0 0 0 920 550" className="pitch-line" />
              <path d="M 80 550 A 30 30 0 0 0 50 520" className="pitch-line" />
            </svg>
          </div>
        </div>

      </footer>
    </div>
  );
}
