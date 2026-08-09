import { useState, useEffect } from 'react';
import { Loader2, Plus, Save, Trash2, Edit, Trophy, Target, Award, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNewsCategories } from '@/hooks/useNewsCategories';
import { getCountryFlag } from '@/lib/flags';
import { leaguesConfig } from '@/lib/leaguesConfig';

interface PlayerStat {
  id: string;
  player_name: string;
  team_name: string;
  tournament: string;
  goals: number;
  assists?: number;
  yellow_cards?: number;
  red_cards?: number;
  motm_awards?: number;
}

type TabType = 'goals' | 'assists' | 'motm' | 'cards';

export function TopScorersTab({ activeLeague = 'worldcup' }: { activeLeague?: string }) {
  const { categories } = useNewsCategories();
  const [scorers, setScorers] = useState<PlayerStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [tournament, setTournament] = useState('كأس العالم 2026');
  
  useEffect(() => {
    if (activeLeague === 'worldcup') {
      setTournament('كأس العالم 2026');
    } else {
      const league = Object.values(leaguesConfig).find((l) => l.id === activeLeague);
      if (league) {
        setTournament(league.nameAr);
      }
    }
  }, [activeLeague]);

  const [activeTab, setActiveTab] = useState<TabType>('goals');
  
  const [bulkTexts, setBulkTexts] = useState<Record<TabType, string>>({
    goals: '',
    assists: '',
    motm: '',
    cards: ''
  });
  const [bulking, setBulking] = useState(false);

  const [form, setForm] = useState({
    player_name: '',
    team_name: '',
    goals: 0,
    assists: 0,
    yellow_cards: 0,
    red_cards: 0,
    motm_awards: 0
  });

  const handleBulkInsert = async () => {
    const text = bulkTexts[activeTab];
    if (!text || !tournament.trim()) {
      toast({ title: 'يرجى التأكد من إدخال نوع البطولة والنص', variant: 'destructive' });
      return;
    }
    
    setBulking(true);
    try {
      const cleanText = text.replace(/\s+/g, ' ');
      
      const findMarker = (txt: string, marker: string, startFrom: number) => {
        let pos = startFrom;
        while (true) {
          pos = txt.indexOf(marker, pos);
          if (pos === -1) return -1;
          const after = txt.slice(pos + marker.length, pos + marker.length + 1);
          if (/[\u0600-\u06FFa-zA-Z]/.test(after)) {
            return pos;
          }
          pos += 1;
        }
      };

      const parsedPlayers: any[] = [];
      let lastFoundIndex = 0;

      for (let i = 1; i <= 145; i++) {
        const currentMarker = i.toString();
        const nextMarker = (i + 1).toString();
        
        const startIdx = findMarker(cleanText, currentMarker, lastFoundIndex);
        if (startIdx === -1) continue;
        
        lastFoundIndex = startIdx + currentMarker.length;
        
        let endIdx = findMarker(cleanText, nextMarker, lastFoundIndex);
        if (i === 145) {
          endIdx = cleanText.length;
        }
        
        if (endIdx === -1) continue;
        
        const segment = cleanText.slice(startIdx + currentMarker.length, endIdx).trim();
        const statMatch = segment.match(/(\d+)$/);
        if (!statMatch) continue;
        
        const statValue = parseInt(statMatch[1]);
        const rest = segment.slice(0, segment.length - statMatch[1].length).trim();
        
        let teamName = "";
        let playerName = "";
        
        let found = false;
        for (let len = Math.floor(rest.length / 2); len >= 2; len--) {
           const suffix = rest.slice(-len).trim();
           if (!suffix) continue;
           
           const stringWithoutSuffix = rest.slice(0, rest.lastIndexOf(suffix));
           if (stringWithoutSuffix.trim().endsWith(suffix)) {
               teamName = suffix;
               playerName = stringWithoutSuffix.slice(0, stringWithoutSuffix.lastIndexOf(suffix)).trim();
               found = true;
               break;
           }
        }
        
        if (!found) {
          teamName = rest.slice(Math.floor(rest.length * 0.5)).trim();
          playerName = rest.slice(0, Math.floor(rest.length * 0.5)).trim();
        }
        
        // Clean duplicate team names
        teamName = teamName
          .replace(/(السنغال)\s*(السنغال)?/g, '$1')
          .replace(/(المغرب)\s*(المغرب)?/g, '$1')
          .replace(/(جنوب أفريقيا)\s*(جنوب أفريقيا)?/g, '$1')
          .replace(/(الكونغو الديمقراطية)\s*(الكونغو الديمقراطية)?/g, '$1')
          .replace(/(البوسنة والهرسك)\s*(البوسنة والهرسك)?/g, '$1')
          .replace(/(ألمانيا)\s*(ألمانيا)?/g, '$1')
          .replace(/(الأرجنتين)\s*(الأرجنتين)?/g, '$1')
          .replace(/(فرنسا)\s*(فرنسا)?/g, '$1')
          .replace(/(السويد)\s*(السويد)?/g, '$1');
          
        if (playerName === 'الفارو فيد' && teamName === 'الغوالمكسيك') {
          playerName = 'الفارو فيدالغو';
          teamName = 'المكسيك';
        }
        if (playerName === 'جاسم ياسينا' && teamName === 'لمغرب المغرب') {
          playerName = 'جاسم ياسين';
          teamName = 'المغرب';
        }

        const payload: any = {
          player_name: playerName,
          team_name: teamName,
          goals: 0,
          assists: 0,
          yellow_cards: 0,
          red_cards: 0,
          motm_awards: 0
        };

        if (activeTab === 'goals') {
          payload.goals = statValue;
        } else if (activeTab === 'assists') {
          payload.assists = statValue;
        } else if (activeTab === 'motm') {
          payload.motm_awards = statValue;
        } else if (activeTab === 'cards') {
          const numStr = statValue.toString();
          if (numStr.length === 1) {
            payload.yellow_cards = parseInt(numStr);
          } else if (numStr.length >= 2) {
            payload.yellow_cards = parseInt(numStr[0]);
            payload.red_cards = parseInt(numStr.substring(1));
          }
        }

        parsedPlayers.push(payload);
      }

      if (parsedPlayers.length === 0) {
        toast({ title: 'لم يتم العثور على أي بيانات لتسجيلها', variant: 'destructive' });
        setBulking(false);
        return;
      }

      // Safe Upsert logic
      const { data: existingPlayers } = await supabase
        .from('player_stats')
        .select('*')
        .eq('tournament', tournament);
        
      const allPlayersPayloads = new Map();
      
      // Step 1: Zero out the current stat for all players in this tournament
      (existingPlayers || []).forEach(p => {
        const payload = { ...p, tournament };
        if (activeTab === 'goals') payload.goals = 0;
        else if (activeTab === 'assists') payload.assists = 0;
        else if (activeTab === 'motm') payload.motm_awards = 0;
        else if (activeTab === 'cards') {
          payload.yellow_cards = 0;
          payload.red_cards = 0;
        }
        allPlayersPayloads.set(`${p.player_name}-${p.team_name}`, payload);
      });
      
      // Step 2: Apply the newly parsed values
      parsedPlayers.forEach(p => {
        const key = `${p.player_name}-${p.team_name}`;
        let payload = allPlayersPayloads.get(key);
        if (!payload) {
           payload = {
             player_name: p.player_name,
             team_name: p.team_name,
             tournament: tournament,
             goals: 0, assists: 0, yellow_cards: 0, red_cards: 0, motm_awards: 0
           };
           allPlayersPayloads.set(key, payload);
        }
        
        if (activeTab === 'goals') payload.goals = p.goals;
        else if (activeTab === 'assists') payload.assists = p.assists;
        else if (activeTab === 'motm') payload.motm_awards = p.motm_awards;
        else if (activeTab === 'cards') {
          payload.yellow_cards = p.yellow_cards;
          payload.red_cards = p.red_cards;
        }
      });
      
      const finalPayloads = Array.from(allPlayersPayloads.values());
      
      // Step 3: Garbage collect players that dropped to all zeros
      const validPayloads = finalPayloads.filter(p => 
        p.goals > 0 || p.assists > 0 || p.yellow_cards > 0 || p.red_cards > 0 || p.motm_awards > 0
      );
      
      const playersToDelete = finalPayloads.filter(p => 
        p.id && (p.goals || 0) === 0 && (p.assists || 0) === 0 && 
        (p.yellow_cards || 0) === 0 && (p.red_cards || 0) === 0 && (p.motm_awards || 0) === 0
      );
      
      if (playersToDelete.length > 0) {
        for (let i = 0; i < playersToDelete.length; i += 50) {
          const chunk = playersToDelete.slice(i, i + 50).map(p => p.id);
          await supabase.from('player_stats').delete().in('id', chunk);
        }
      }
      
      // Step 4: Upsert existing players and Insert new players separately
      const playersToUpdate = validPayloads.filter(p => p.id);
      const playersToInsert = validPayloads.filter(p => !p.id);

      if (playersToUpdate.length > 0) {
        for (let i = 0; i < playersToUpdate.length; i += 50) {
          const chunk = playersToUpdate.slice(i, i + 50);
          const { error } = await supabase.from('player_stats').upsert(chunk);
          if (error) {
            console.error('Error updating chunk:', error);
            toast({ title: 'فشل تحديث البيانات', description: error.message, variant: 'destructive' });
          }
        }
      }

      if (playersToInsert.length > 0) {
        for (let i = 0; i < playersToInsert.length; i += 50) {
          const chunk = playersToInsert.slice(i, i + 50);
          const { error } = await supabase.from('player_stats').insert(chunk);
          if (error) {
            console.error('Error inserting chunk:', error);
            toast({ title: 'فشل إدخال البيانات الجديدة', description: error.message, variant: 'destructive' });
          }
        }
      }
      
      toast({ title: `تم تحديث وإعادة ترتيب قائمة ${getTabName(activeTab)} بنجاح!` });
      setBulkTexts(prev => ({ ...prev, [activeTab]: '' }));
      fetchScorers();
    } catch (e: any) {
      toast({ title: 'حدث خطأ أثناء المعالجة والحفظ', description: e.message, variant: 'destructive' });
    }
    setBulking(false);
  };

  const fetchScorers = async () => {
    setLoading(true);
    let query = supabase
      .from('player_stats')
      .select('id, player_name, team_name, goals, assists, yellow_cards, red_cards, motm_awards, tournament')
      .eq('tournament', tournament);
      
    if (activeTab === 'goals') query = query.order('goals', { ascending: false });
    else if (activeTab === 'assists') query = query.order('assists', { ascending: false });
    else if (activeTab === 'motm') query = query.order('motm_awards', { ascending: false });
    else if (activeTab === 'cards') query = query.order('red_cards', { ascending: false }).order('yellow_cards', { ascending: false });
      
    const { data, error } = await query;
      
    if (error) {
      console.error('Error fetching scorers:', error);
    } else {
      // Filter the UI list to only show players relevant to the active tab
      const filtered = (data || []).filter(p => {
        if (activeTab === 'goals') return p.goals > 0;
        if (activeTab === 'assists') return p.assists > 0;
        if (activeTab === 'motm') return p.motm_awards > 0;
        if (activeTab === 'cards') return p.yellow_cards > 0 || p.red_cards > 0;
        return true;
      });
      setScorers(filtered);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchScorers();
  }, [tournament, activeTab]);

  const handleSubmit = async () => {
    if (!form.player_name || !form.team_name || !tournament) {
      toast({ title: 'تأكد من إدخال اسم اللاعب والمنتخب ونوع البطولة', variant: 'destructive' });
      return;
    }
    setSaving(true);
    
    const payload = { ...form, tournament };
    
    if (editingId) {
      const { error } = await supabase
        .from('player_stats')
        .update(payload)
        .eq('id', editingId);
        
      if (error) {
        toast({ title: 'فشل التعديل', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'تم التعديل بنجاح' });
        setEditingId(null);
        resetForm();
        fetchScorers();
      }
    } else {
      const { data: existing } = await supabase
        .from('player_stats')
        .select('id')
        .eq('player_name', form.player_name)
        .eq('team_name', form.team_name)
        .eq('tournament', tournament)
        .maybeSingle();
        
      if (existing) {
        const { error } = await supabase
          .from('player_stats')
          .update(payload)
          .eq('id', existing.id);
          
        if (error) {
          toast({ title: 'فشل تحديث بيانات اللاعب', description: error.message, variant: 'destructive' });
        } else {
          toast({ title: 'تم تحديث بيانات اللاعب الحالي بنجاح' });
          resetForm();
          fetchScorers();
        }
      } else {
        const { error } = await supabase
          .from('player_stats')
          .insert([payload]);
          
        if (error) {
          toast({ title: 'فشل الإضافة', description: error.message, variant: 'destructive' });
        } else {
          toast({ title: 'تمت الإضافة بنجاح' });
          resetForm();
          fetchScorers();
        }
      }
    }
    setSaving(false);
  };

  const resetForm = () => {
    setForm({ player_name: '', team_name: '', goals: 0, assists: 0, yellow_cards: 0, red_cards: 0, motm_awards: 0 });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    const { error } = await supabase.from('player_stats').delete().eq('id', id);
    if (error) {
      toast({ title: 'فشل الحذف', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'تم الحذف' });
      fetchScorers();
    }
  };

  const startEdit = (scorer: PlayerStat) => {
    setEditingId(scorer.id);
    setForm({
      player_name: scorer.player_name,
      team_name: scorer.team_name,
      goals: scorer.goals || 0,
      assists: scorer.assists || 0,
      yellow_cards: scorer.yellow_cards || 0,
      red_cards: scorer.red_cards || 0,
      motm_awards: scorer.motm_awards || 0
    });
  };

  const getTabName = (tab: TabType) => {
    switch (tab) {
      case 'goals': return 'الهدافين';
      case 'assists': return 'صناع اللعب';
      case 'motm': return 'أفضل لاعب';
      case 'cards': return 'البطاقات';
    }
  };

  return (
    <div className="space-y-4">
      {activeLeague === 'worldcup' && (
        <Card className="border-primary/50 bg-gradient-to-r from-primary/10 to-transparent p-5 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-primary mb-1">نوع البطولة (الموسم)</h3>
              <p className="text-sm text-muted-foreground">قم بتحديد البطولة قبل إضافة أو إدخال البيانات</p>
            </div>
            <div className="w-full md:w-72">
              <select
                value={tournament}
                onChange={(e) => setTournament(e.target.value)}
                className="flex h-12 w-full rounded-md border border-primary/50 bg-background px-3 py-2 text-center text-lg font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                dir="rtl"
              >
                <option value="كأس العالم 2026">كأس العالم 2026</option>
                {categories.filter(c => c !== 'News 2026').map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>
      )}

      <Tabs defaultValue="goals" value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)}>
        <TabsList className="w-full grid grid-cols-2 md:grid-cols-4 h-auto p-1 mb-6 gap-2">
          <TabsTrigger value="goals" className="h-12 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Trophy className="h-4 w-4 ml-2" /> الهدافين
          </TabsTrigger>
          <TabsTrigger value="assists" className="h-12 data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
            <Target className="h-4 w-4 ml-2" /> صناع اللعب
          </TabsTrigger>
          <TabsTrigger value="motm" className="h-12 data-[state=active]:bg-purple-500 data-[state=active]:text-white">
            <Award className="h-4 w-4 ml-2" /> أفضل لاعب
          </TabsTrigger>
          <TabsTrigger value="cards" className="h-12 data-[state=active]:bg-red-500 data-[state=active]:text-white">
            <AlertTriangle className="h-4 w-4 ml-2" /> البطاقات
          </TabsTrigger>
        </TabsList>

        <Card className="border-primary/25 bg-gradient-card p-5 mb-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold">إضافة وتعديل بيانات {getTabName(activeTab)}</h3>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-1 lg:col-span-2">
              <Label className="font-arabic font-bold text-primary">اسم اللاعب</Label>
              <Input value={form.player_name} onChange={(e) => setForm({ ...form, player_name: e.target.value })} placeholder="مثال: ميسي" className="h-11" />
            </div>
            <div className="space-y-1 lg:col-span-2">
              <Label className="font-arabic font-bold text-primary">المنتخب</Label>
              <Input value={form.team_name} onChange={(e) => setForm({ ...form, team_name: e.target.value })} placeholder="مثال: الأرجنتين" className="h-11" />
            </div>
            
            {activeTab === 'goals' && (
              <div className="space-y-1">
                <Label className="font-arabic font-bold text-primary">الأهداف</Label>
                <Input type="number" value={form.goals} onChange={(e) => setForm({ ...form, goals: parseInt(e.target.value) || 0 })} className="h-11" />
              </div>
            )}
            
            {activeTab === 'assists' && (
              <div className="space-y-1">
                <Label className="font-arabic font-bold text-emerald-500">الأسيست</Label>
                <Input type="number" value={form.assists} onChange={(e) => setForm({ ...form, assists: parseInt(e.target.value) || 0 })} className="h-11" />
              </div>
            )}
            
            {activeTab === 'motm' && (
              <div className="space-y-1">
                <Label className="font-arabic font-bold text-purple-500">مرات رجل المباراة</Label>
                <Input type="number" value={form.motm_awards} onChange={(e) => setForm({ ...form, motm_awards: parseInt(e.target.value) || 0 })} className="h-11" />
              </div>
            )}
            
            {activeTab === 'cards' && (
              <>
                <div className="space-y-1">
                  <Label className="font-arabic font-bold text-yellow-500">بطاقات صفراء</Label>
                  <Input type="number" value={form.yellow_cards} onChange={(e) => setForm({ ...form, yellow_cards: parseInt(e.target.value) || 0 })} className="h-11" />
                </div>
                <div className="space-y-1">
                  <Label className="font-arabic font-bold text-red-500">بطاقات حمراء</Label>
                  <Input type="number" value={form.red_cards} onChange={(e) => setForm({ ...form, red_cards: parseInt(e.target.value) || 0 })} className="h-11" />
                </div>
              </>
            )}

            <div className="flex gap-2 sm:col-span-2 lg:col-span-5 pt-2">
              <Button onClick={handleSubmit} disabled={saving || !form.player_name || !form.team_name} className="h-11 flex-1 gap-2 font-semibold">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : (editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />)}
                {editingId ? 'حفظ التعديلات' : 'إضافة لاعب'}
              </Button>
              {editingId && (
                <Button variant="outline" className="h-11 font-semibold" onClick={() => { setEditingId(null); resetForm(); }}>إلغاء</Button>
              )}
            </div>
          </div>
        </Card>

        <Card className="border-primary/25 bg-gradient-card p-5 mb-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-green-600">إدخال {getTabName(activeTab)} دفعة واحدة (Bulk Import)</h3>
            <p className="text-sm text-muted-foreground">ألصق القائمة الخاصة بـ {getTabName(activeTab)} هنا.</p>
          </div>
          <div className="space-y-4">
            <textarea
              value={bulkTexts[activeTab]}
              onChange={(e) => setBulkTexts({ ...bulkTexts, [activeTab]: e.target.value })}
              placeholder={`الصق قائمة ${getTabName(activeTab)} هنا...`}
              className="flex min-h-[150px] w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              dir="rtl"
            />
            <Button onClick={handleBulkInsert} disabled={bulking || !bulkTexts[activeTab]} className="w-full h-12 font-bold bg-green-600 hover:bg-green-700 text-white gap-2 text-lg">
              {bulking ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
              حفظ جميع التعديلات في قائمة {getTabName(activeTab)}
            </Button>
          </div>
        </Card>

        <Card className="border-border bg-card">
          <div className="p-4 border-b border-border font-bold flex justify-between items-center">
            <span>قائمة {getTabName(activeTab)} الحالية للبطولة ({tournament})</span>
            <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm">{scorers.length} لاعب</span>
          </div>
          <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="p-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : scorers.length > 0 ? (
              scorers.map((scorer) => (
                <div key={scorer.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                  <div>
                    <div className="font-bold text-foreground">{scorer.player_name}</div>
                    <div className="text-sm text-muted-foreground flex gap-3 mt-1 items-center">
                      <span className="flex items-center gap-1">
                        <span className="text-lg">{getCountryFlag(scorer.team_name)}</span>
                        {scorer.team_name}
                      </span>
                      {activeTab === 'goals' && <span className="font-bold text-primary">الأهداف: {scorer.goals}</span>}
                      {activeTab === 'assists' && <span className="font-bold text-emerald-500">الأسيست: {scorer.assists}</span>}
                      {activeTab === 'motm' && <span className="font-bold text-purple-500">رجل المباراة: {scorer.motm_awards}</span>}
                      {activeTab === 'cards' && (
                        <>
                          <span className="text-yellow-500">أصفر: {scorer.yellow_cards}</span>
                          <span className="text-red-500">أحمر: {scorer.red_cards}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => startEdit(scorer)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(scorer.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-3">
                <Trophy className="h-10 w-10 text-muted-foreground/30" />
                <p>لا توجد بيانات مسجلة في {getTabName(activeTab)} لبطولة {tournament}.</p>
              </div>
            )}
          </div>
        </Card>
      </Tabs>
    </div>
  );
}
