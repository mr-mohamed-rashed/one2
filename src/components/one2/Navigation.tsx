import { useState } from 'react';
import { Menu, X, CircleDot, Search, Languages, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { t, T } from '@/lib/i18n';
import { EditableSiteText } from '@/components/one2/EditableSiteText';
import { useLiveFixtures } from '@/hooks/useFootballData';
import { useAuth } from '@/hooks/useAuth';

export function Navigation() {
  const [open, setOpen] = useState(false);
  const { lang, setLang, dir } = useLanguage();
  const { user, signOut } = useAuth();

  const { data: liveMatches = [] } = useLiveFixtures();

  const links = [
    { nameKey: 'home' as const,             to: '/' },
    { nameKey: 'leagues' as const,          to: '/#leagues' },
    { nameKey: 'transfers' as const,        to: '/transfers' },
    { nameKey: 'liveMatches' as const,      to: '/live' },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border" dir={dir}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <NavLink to="/" className="flex items-center group shrink-0">
            <div dir="ltr" className="flex items-center h-10 w-auto">
              <span 
                className="text-primary text-2xl sm:text-3xl font-black tracking-widest uppercase transition-colors duration-300 group-hover:text-white" 
                style={{ 
                  textShadow: '0 1px 0 hsl(145, 70%, 25%), 0 2px 0 hsl(145, 70%, 20%), 0 3px 0 hsl(145, 70%, 15%), 0 4px 0 hsl(145, 70%, 10%), 0 0 15px rgba(34,197,94,0.6), 0 0 30px rgba(34,197,94,0.4)' 
                }}
              >
                ONE 2
              </span>
            </div>
          </NavLink>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {links.map((link) => {
              const isHomeLink = link.nameKey === 'home';
              return (
                <NavLink
                  key={link.nameKey}
                  to={link.to}
                  end={isHomeLink || link.to === '/'}
                  className={({ isActive }) => {
                    const effectivelyActive = isActive && (!isHomeLink && link.to === '/' ? false : true);
                    return cn(
                      'relative px-3 py-2 font-semibold text-sm transition-colors rounded-md whitespace-nowrap',
                      lang === 'ar' && 'font-arabic',
                      'hover:text-primary',
                      effectivelyActive ? 'text-primary' : 'text-foreground/80'
                    );
                  }}
                >
                  {({ isActive }) => {
                    const effectivelyActive = isActive && (!isHomeLink && link.to === '/' ? false : true);
                    return (
                      <>
                        <EditableSiteText settingKey={`nav_${link.nameKey}`} fallbackEn={T[link.nameKey].en} fallbackAr={T[link.nameKey].ar} />
                        {effectivelyActive && (
                          <span className="absolute left-3 right-3 -bottom-[1px] h-0.5 bg-primary shadow-neon rounded-full" />
                        )}
                      </>
                    );
                  }}
                </NavLink>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary hidden md:flex">
              <Search className="h-5 w-5" />
            </Button>
            {/* Language Toggle */}
            <button
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all',
                'border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground',
                lang === 'ar' && 'font-arabic'
              )}
              title={lang === 'en' ? 'Switch to Arabic' : 'Switch to English'}
            >
              <Languages className="h-3.5 w-3.5" />
              {t('switchToAr', lang)}
            </button>
            {user && (
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
                onClick={() => signOut()}
                title={lang === 'ar' ? 'تسجيل الخروج' : 'Sign out'}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden rounded-full hover:bg-primary/10 hover:text-primary"
                  aria-label="Toggle menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[45vw] sm:w-[250px] !h-fit !bottom-auto rounded-br-3xl z-[99999] bg-background/95 backdrop-blur-xl border-border p-0 pb-4 shadow-2xl">
                <div className="flex flex-col py-6 px-3">
                  <div className="space-y-1.5 mt-2">
                    {links.map((link) => {
                      const isHomeLink = link.nameKey === 'home';
                      return (
                        <NavLink
                          key={link.nameKey}
                          to={link.to}
                          end={isHomeLink || link.to === '/'}
                          onClick={() => setOpen(false)}
                          className={({ isActive }) => {
                            const effectivelyActive = isActive && (!isHomeLink && link.to === '/' ? false : true);
                            return cn(
                              'block px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors',
                              lang === 'ar' && 'font-arabic text-right',
                              effectivelyActive
                                ? 'bg-primary/15 text-primary'
                                : 'text-foreground/80 hover:bg-muted hover:text-primary'
                            );
                          }}
                        >
                          <EditableSiteText settingKey={`nav_${link.nameKey}`} fallbackEn={T[link.nameKey].en} fallbackAr={T[link.nameKey].ar} />
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
