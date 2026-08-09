import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Save, Loader2, Video, RefreshCw, Bell, Send, Wand2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useResults, useUpcomingFixtures, useLeagueAllFixtures } from '@/hooks/useFootballData';
import { leaguesConfig } from '@/lib/leaguesConfig';
import { queryClient } from '@/App';
import { useToast } from '@/hooks/use-toast';

export function MatchesTab({ activeLeague = 'worldcup' }: { activeLeague?: string }) {
  const { toast } = useToast();
  const league = Object.values(leaguesConfig).find((l) => l.id === activeLeague);
  const { data: leagueFixtures = [], isLoading: isLeagueLoading } = useLeagueAllFixtures(league?.apiLeagueId, league?.season);
  
  const { data: finishedWorldCup = [], isLoading: isFinishedWcLoading, refetch: refetchFinished } = useResults();
  const { data: upcomingWorldCup = [], isLoading: isUpcomingWcLoading } = useUpcomingFixtures();
  
  const isWorldCup = activeLeague === 'worldcup';
  
  const finished = isWorldCup 
    ? finishedWorldCup 
    : leagueFixtures.filter((m) => m.status === 'finished');
    
  const upcoming = isWorldCup 
    ? upcomingWorldCup 
    : leagueFixtures.filter((m) => m.status === 'upcoming' || m.status === 'live');
    
  const isLoading = isWorldCup 
    ? (isFinishedWcLoading || isUpcomingWcLoading)
    : isLeagueLoading;
    
  const refetch = () => {
    if (isWorldCup) {
      refetchFinished();
    } else {
      queryClient.invalidateQueries({ queryKey: ['league-fixtures', league?.apiLeagueId] });
    }
  };

  const [savingId, setSavingId] = useState<string | null>(null);
  const [urls, setUrls] = useState<Record<string, string>>({});

  const [savedId, setSavedId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPushing, setIsPushing] = useState<string | null>(null);
  const [extractingId, setExtractingId] = useState<string | null>(null);

  const [customTitle, setCustomTitle] = useState('🔥 قمة كروية تبدأ قريباً!');
  const [customMsg, setCustomMsg] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Auto-fill message for the next match
  useEffect(() => {
    if (upcoming.length > 0 && !customMsg) {
      const next = upcoming[0];
      setCustomMsg(`لا تفوت مشاهدة مباراة ${next.home.name} ضد ${next.away.name} بث مباشر الآن على وان تو.`);
    }
  }, [upcoming]);

  const sendPushNotification = async (matchId: string, title: string, message: string) => {
    setIsPushing(matchId);
    try {
      const { data, error } = await supabase.functions.invoke('match-alerts', {
        body: {
          title: title || '🔥 قمة كروية تبدأ قريباً!',
          message: message,
          url: 'https://one2.link'
        }
      });
      
      if (error) throw error;
      alert('تم إرسال الإشعار بنجاح لجميع المشتركين!');
    } catch (e: any) {
      console.error(e);
      alert('خطأ أثناء إرسال الإشعار. تأكد من رفع الـ Edge Function.');
    } finally {
      setIsPushing(null);
    }
  };

  const handleExtractStats = async (match: any) => {
    setExtractingId(match.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-match-stats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ matchQuery: `${match.home.name} vs ${match.away.name} World Cup 2026 match stats goalscorers cards` })
      });
      if (!res.ok) throw new Error('Failed to extract stats');
      toast({ title: 'نجاح', description: 'تم استخراج وتحديث إحصائيات المباراة عبر الذكاء الاصطناعي' });
    } catch (error: any) {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    } finally {
      setExtractingId(null);
    }
  };

  const handleForceSync = async () => {
    setIsSyncing(true);
    try {
      // Delete all cached data to force an immediate refetch from the API
      await supabase.from('api_cache').delete().neq('endpoint', 'none');
      alert('تم مسح الكاش بنجاح. سيتم طلب البيانات الجديدة من API.');
      refetch();
    } catch (e) {
      console.error('Error clearing cache', e);
      alert('حدث خطأ أثناء مسح الكاش.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSave = async (matchId: string) => {
    const url = urls[matchId];
    if (url === undefined) return;

    setSavingId(matchId);
    const { error } = await supabase.from('site_settings').upsert({ 
      key: `match_highlight_${matchId}`, 
      value_en: url,
      value_ar: url
    }, { onConflict: 'key' });
    
    setSavingId(null);
    if (error) {
      console.error(error);
      alert('حدث خطأ أثناء الحفظ. تأكد من إعداد قاعدة البيانات.');
      return;
    }
    
    setSavedId(matchId);
    setTimeout(() => setSavedId(null), 2000);
    refetch();
  };

  const handleUrlChange = (matchId: string, val: string) => {
    setUrls(prev => ({ ...prev, [matchId]: val }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold font-display">إدارة المباريات</h2>
          <p className="text-muted-foreground text-sm">أرسل إشعارات المباريات القادمة وأضف ملخصات المباريات المنتهية.</p>
        </div>
        <Button 
          variant="outline" 
          className="gap-2 border-red-500/50 text-red-500 hover:bg-red-500/10"
          onClick={handleForceSync}
          disabled={isSyncing}
        >
          <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
          تحديث إجباري (مسح الكاش)
        </Button>
      </div>

      {/* Upcoming Matches for Push Notifications */}
      <Card className="p-6 border-border bg-card/50 shadow-sm">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          إرسال إشعارات (المباراة القادمة)
        </h3>
        {isUpcomingLoading ? (
          <div className="flex justify-center py-8">
             <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : upcoming.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">لا توجد مباريات قادمة اليوم.</p>
        ) : (
          <div className="space-y-6">
            {(() => {
              const nextMatch = upcoming[0];
              return (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4 p-4 border border-border/60 rounded-lg bg-background">
                    <Badge variant="outline" className="text-xs">
                      المباراة القادمة: {new Date(nextMatch.date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                    </Badge>
                    <div className="flex items-center gap-3 font-bold">
                      <span>{nextMatch.home.name}</span>
                      <span className="text-primary">VS</span>
                      <span>{nextMatch.away.name}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-muted-foreground">عنوان الإشعار</label>
                      <Input 
                        value={customTitle} 
                        onChange={e => setCustomTitle(e.target.value)} 
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-muted-foreground">محتوى الرسالة</label>
                      <Input 
                        value={customMsg} 
                        onChange={e => setCustomMsg(e.target.value)} 
                        className="bg-background"
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={() => sendPushNotification(nextMatch.id, customTitle, customMsg)}
                    disabled={isPushing === nextMatch.id}
                    className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white w-full py-6 text-lg mt-2"
                  >
                    {isPushing === nextMatch.id ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    إرسال الإشعار الآن للمشتركين
                  </Button>
                </div>
              );
            })()}
          </div>
        )}
      </Card>

      {/* Finished Matches for Highlights */}
      <h3 className="text-lg font-bold mt-8 flex items-center gap-2">
        <Video className="h-5 w-5 text-muted-foreground" />
        أرشيف المباريات (إضافة ملخصات)
      </h3>
      <Card className="p-6 border-border bg-card/50 shadow-sm mt-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : finished.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">لا توجد مباريات منتهية حتى الآن.</p>
        ) : (
          <div className="space-y-4">
            {finished.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(match => (
              <div key={match.id} className="flex flex-col xl:flex-row items-center justify-between p-4 border border-border/60 rounded-lg bg-background gap-4">
                <div className="flex items-center gap-4 min-w-[300px]">
                  <div className="text-center w-16">
                    <Badge variant="outline">
                      {match.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 font-bold">
                    <span>{match.home.name}</span>
                    <span className="text-xl text-primary">{match.homeScore} - {match.awayScore}</span>
                    <span>{match.away.name}</span>
                  </div>
                </div>
                
                <div className="flex-1 flex items-center gap-2 w-full max-w-lg">
                  <Video className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Input 
                    placeholder="رابط الملخص (https://youtube.com/...)" 
                    dir="ltr"
                    defaultValue={match.highlight_url || ''}
                    onChange={(e) => handleUrlChange(match.id, e.target.value)}
                  />
                  <Button 
                    size="sm" 
                    onClick={() => handleSave(match.id)}
                    disabled={savingId === match.id}
                    className={`shrink-0 gap-2 ${savedId === match.id ? 'bg-green-600 hover:bg-green-700' : ''}`}
                  >
                    {savingId === match.id ? <Loader2 className="h-4 w-4 animate-spin" /> : savedId === match.id ? <CheckCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                    {savedId === match.id ? 'تم الحفظ' : 'حفظ'}
                  </Button>
                  <Button 
                    size="sm"
                    variant="secondary"
                    onClick={() => handleExtractStats(match)}
                    disabled={extractingId === match.id}
                    className="shrink-0 gap-2"
                  >
                    {extractingId === match.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                    تحليل بالذكاء
                  </Button>
                </div>
              </div>
            ))}
            
            {finished.length > itemsPerPage && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
                <Button 
                  variant="outline" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                >
                  السابق
                </Button>
                <span className="text-sm text-muted-foreground font-semibold">
                  صفحة {currentPage} من {Math.ceil(finished.length / itemsPerPage)}
                </span>
                <Button 
                  variant="outline" 
                  disabled={currentPage >= Math.ceil(finished.length / itemsPerPage)}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >
                  التالي
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
