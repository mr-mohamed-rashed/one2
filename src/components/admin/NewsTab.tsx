import { useEffect, useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import { Check, Eye, EyeOff, FileText, Loader2, Newspaper, Plus, Save, Trash2, Zap, ArrowUp, ArrowDown, Edit, Bot, Radio, ArrowLeftRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useManualNews, type ManualNewsRow, isSystemCategory, getNewsType, getNewsCategoryName, makeCategoryString } from '@/hooks/useManualNews';
import { useNewsCategories } from '@/hooks/useNewsCategories';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { toast } from '@/hooks/use-toast';
import { leaguesConfig } from '@/lib/leaguesConfig';
import { useLanguage } from '@/context/LanguageContext';

type NewsDraft = Omit<ManualNewsRow, 'id' | 'created_at'>;

const today = () => new Date().toISOString().slice(0, 10);

const blankTicker = (): NewsDraft => ({
  title_ar: '',
  title_en: '',
  excerpt_ar: '',
  excerpt_en: '',
  category: 'Ticker',
  image_url: '',
  published_at: today(),
  is_published: true,
});

const blankPulse = (): NewsDraft => ({
  title_ar: '',
  title_en: '',
  excerpt_ar: '',
  excerpt_en: '',
  category: 'Pulse',
  image_url: '',
  published_at: today(),
  is_published: true,
});

const blankBotMessage = (): NewsDraft => ({
  title_ar: '',
  title_en: '',
  excerpt_ar: '',
  excerpt_en: '',
  category: 'BotMessage',
  image_url: '',
  published_at: today(),
  is_published: true,
});

const blankArticle = (): NewsDraft => ({
  title_ar: '',
  title_en: '',
  excerpt_ar: '',
  excerpt_en: '',
  category: 'News 2026',
  image_url: '',
  published_at: today(),
  is_published: true,
});

export function NewsTab({ activeLeague = 'worldcup' }: { activeLeague?: string }) {
  const { lang } = useLanguage();
  const isAr = lang === 'ar';
  const { news, loading, save, update, remove, togglePublish, reorder } = useManualNews();
  const { settings, save: saveSetting } = useSiteSettings();
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savingSpeed, setSavingSpeed] = useState(false);
  const [tickerSpeed, setTickerSpeed] = useState('70');
  const [tickerSpeedMobile, setTickerSpeedMobile] = useState('120');
  const [ticker, setTicker] = useState(blankTicker());
  const [pulse, setPulse] = useState(blankPulse());
  const [article, setArticle] = useState(blankArticle());
  const [botMessage, setBotMessage] = useState(blankBotMessage());

  const [importing, setImporting] = useState(false);
  const [importLog, setImportLog] = useState<string[]>([]);

  const handleAutoImport = async () => {
    setImporting(true);
    setImportLog([
      'بدء الاتصال بمصادر الأخبار...',
    ]);
    
    try {
      // Fetch news from Youm7 Sports RSS via rss2json
      const response = await fetch(
        `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(
          'https://www.youm7.com/rss/Section?SectionID=298'
        )}`
      );
      
      if (!response.ok) {
        throw new Error('فشل جلب الأخبار من المصدر.');
      }
      
      const data = await response.json();
      
      if (!data?.items || data.items.length === 0) {
        setImportLog((prev) => [...prev, '⚠️ لا توجد أخبار جديدة حالياً في المصدر.']);
        setImporting(false);
        return;
      }
      
      setImportLog((prev) => [
        ...prev,
        `تم العثور على ${data.items.length} خبر في المصدر. جاري تحليل الكلمات والتصنيف...`,
      ]);

      let importedCount = 0;
      let skippedCount = 0;
      
      for (const item of data.items) {
        const titleAr = item.title || '';
        const descAr = item.description || '';
        const imageUrl = item.thumbnail || item.enclosure?.link || '';
        
        // Skip duplicate check
        const isDuplicate = news.some((existing) => existing.title_ar === titleAr);
        if (isDuplicate) {
          skippedCount++;
          continue;
        }

        // Tagging AI logic based on Arabic keyword match
        let category = 'News 2026'; // default general
        const titleLower = titleAr.toLowerCase();
        const descLower = descAr.toLowerCase();
        
        if (
          titleLower.includes('إنجلترا') || titleLower.includes('الإنجليزي') || titleLower.includes('ليفربول') || titleLower.includes('مانشستر') || titleLower.includes('أرسنال') || titleLower.includes('تشيلسي') || titleLower.includes('صلاح') || titleLower.includes('جوارديولا') || titleLower.includes('بريميرليج') ||
          descLower.includes('إنجلترا') || descLower.includes('الإنجليزي') || descLower.includes('ليفربول') || descLower.includes('مانشستر')
        ) {
          category = 'epl';
        } else if (
          titleLower.includes('إسبانيا') || titleLower.includes('الإسباني') || titleLower.includes('برشلونة') || titleLower.includes('مدريد') || titleLower.includes('ريال') || titleLower.includes('لاليغا') ||
          descLower.includes('إسبانيا') || descLower.includes('الإسباني') || descLower.includes('برشلونة') || descLower.includes('مدريد')
        ) {
          category = 'laliga';
        } else if (
          titleLower.includes('إيطاليا') || titleLower.includes('الإيطالي') || titleLower.includes('ميلان') || titleLower.includes('يوفنتوس') || titleLower.includes('إنتر') ||
          descLower.includes('إيطاليا') || descLower.includes('الإيطالي') || descLower.includes('ميلان') || descLower.includes('يوفنتوس')
        ) {
          category = 'seriea';
        } else if (
          titleLower.includes('ألمانيا') || titleLower.includes('الألماني') || titleLower.includes('بايرن') || titleLower.includes('دورتموند') ||
          descLower.includes('ألمانيا') || descLower.includes('الألماني') || descLower.includes('بايرن') || descLower.includes('دورتموند')
        ) {
          category = 'bundesliga';
        } else if (
          titleLower.includes('فرنسا') || titleLower.includes('الفرنسي') || titleLower.includes('باريس') || titleLower.includes('مبابي') ||
          descLower.includes('فرنسا') || descLower.includes('الفرنسي') || descLower.includes('باريس') || descLower.includes('مبابي')
        ) {
          category = 'ligue1';
        } else if (
          titleLower.includes('دوري أبطال') || titleLower.includes('أبطال أوروبا') || titleLower.includes('تشامبيونزليج') ||
          descLower.includes('دوري أبطال') || descLower.includes('أبطال أوروبا')
        ) {
          category = 'ucl';
        } else if (
          titleLower.includes('الأهلي') || titleLower.includes('الزمالك') || titleLower.includes('بيراميدز') || titleLower.includes('الدوري المصري') || titleLower.includes('مصر') ||
          descLower.includes('الأهلي') || descLower.includes('الزمالك') || descLower.includes('الدوري المصري') || descLower.includes('مصر')
        ) {
          category = 'epl_egypt';
        }

        const cleanDescAr = descAr.replace(/<[^>]*>/g, '').trim().slice(0, 200);

        await save({
          title_ar: titleAr,
          title_en: titleAr,
          excerpt_ar: cleanDescAr || titleAr,
          excerpt_en: cleanDescAr || titleAr,
          category: category,
          image_url: imageUrl,
          published_at: item.pubDate ? item.pubDate.slice(0, 10) : today(),
          is_published: true,
        });

        const leagueLabel = getNewsCategoryName(category);
        setImportLog((prev) => [
          ...prev,
          `✅ تم استيراد: "${titleAr.slice(0, 30)}..." وربطه بـ [${leagueLabel}]`,
        ]);
        
        importedCount++;
      }
      
      setImportLog((prev) => [
        ...prev,
        `🎉 اكتمال العملية بنجاح! تم استيراد ${importedCount} خبر جديد، وتخطي ${skippedCount} خبر مكرر.`,
      ]);
      
      toast({
        title: 'تم الاستيراد بنجاح',
        description: `تمت إضافة ${importedCount} خبر جديد وتحديث الموقع.`,
      });
    } catch (error) {
      console.error('Auto import failed:', error);
      setImportLog((prev) => [...prev, '❌ حدث خطأ أثناء الاتصال بمصادر الأخبار.']);
      toast({
        title: 'خطأ في الاستيراد',
        description: 'تأكد من اتصالك بالإنترنت وحاول مجدداً.',
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  };

  const blankTransferDraft = () => ({
    player: '',
    fee: '',
    details: '',
    leagueId: activeLeague !== 'worldcup' ? activeLeague : 'epl',
    date: today(),
  });

  const [transferDraft, setTransferDraft] = useState(blankTransferDraft());

  useEffect(() => {
    if (activeLeague !== 'worldcup') {
      setTransferDraft((prev) => ({ ...prev, leagueId: activeLeague }));
    }
  }, [activeLeague]);

  const [importingTransfers, setImportingTransfers] = useState(false);
  const [transferImportLog, setTransferImportLog] = useState<string[]>([]);

  const handleSaveTransfer = async () => {
    if (!transferDraft.player.trim()) return;
    setSaving(true);
    
    const itemData = {
      title_ar: transferDraft.player,
      title_en: transferDraft.player,
      excerpt_ar: transferDraft.details,
      excerpt_en: transferDraft.fee,
      category: `transfers:${transferDraft.leagueId}`,
      image_url: '',
      published_at: transferDraft.date,
      is_published: true,
    };

    if (editingId) {
      await update(editingId, itemData);
      setEditingId(null);
    } else {
      await save(itemData);
    }
    
    setTransferDraft({
      ...blankTransferDraft(),
      leagueId: activeLeague !== 'worldcup' ? activeLeague : 'epl'
    });
    setSaving(false);
  };

  const handleImportTransfers = async () => {
    setImportingTransfers(true);
    setTransferImportLog(['بدء جلب الانتقالات للفرق الكبرى...']);

    // List of famous teams by league
    const topTeams = [
      { id: 49, league: 'epl', name: 'Chelsea' },
      { id: 40, league: 'epl', name: 'Liverpool' },
      { id: 50, league: 'epl', name: 'Man City' },
      { id: 33, league: 'epl', name: 'Man United' },
      { id: 42, league: 'epl', name: 'Arsenal' },
      { id: 541, league: 'laliga', name: 'Real Madrid' },
      { id: 529, league: 'laliga', name: 'Barcelona' },
      { id: 530, league: 'laliga', name: 'Atletico Madrid' },
      { id: 496, league: 'seriea', name: 'Juventus' },
      { id: 489, league: 'seriea', name: 'AC Milan' },
      { id: 505, league: 'seriea', name: 'Inter Milan' },
      { id: 157, league: 'bundesliga', name: 'Bayern Munich' },
      { id: 165, league: 'bundesliga', name: 'Dortmund' },
      { id: 85, league: 'ligue1', name: 'PSG' },
      { id: 1011, league: 'epl_egypt', name: 'Al Ahly' },
      { id: 1012, league: 'epl_egypt', name: 'Zamalek' },
    ];

    try {
      let importedCount = 0;
      let skippedCount = 0;

      for (const team of topTeams) {
        setTransferImportLog((prev) => [...prev, `جاري جلب انتقالات نادي ${team.name}...`]);
        
        // Get apiKey for this league from site_settings or fallback
        const { data: apiKeySetting } = await supabase
          .from('site_settings')
          .select('value_en')
          .eq('key', `api_key_${team.league}`)
          .single();
        const apiKey = apiKeySetting?.value_en || leaguesConfig[team.league]?.apiKey || '19a3b0d1fe31969b6b6e615f1c38fccd';

        const response = await fetch(
          `https://v3.football.api-sports.io/transfers?team=${team.id}`,
          {
            method: 'GET',
            headers: {
              'x-rapidapi-host': 'v3.football.api-sports.io',
              'x-rapidapi-key': apiKey,
            },
          }
        );

        if (!response.ok) {
          setTransferImportLog((prev) => [...prev, `⚠️ فشل جلب صفقات نادي ${team.name}`]);
          continue;
        }

        const data = await response.json();
        if (data.errors && Object.keys(data.errors).length > 0) {
          console.error(`API Error for ${team.name}:`, data.errors);
          continue;
        }

        if (data.response && data.response.length > 0) {
          // Loop through player transfers
          for (const item of data.response.slice(0, 3)) { // take latest 3 players per team to save quota
            const playerName = item.player.name;
            const latestTransfer = item.transfers[0];
            if (!latestTransfer) continue;

            const date = latestTransfer.date;
            const type = latestTransfer.type || 'Free Transfer';
            const teamOut = latestTransfer.teams.out.name;
            const teamIn = latestTransfer.teams.in.name;
            
            const detailsText = `${teamOut} ➡️ ${teamIn}`;

            // Check if duplicate
            const isDuplicate = news.some(
              (existing) =>
                existing.category === `transfers:${team.league}` &&
                existing.title_ar === playerName &&
                existing.excerpt_ar === detailsText
            );

            if (isDuplicate) {
              skippedCount++;
              continue;
            }

            // Save to database
            await save({
              title_ar: playerName,
              title_en: playerName,
              excerpt_ar: detailsText,
              excerpt_en: type,
              category: `transfers:${team.league}`,
              image_url: '',
              published_at: date,
              is_published: true,
            });

            setTransferImportLog((prev) => [
              ...prev,
              `✅ انتقال رسمي: ${playerName} من ${teamOut} إلى ${teamIn} (${type})`,
            ]);
            importedCount++;
          }
        }
        
        // Wait 100ms
        await new Promise((r) => setTimeout(r, 100));
      }

      setTransferImportLog((prev) => [
        ...prev,
        `🎉 انتهى جلب الانتقالات! تم استيراد ${importedCount} صفقة جديدة، وتخطي ${skippedCount} مكررة.`,
      ]);

      toast({
        title: 'اكتمل استيراد الانتقالات',
        description: `تم استيراد ${importedCount} صفقة جديدة بنجاح.`,
      });
    } catch (err) {
      console.error('Import transfers failed:', err);
      setTransferImportLog((prev) => [...prev, '❌ فشل جلب صفقات الانتقالات.']);
    } finally {
      setImportingTransfers(false);
    }
  };

  const getLeagueCategory = (type: 'Ticker' | 'Pulse' | 'Article') => {
    if (!activeLeague || activeLeague === 'worldcup') {
      return type === 'Article' ? 'News 2026' : type;
    }
    if (type === 'Article') return activeLeague;
    return `${type}:${activeLeague}`;
  };

  const tickerItems = news.filter((item) => 
    activeLeague === 'worldcup' 
      ? item.category === 'Ticker' 
      : item.category === `Ticker:${activeLeague}`
  );
  const pulseItems = news.filter((item) => 
    activeLeague === 'worldcup' 
      ? item.category === 'Pulse' 
      : item.category === `Pulse:${activeLeague}`
  );
  const transferItems = news.filter((item) => 
    item.category === `transfers:${activeLeague}`
  );
  const articleItems = news.filter((item) => 
    activeLeague === 'worldcup'
      ? !isSystemCategory(item.category)
      : item.category === activeLeague
  );
  const botMessageItems = news.filter((item) => item.category === 'BotMessage');

  const { categories: allCategories, addCategory, deleteCategory } = useNewsCategories();

  useEffect(() => {
    setTickerSpeed(settings.find((setting) => setting.key === 'ticker_speed_seconds')?.value_en || '70');
    setTickerSpeedMobile(settings.find((setting) => setting.key === 'ticker_speed_mobile_seconds')?.value_en || '120');
  }, [settings]);

  const addItem = async (draft: NewsDraft, reset: () => void) => {
    if (!draft.title_ar.trim() && !draft.title_en.trim()) return;
    setSaving(true);

    const updatedDraft = { ...draft };
    if (draft.category === 'Ticker' || draft.category?.startsWith('Ticker:')) {
      updatedDraft.category = getLeagueCategory('Ticker');
    } else if (draft.category === 'Pulse' || draft.category?.startsWith('Pulse:')) {
      updatedDraft.category = getLeagueCategory('Pulse');
    } else if (draft.category === 'BotMessage') {
      updatedDraft.category = 'BotMessage';
    } else if (activeLeague !== 'worldcup') {
      updatedDraft.category = activeLeague;
    }

    if (editingId) {
      await update(editingId, updatedDraft);
      setEditingId(null);
    } else {
      await save(updatedDraft);
    }
    reset();
    setSaving(false);
  };

  const handleEdit = (item: ManualNewsRow, setDraft: (draft: NewsDraft) => void) => {
    const { id, created_at, post_id, ...draft } = item as any;
    setDraft({
      title_ar: draft.title_ar || '',
      title_en: draft.title_en || '',
      excerpt_ar: draft.excerpt_ar || '',
      excerpt_en: draft.excerpt_en || '',
      image_url: draft.image_url || '',
      category: draft.category || 'News 2026',
      is_published: draft.is_published ?? true,
      published_at: draft.published_at || today(),
    });
    setEditingId(item.id);
  };

  const handleDeleteCategory = async (cat: string) => {
    if (cat === 'News 2026') return;
    await deleteCategory(cat);
  };

  const handleAddCategory = async (cat: string) => {
    await addCategory(cat);
  };

  const saveTickerSpeed = async () => {
    const seconds = Math.max(25, Math.min(500, Number(tickerSpeed) || 70)).toString();
    const mobileSeconds = Math.max(25, Math.min(500, Number(tickerSpeedMobile) || 120)).toString();
    setTickerSpeed(seconds);
    setTickerSpeedMobile(mobileSeconds);
    setSavingSpeed(true);
    await saveSetting('ticker_speed_seconds', seconds, seconds);
    await saveSetting('ticker_speed_mobile_seconds', mobileSeconds, mobileSeconds);
    setSavingSpeed(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/35 bg-primary/10 text-primary shadow-neon">
          <Newspaper className="h-6 w-6" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">إدارة الأخبار</h2>
          <p className="text-sm text-muted-foreground">كل نوع خبر له طريقة إضافة ومكان ظهور مختلف في الموقع.</p>
        </div>
      </div>

      <Tabs defaultValue="ticker" className="space-y-5" onValueChange={() => {
        setEditingId(null);
        setTicker(blankTicker());
        setPulse(blankPulse());
        setArticle(blankArticle());
        setBotMessage(blankBotMessage());
      }}>
        <TabsList className="grid h-auto grid-cols-1 gap-2 bg-card p-1 sm:grid-cols-6">
          <TabsTrigger value="ticker" className="gap-2 py-3">
            <Zap className="h-4 w-4" />
            الشريط
          </TabsTrigger>
          <TabsTrigger value="articles" className="gap-2 py-3">
            <FileText className="h-4 w-4" />
            صفحة الأخبار
          </TabsTrigger>
          <TabsTrigger value="pulse" className="gap-2 py-3">
            <Newspaper className="h-4 w-4" />
            نبض 2026
          </TabsTrigger>
          <TabsTrigger value="transfers" className="gap-2 py-3">
            <ArrowLeftRight className="h-4 w-4" />
            الانتقالات
          </TabsTrigger>
          <TabsTrigger value="bots" className="gap-2 py-3">
            <Bot className="h-4 w-4" />
            رسائل البوت
          </TabsTrigger>
          <TabsTrigger value="auto-import" className="gap-2 py-3 text-primary border border-primary/20 hover:bg-primary/5">
            <Radio className="h-4 w-4 animate-pulse" />
            سحب الأخبار تلقائياً
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ticker" className="space-y-4">
          <Card className="border-primary/25 bg-gradient-card p-5">
            <SectionTitle
              title="شريط الأخبار"
              description="سطر قصير يظهر في شريط الأخبار المتحرك. اكتب السطر واضغط حفظ."
            />
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <div className="flex-1 flex gap-3">
                <Field label="نص الشريط الإخباري" className="flex-1">
                  <Input
                    value={ticker.title_ar}
                    onChange={(event) => setTicker((current) => ({ ...current, title_ar: event.target.value }))}
                    className="h-11 font-arabic text-right"
                    dir="rtl"
                    placeholder="مثال: قرعة نارية في دور المجموعات..."
                  />
                </Field>
                <div className="w-[180px] shrink-0">
                  <CategorySelector 
                    value={getNewsCategoryName(ticker.category)}
                    onChange={(val) => setTicker((current) => ({ ...current, category: makeCategoryString('Ticker', val) }))}
                    onDelete={handleDeleteCategory}
                    categories={allCategories}
                  />
                </div>
              </div>
              <Button
                onClick={() => addItem(ticker, () => setTicker(blankTicker()))}
                disabled={saving || !ticker.title_ar.trim()}
                className="h-11 gap-2 font-semibold"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {editingId ? 'تعديل السطر' : 'حفظ السطر'}
              </Button>
              {editingId && (
                <Button variant="outline" className="h-11 font-semibold" onClick={() => { setEditingId(null); setTicker(blankTicker()); }}>
                  إلغاء
                </Button>
              )}
            </div>
            <div className="mt-3 flex flex-col gap-2 rounded-lg border border-border bg-background/40 p-3 sm:flex-row sm:items-end">
              <Field label="سرعة الكمبيوتر (ثواني)" className="sm:w-48">
                <Input
                  type="number"
                  min={25}
                  max={500}
                  value={tickerSpeed}
                  onChange={(event) => setTickerSpeed(event.target.value)}
                  className="h-10 text-center"
                  dir="ltr"
                />
              </Field>
              <Field label="سرعة الموبايل (ثواني)" className="sm:w-48">
                <Input
                  type="number"
                  min={25}
                  max={500}
                  value={tickerSpeedMobile}
                  onChange={(event) => setTickerSpeedMobile(event.target.value)}
                  className="h-10 text-center"
                  dir="ltr"
                />
              </Field>
              <Button
                type="button"
                variant="outline"
                onClick={saveTickerSpeed}
                disabled={savingSpeed}
                className="h-10 gap-2"
              >
                {savingSpeed ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                حفظ السرعة
              </Button>
              <p className="pb-2 text-xs text-muted-foreground">رقم أقل = حركة أسرع. أقصى رقم 500.</p>
            </div>
          </Card>
          <NewsList items={tickerItems} empty="لا توجد سطور في الشريط حتى الآن." onRemove={remove} onToggle={togglePublish} onReorder={reorder} onEdit={(item) => handleEdit(item, setTicker)} />
        </TabsContent>

        <TabsContent value="articles" className="space-y-4">
          <Card className="border-primary/25 bg-gradient-card p-5">
            <SectionTitle
              title="أخبار صفحة الأخبار"
              description="خبر كامل له عنوان وتفاصيل وصورة. لو عندك مصدر خارجي أو صفحة تفاصيل طويلة حط الرابط في خانة اللينك."
            />
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {activeLeague === 'worldcup' && (
                <div className="sm:col-span-2 pb-2 border-b border-border/50">
                  <CategorySelector 
                    value={getNewsCategoryName(article.category)}
                    onChange={(val) => setArticle((current) => ({ ...current, category: makeCategoryString('Article', val) }))}
                    onAdd={handleAddCategory}
                    onDelete={handleDeleteCategory}
                    categories={allCategories}
                    showAdd={true}
                  />
                </div>
              )}
              <Field label="عنوان الخبر" className="sm:col-span-2">
                <Input
                  value={article.title_ar}
                  onChange={(event) => setArticle((current) => ({ ...current, title_ar: event.target.value }))}
                  className="h-10 font-arabic text-right"
                  dir="rtl"
                  placeholder="عنوان الخبر..."
                />
              </Field>
              <Field label="تفاصيل الخبر" className="sm:col-span-2">
                <Textarea
                  value={article.excerpt_ar}
                  onChange={(event) => setArticle((current) => ({ ...current, excerpt_ar: event.target.value }))}
                  rows={5}
                  className="resize-none font-arabic text-right"
                  dir="rtl"
                  placeholder="اكتب تفاصيل الخبر هنا..."
                />
              </Field>
              <Field label="رابط الصورة">
                <Input
                  value={article.image_url}
                  onChange={(event) => setArticle((current) => ({ ...current, image_url: event.target.value }))}
                  className="h-10"
                  dir="ltr"
                  placeholder="https://..."
                />
              </Field>
              <Field label="لينك صفحة الخبر أو المصدر">
                <Input
                  value={article.excerpt_en}
                  onChange={(event) => setArticle((current) => ({ ...current, excerpt_en: event.target.value }))}
                  className="h-10"
                  dir="ltr"
                  placeholder="https://... اختياري"
                />
              </Field>
              <Field label="English title اختياري">
                <Input
                  value={article.title_en}
                  onChange={(event) => setArticle((current) => ({ ...current, title_en: event.target.value }))}
                  className="h-10"
                  dir="ltr"
                  placeholder="Optional"
                />
              </Field>
              <PublishSwitch value={article.is_published} onChange={(value) => setArticle((current) => ({ ...current, is_published: value }))} />
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                onClick={() => addItem(article, () => setArticle(blankArticle()))}
                disabled={saving || !article.title_ar.trim()}
                className="gap-2 font-semibold"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : (editingId ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />)}
                {editingId ? 'تعديل الخبر' : 'حفظ الخبر'}
              </Button>
              {editingId && (
                <Button variant="outline" className="font-semibold" onClick={() => { setEditingId(null); setArticle(blankArticle()); }}>
                  إلغاء
                </Button>
              )}
            </div>
          </Card>
          <NewsList items={articleItems} empty="لا توجد أخبار كاملة حتى الآن." onRemove={remove} onToggle={togglePublish} onReorder={reorder} onEdit={(item) => handleEdit(item, setArticle)} />
        </TabsContent>

        <TabsContent value="pulse" className="space-y-4">
          <Card className="border-primary/25 bg-gradient-card p-5">
            <SectionTitle
              title="نبض 2026"
              description="كارت خفيف في الرئيسية: عنوان قصير وتايتل/تصنيف فقط."
            />
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label="عنوان النبض" className="sm:col-span-1">
                <Input
                  value={pulse.title_ar}
                  onChange={(event) => setPulse((current) => ({ ...current, title_ar: event.target.value }))}
                  className="h-11 font-arabic text-right"
                  dir="rtl"
                  placeholder="مثال: صلاح ومرموش يقودان مصر..."
                />
              </Field>
              <Field label="التاج الإنجليزي (اختياري)" className="sm:col-span-1">
                <Input
                  value={pulse.title_en}
                  onChange={(event) => setPulse((current) => ({ ...current, title_en: event.target.value }))}
                  className="h-11"
                  dir="ltr"
                  placeholder="Title / tag"
                />
              </Field>
              <div className="sm:col-span-1">
                <CategorySelector 
                  value={getNewsCategoryName(pulse.category)}
                  onChange={(val) => setPulse((current) => ({ ...current, category: makeCategoryString('Pulse', val) }))}
                  onDelete={handleDeleteCategory}
                  categories={allCategories}
                />
              </div>
              <div className="flex gap-2 sm:col-span-2">
                <Button
                  onClick={() => addItem(pulse, () => setPulse(blankPulse()))}
                  disabled={saving || !pulse.title_ar.trim()}
                  className="h-11 flex-1 gap-2 font-semibold"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {editingId ? 'تعديل' : 'حفظ'}
                </Button>
                {editingId && (
                  <Button variant="outline" className="h-11 font-semibold" onClick={() => { setEditingId(null); setPulse(blankPulse()); }}>
                    إلغاء
                  </Button>
                )}
              </div>
            </div>
          </Card>
          <NewsList items={pulseItems} empty="لا توجد عناصر في نبض 2026 حتى الآن." onRemove={remove} onToggle={togglePublish} onReorder={reorder} onEdit={(item) => handleEdit(item, setPulse)} />
        </TabsContent>

        <TabsContent value="transfers" className="space-y-4">
          <Card className="border-primary/25 bg-gradient-card p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-4">
              <SectionTitle
                title="إدارة صفقات الانتقالات"
                description="إضافة وتعديل صفقات الانتقالات الرسمية للدوريات المختلفة يدوياً أو استيرادها تلقائياً."
              />
              
              <Button 
                onClick={handleImportTransfers}
                disabled={importingTransfers}
                variant="outline"
                className="h-10 text-primary border-primary/30 hover:bg-primary/5 font-bold gap-2 shrink-0 self-start"
              >
                {importingTransfers ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    جاري السحب...
                  </>
                ) : (
                  <>
                    <Radio className="h-4 w-4 animate-pulse" />
                    استيراد صفقات الكبار تلقائياً
                  </>
                )}
              </Button>
            </div>

            {transferImportLog.length > 0 && (
              <div className="mt-4 rounded-xl border border-white/10 bg-black/60 p-4 font-mono text-xs text-start space-y-1 max-h-40 overflow-y-auto">
                <div className="text-muted-foreground font-arabic font-bold text-xs pb-1 border-b border-white/5 mb-1">
                  سجل استيراد صفقات الكبار:
                </div>
                {transferImportLog.map((log, idx) => (
                  <div 
                    key={idx} 
                    className={cn(
                      "leading-relaxed font-arabic",
                      log.startsWith('✅') && "text-green-400 font-semibold",
                      log.startsWith('❌') && "text-red-400 font-semibold",
                      log.startsWith('⚠️') && "text-yellow-400 font-semibold",
                      log.startsWith('🎉') && "text-primary font-extrabold mt-1"
                    )}
                  >
                    {log}
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="اسم اللاعب">
                  <Input
                    value={transferDraft.player}
                    onChange={(e) => setTransferDraft(prev => ({ ...prev, player: e.target.value }))}
                    placeholder="مثال: كيليان مبابي"
                    className="h-11 text-right"
                  />
                </Field>
                <Field label="قيمة الصفقة / نوع الانتقال">
                  <Input
                    value={transferDraft.fee}
                    onChange={(e) => setTransferDraft(prev => ({ ...prev, fee: e.target.value }))}
                    placeholder="مثال: €150M أو انتقال حر"
                    className="h-11 text-right"
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="تفاصيل الانتقال (من نادي ➡️ إلى نادي)">
                  <Input
                    value={transferDraft.details}
                    onChange={(e) => setTransferDraft(prev => ({ ...prev, details: e.target.value }))}
                    placeholder="مثال: باريس سان جيرمان ➡️ ريال مدريد"
                    className="h-11 text-right"
                  />
                </Field>
                {activeLeague === 'worldcup' && (
                  <Field label="الدوري المعني">
                    <Select
                      value={transferDraft.leagueId}
                      onValueChange={(val) => setTransferDraft(prev => ({ ...prev, leagueId: val }))}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="اختر الدوري" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(leaguesConfig).map((l) => (
                          <SelectItem key={l.id} value={l.id}>
                            {isAr ? l.nameAr : l.nameEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="تاريخ الصفقة">
                  <Input
                    type="date"
                    value={transferDraft.date}
                    onChange={(e) => setTransferDraft(prev => ({ ...prev, date: e.target.value }))}
                    className="h-11"
                  />
                </Field>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <Button 
                  onClick={handleSaveTransfer} 
                  disabled={saving || !transferDraft.player.trim()}
                  className="h-11 px-6 font-bold bg-primary text-primary-foreground hover:bg-primary-glow"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {editingId ? 'تعديل الصفقة' : 'حفظ الصفقة'}
                </Button>
                {editingId && (
                  <Button variant="outline" className="h-11 font-semibold" onClick={() => { setEditingId(null); setTransferDraft(blankTransferDraft()); }}>
                    إلغاء
                  </Button>
                )}
              </div>
            </div>
          </Card>
          
          <NewsList 
            items={transferItems} 
            empty="لا توجد صفقات انتقالات مضافة حالياً." 
            onRemove={remove} 
            onToggle={togglePublish} 
            onReorder={reorder} 
            onEdit={(item) => {
              setEditingId(item.id);
              const leagueId = item.category.replace('transfers:', '');
              setTransferDraft({
                player: item.title_ar || '',
                fee: item.excerpt_en || '',
                details: item.excerpt_ar || '',
                leagueId: leagueId,
                date: item.published_at || today(),
              });
            }} 
          />
        </TabsContent>

        <TabsContent value="bots" className="space-y-4">
          <Card className="border-primary/25 bg-gradient-card p-5">
            <SectionTitle
              title="رسائل الروبوتات"
              description="هنا تضع الروابط والرسائل التي تريد أن ترددها الروبوتات في الشات."
            />
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="نص الرسالة (مثال: ماتش الأهلي شغال هنا)" className="sm:col-span-2">
                <Input
                  value={botMessage.title_ar}
                  onChange={(event) => setBotMessage((current) => ({ ...current, title_ar: event.target.value }))}
                  className="h-11 font-arabic text-right"
                  dir="rtl"
                  placeholder="ماتش الأهلي والزمالك شغال هنا بدون تقطيع..."
                />
              </Field>
              <Field label="الرابط الخارجي أو الداخلي للمباراة" className="sm:col-span-2">
                <Input
                  value={botMessage.excerpt_en}
                  onChange={(event) => setBotMessage((current) => ({ ...current, excerpt_en: event.target.value }))}
                  className="h-11"
                  dir="ltr"
                  placeholder="https://tiki-taka.cc/..."
                />
              </Field>
              <div className="flex gap-2 sm:col-span-2">
                <Button
                  onClick={() => addItem(botMessage, () => setBotMessage(blankBotMessage()))}
                  disabled={saving || !botMessage.title_ar.trim() || !botMessage.excerpt_en.trim()}
                  className="h-11 flex-1 gap-2 font-semibold"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {editingId ? 'تعديل' : 'حفظ'}
                </Button>
                {editingId && (
                  <Button variant="outline" className="h-11 font-semibold" onClick={() => { setEditingId(null); setBotMessage(blankBotMessage()); }}>
                    إلغاء
                  </Button>
                )}
              </div>
            </div>
          </Card>
          <NewsList items={botMessageItems} empty="لا توجد رسائل للروبوتات حتى الآن." onRemove={remove} onToggle={togglePublish} onReorder={reorder} onEdit={(item) => handleEdit(item, setBotMessage)} />
        </TabsContent>

        <TabsContent value="auto-import" className="space-y-4">
          <Card className="border-primary/25 bg-gradient-card p-5">
            <SectionTitle
              title="سحب الأخبار تلقائياً"
              description="سحب وجلب أحدث الأخبار الرياضية العربية من مصادر موثوقة (اليوم السابع)، وتصنيفها أوتوماتيكياً لكل دوري بناءً على الكلمات المفتاحية."
            />
            
            <div className="mt-6 space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Button 
                  onClick={handleAutoImport} 
                  disabled={importing} 
                  className="h-12 bg-primary text-primary-foreground hover:bg-primary-glow font-bold shadow-neon gap-2"
                >
                  {importing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      جاري سحب وتصنيف الأخبار...
                    </>
                  ) : (
                    <>
                      <Radio className="h-5 w-5 animate-pulse" />
                      بدء السحب والتصنيف التلقائي
                    </>
                  )}
                </Button>
                
                <span className="text-xs text-muted-foreground font-arabic">
                  * يقوم النظام بالتحقق تلقائياً من الأخبار المكررة لعدم استيرادها مرتين.
                </span>
              </div>

              {importLog.length > 0 && (
                <div className="mt-4 rounded-xl border border-white/10 bg-black/60 p-4 font-mono text-xs text-start space-y-2 h-64 overflow-y-auto">
                  <div className="text-muted-foreground border-b border-white/5 pb-2 font-arabic font-bold text-sm">
                    سجل عملية الاستيراد:
                  </div>
                  {importLog.map((log, idx) => (
                    <div 
                      key={idx} 
                      className={cn(
                        "leading-relaxed font-arabic",
                        log.startsWith('✅') && "text-green-400 font-semibold",
                        log.startsWith('❌') && "text-red-400 font-semibold",
                        log.startsWith('⚠️') && "text-yellow-400 font-semibold",
                        log.startsWith('🎉') && "text-primary text-sm font-extrabold mt-2"
                      )}
                    >
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SectionTitle({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h3 className="font-display text-xl font-extrabold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function CategorySelector({
  value,
  onChange,
  onAdd,
  onDelete,
  categories,
  showAdd = false
}: {
  value: string;
  onChange: (val: string) => void;
  onAdd?: (val: string) => void;
  onDelete?: (val: string) => void;
  categories: string[];
  showAdd?: boolean;
}) {
  const [customVal, setCustomVal] = useState('');
  
  const selectNode = (
    <Field label="التصنيف">
      <div className="flex gap-2">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="h-10 flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {onDelete && value !== 'News 2026' && (
          <Button 
            type="button"
            variant="destructive"
            size="icon"
            className="h-10 w-10 shrink-0"
            onClick={() => {
              if (window.confirm('هل أنت متأكد من حذف هذا التصنيف ونقل كل أخباره للأساسي؟')) {
                onDelete(value);
              }
            }}
            title="حذف التصنيف"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Field>
  );

  if (!showAdd) {
    return selectNode;
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 w-full">
      {selectNode}
      <Field label="إضافة تصنيف جديد">

        <div className="flex gap-2">
          <Input
            value={customVal}
            onChange={e => setCustomVal(e.target.value)}
            placeholder="مثال: الدوري الإنجليزي"
            className="h-10 flex-1 font-arabic"
            dir="rtl"
          />
          <Button 
            type="button"
            variant="secondary"
            className="h-10 shrink-0 font-semibold"
            onClick={() => {
              if (customVal.trim()) {
                if (onAdd) onAdd(customVal.trim());
                onChange(customVal.trim());
                setCustomVal('');
              }
            }}
          >
            إضافة
          </Button>
        </div>
      </Field>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function PublishSwitch({ value, onChange }: { value: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-background/50 px-3 py-2">
      <div>
        <p className="text-sm font-semibold">نشر الآن</p>
        <p className="text-xs text-muted-foreground">اقفلها لو عايزه مسودة.</p>
      </div>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}

function NewsList({
  items,
  empty,
  onRemove,
  onToggle,
  onReorder,
  onEdit,
}: {
  items: ManualNewsRow[];
  empty: string;
  onRemove: (id: string) => Promise<void>;
  onToggle: (id: string, isPublished: boolean) => Promise<void>;
  onReorder: (id1: string, id2: string, createdAt1: string, createdAt2: string) => Promise<void>;
  onEdit?: (item: ManualNewsRow) => void;
}) {
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  if (items.length === 0) {
    return <Card className="p-8 text-center text-sm text-muted-foreground">{empty}</Card>;
  }

  const totalPages = Math.ceil(items.length / PAGE_SIZE);
  const safePage = Math.min(page, Math.max(1, totalPages));
  const visibleItems = items.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="space-y-3">
      {visibleItems.map((item, index) => {
        const actualIndex = (safePage - 1) * PAGE_SIZE + index;
        return (
        <Card key={item.id} className={`border-border bg-card/70 p-4 ${!item.is_published ? 'opacity-65' : ''}`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="flex flex-row sm:flex-col gap-1 items-center justify-center">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                disabled={actualIndex === 0}
                onClick={() => onReorder(item.id, items[actualIndex - 1].id, item.created_at, items[actualIndex - 1].created_at)}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                disabled={actualIndex === items.length - 1}
                onClick={() => onReorder(item.id, items[actualIndex + 1].id, item.created_at, items[actualIndex + 1].created_at)}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>
            {item.image_url && (
              <img
                src={item.image_url}
                alt={item.title_ar || item.title_en}
                className="h-20 w-full rounded-lg border border-border object-cover sm:w-28"
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge className="bg-primary/15 text-primary hover:bg-primary/20">{item.category}</Badge>
                <Badge variant={item.is_published ? 'default' : 'outline'} className="gap-1">
                  {item.is_published ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  {item.is_published ? 'ظاهر' : 'مسودة'}
                </Badge>
                <span className="text-xs text-muted-foreground" dir="ltr">{item.published_at}</span>
              </div>
              <h3 className="font-arabic text-base font-bold leading-7 text-foreground">{item.title_ar || item.title_en}</h3>
              {item.excerpt_ar && <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">{item.excerpt_ar}</p>}
              {item.excerpt_en?.startsWith('http') && (
                <p className="mt-2 truncate text-xs text-primary" dir="ltr">{item.excerpt_en}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={item.is_published} onCheckedChange={(value) => onToggle(item.id, value)} />
              {onEdit && (
                <Button
                  size="icon"
                  variant="outline"
                  className="h-9 w-9 text-primary hover:text-primary"
                  onClick={() => {
                    onEdit(item);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              <Button
                size="icon"
                variant="outline"
                className="h-9 w-9 text-destructive hover:text-destructive"
                onClick={() => onRemove(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
        );
      })}
      
      {totalPages > 1 && (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-border bg-card/60 p-3">
          <div className="text-sm text-muted-foreground font-arabic">
            صفحة {safePage} من {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={safePage === totalPages}
              onClick={() => setPage(safePage + 1)}
              className="gap-1 h-9 px-3"
            >
              السابق
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={safePage === 1}
              onClick={() => setPage(safePage - 1)}
              className="gap-1 h-9 px-3"
            >
              التالي
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
