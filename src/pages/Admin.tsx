import { LogOut, Settings, Megaphone, Newspaper, LayoutGrid, Layers, CheckCircle, XCircle, AlertCircle, Activity, PlayCircle, Video, Trophy, ShieldAlert, Key } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { AdminGate } from '@/components/admin/AdminGate';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { WidgetLabelsTab } from '@/components/admin/WidgetLabelsTab';
import { AdsTab } from '@/components/admin/AdsTab';
import { NewsTab } from '@/components/admin/NewsTab';
import { RoadmapTab } from '@/components/admin/RoadmapTab';
import { MediaPlayerTab } from '@/components/admin/MediaPlayerTab';
import { AnalyticsTab } from '@/components/admin/AnalyticsTab';
import { MatchesTab } from '@/components/admin/MatchesTab';
import { ChatModerationTab } from '@/components/admin/ChatModerationTab';
import { TopScorersTab } from '@/components/admin/TopScorersTab';
import { ApiKeysTab } from '@/components/admin/ApiKeysTab';
import { NavLink, useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/lib/i18n';
import { leaguesConfig } from '@/lib/leaguesConfig';
import { cn } from '@/lib/utils';
export default function Admin() {
  const { authed, onLogout } = useAdminAuth();
  const { lang, setLang } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeLeague = searchParams.get('league') || 'worldcup';

  if (!authed) return <AdminGate />;

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="container mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-primary/15 border border-primary/30">
              <LayoutGrid className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-lg leading-none">{t('adminTitle', lang)}</h1>
              <Badge className="bg-green-600/20 text-green-400 border-green-600/40 text-[10px] mt-0.5">{t('adminDashboard', lang)}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="font-arabic font-medium"
            >
              {t('switchToAr', lang)}
            </Button>
            <Button asChild size="sm" variant="outline" className="gap-1.5 border-border">
              <NavLink to="/" target="_blank">{t('adminViewSite', lang)}</NavLink>
            </Button>
            <Button asChild size="sm" variant="default" className="gap-1.5">
              <NavLink to="/?edit=true" target="_blank">{t('adminEditWidgets', lang)}</NavLink>
            </Button>
            <Button size="sm" variant="ghost" onClick={onLogout} className="gap-1.5 text-muted-foreground hover:text-destructive">
              <LogOut className="h-4 w-4" /> {t('adminLogout', lang)}
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-4 lg:px-8 py-8">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="font-display font-extrabold text-2xl mb-1">{t('adminControlPanel', lang)}</h2>
            <p className="text-muted-foreground text-sm">{t('adminControlSub', lang)}</p>
          </div>
          
          <div className="flex flex-wrap gap-1.5 justify-end max-w-full overflow-x-auto py-1">
            <Button
              onClick={() => setSearchParams({ league: 'worldcup' })}
              variant={activeLeague === 'worldcup' ? 'default' : 'outline'}
              size="sm"
              className={cn(
                "font-bold text-xs rounded-xl h-9 transition-all duration-300",
                activeLeague === 'worldcup' ? "bg-primary text-primary-foreground shadow-neon shadow-primary/20 scale-105 border-primary" : "border-border hover:bg-white/5"
              )}
            >
              عام / كأس العالم
            </Button>
            {Object.values(leaguesConfig).map((l) => (
              <Button
                key={l.id}
                onClick={() => setSearchParams({ league: l.id })}
                variant={activeLeague === l.id ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  "font-bold text-xs rounded-xl h-9 transition-all duration-300",
                  activeLeague === l.id 
                    ? "bg-primary text-primary-foreground shadow-neon shadow-primary/20 scale-105"
                    : "border-border hover:bg-white/5"
                )}
                style={{
                  borderColor: activeLeague === l.id ? l.colors.accent : undefined
                }}
              >
                {lang === 'ar' ? l.nameAr : l.nameEn}
              </Button>
            ))}
          </div>
        </div>

        <Tabs defaultValue="matches">
          <TabsList className="flex flex-wrap h-auto w-full mb-8 bg-muted border border-border justify-start gap-2 p-1">
            <TabsTrigger value="matches" className="gap-2 font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground">
              <CheckCircle className="h-4 w-4" /> المباريات
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2 font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground">
              <Activity className="h-4 w-4" /> {t('adminAnalytics', lang)}
            </TabsTrigger>
            <TabsTrigger value="widgets" className="gap-2 font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground">
              <Settings className="h-4 w-4" /> {t('adminLabels', lang)}
            </TabsTrigger>
            <TabsTrigger value="roadmap" className="gap-2 font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground">
              <Trophy className="h-4 w-4" /> طريق كأس العالم
            </TabsTrigger>
            <TabsTrigger value="ads" className="gap-2 font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground">
              <Megaphone className="h-4 w-4" /> {t('adminAds', lang)}
            </TabsTrigger>
            <TabsTrigger value="topscorers" className="gap-2 font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground">
              <Trophy className="h-4 w-4" /> الهدافون
            </TabsTrigger>
            <TabsTrigger value="news" className="gap-2 font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground">
              <Newspaper className="h-4 w-4" /> {t('adminNews', lang)}
            </TabsTrigger>
            <TabsTrigger value="mediaplayer" className="gap-2 font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground">
              <PlayCircle className="h-4 w-4" /> {t('adminMediaPlayer', lang)}
            </TabsTrigger>
            <TabsTrigger value="api_keys" className="gap-2 font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground text-primary">
              <Key className="h-4 w-4" /> {lang === 'ar' ? 'مفاتيح الـ API' : 'API Keys'}
            </TabsTrigger>
            <TabsTrigger value="chat_moderation" className="gap-2 font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground text-destructive">
              <ShieldAlert className="h-4 w-4" /> {lang === 'ar' ? 'مراقبة الشات' : 'Chat Moderation'}
            </TabsTrigger>
          </TabsList>


          <TabsContent value="matches"><MatchesTab activeLeague={activeLeague} /></TabsContent>
          <TabsContent value="analytics"><AnalyticsTab /></TabsContent>
          <TabsContent value="widgets"><WidgetLabelsTab /></TabsContent>
          <TabsContent value="roadmap"><RoadmapTab /></TabsContent>
          <TabsContent value="ads"><AdsTab /></TabsContent>
          <TabsContent value="topscorers"><TopScorersTab activeLeague={activeLeague} /></TabsContent>
          <TabsContent value="news"><NewsTab activeLeague={activeLeague} /></TabsContent>
          <TabsContent value="mediaplayer"><MediaPlayerTab /></TabsContent>
          <TabsContent value="api_keys"><ApiKeysTab activeLeague={activeLeague} /></TabsContent>
          <TabsContent value="chat_moderation"><ChatModerationTab /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
