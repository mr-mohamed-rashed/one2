import { Loader2, Radio } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useSiteSettingsContext } from '@/context/SiteSettingsContext';
import { useManualNews } from '@/hooks/useManualNews';
import { useRealNews, formatForTicker } from '@/hooks/useRealNews';
import { leaguesConfig } from '@/lib/leaguesConfig';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export function NewsTicker({ 
  variant = 'default', 
  className,
  leagueId
}: { 
  variant?: 'default' | 'video'; 
  className?: string;
  leagueId?: string;
} = {}) {
  const { lang } = useLanguage();
  const { get } = useSiteSettingsContext();
  const { news: manualNews, loading: manualLoading } = useManualNews(true);
  const { data: realNews, isLoading } = useRealNews(lang);
  const desktopSpeed = Math.max(25, Math.min(500, Number(get('ticker_speed_seconds') || 70)));
  const mobileSpeed = Math.max(25, Math.min(500, Number(get('ticker_speed_mobile_seconds') || 120)));

  const league = leagueId ? leaguesConfig[leagueId] : null;

  const manualItems = leagueId
    ? manualNews
        .filter((item) => {
          const cat = item.category?.toLowerCase() || '';
          const lid = leagueId.toLowerCase();
          
          // Custom check for epl_egypt to match Egypt/مصر categories as well
          if (lid === 'epl_egypt') {
            return cat.includes('egypt') || cat.includes('مصر') || cat.includes('egy') || cat === 'egyptian';
          }
          
          return cat === lid || cat.includes(lid);
        })
        .slice(0, 10)
        .map((item) => ({
          tag: lang === 'ar' ? 'أخبار الدوري' : 'LEAGUE NEWS',
          text: lang === 'ar' ? item.title_ar || item.title_en : item.title_en || item.title_ar,
        }))
        .filter((item) => item.text)
    : manualNews
        .filter((item) => item.category === 'Ticker')
        .slice(0, 12)
        .map((item) => ({
          tag: lang === 'ar' ? 'خبر عاجل' : 'NEWS',
          text: lang === 'ar' ? item.title_ar || item.title_en : item.title_en || item.title_ar,
        }))
        .filter((item) => item.text);

  const tickerItems = leagueId 
    ? manualItems 
    : [...manualItems, ...formatForTicker(realNews, lang)];

  const fallbackItems = [
    {
      tag: league ? 'NEWS' : 'WORLD CUP',
      text: lang === 'ar' ? 'جاري تحميل أحدث الأخبار...' : 'Loading latest news...',
    },
  ];

  const items = tickerItems.length > 0 ? tickerItems : fallbackItems;
  const tickerSet = Array.from({ length: Math.max(2, Math.ceil(8 / items.length)) }, () => items).flat();
  const loop = [...tickerSet, ...tickerSet];
  const loading = isLoading || manualLoading;

  const labelText = league
    ? (lang === 'ar' ? `أخبار ${league.nameAr}` : `${league.nameEn} News`)
    : (variant === 'video' ? 'ONE 2' : t('tickerLabel', lang));

  return (
    <div 
      className={cn(
        "overflow-hidden relative",
        variant === 'video' ? "bg-black/80 border-t border-white/10" : "bg-card border-b border-primary/30",
        className
      )}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="flex items-stretch">
        <div className="shrink-0 bg-primary text-primary-foreground font-bold text-[10px] sm:text-[11px] flex items-center gap-1 px-2 sm:px-2.5 py-2.5 uppercase tracking-wide z-10 shadow-neon">
          {loading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Radio className="h-3 w-3 animate-pulse-live" />
          )}
          <span className={lang === 'ar' ? 'font-arabic whitespace-nowrap' : 'whitespace-nowrap'}>
            {labelText}
          </span>
        </div>
        <div className="flex-1 overflow-hidden relative bg-gradient-ticker" dir="ltr">
          <div
            className={`flex whitespace-nowrap py-2.5 ${lang === 'ar' ? 'animate-ticker-ar' : 'animate-ticker'} ticker-responsive-speed`}
            style={{ 
              '--desktop-speed': `${desktopSpeed}s`, 
              '--mobile-speed': `${mobileSpeed}s` 
            } as React.CSSProperties}
          >
            {loop.map((item, index) => (
              <span
                key={`${item.tag}-${index}`}
                className="flex items-center text-sm shrink-0 px-5"
                dir={lang === 'ar' ? 'rtl' : 'ltr'}
              >
                <span className="font-display font-bold text-primary mx-2 uppercase tracking-wider text-xs">
                  {item.tag}
                </span>
                <span className={cn(variant === 'video' ? "text-white/90" : "text-foreground/90")}>{item.text}</span>
                <span className="mx-5 text-primary/40">|</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
