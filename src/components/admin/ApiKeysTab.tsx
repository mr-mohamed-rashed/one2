import { useState } from 'react';
import { Check, Loader2, Save, Key } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';

const API_KEY_ITEMS = [
  { key: 'api_key_epl', labelAr: 'مفتاح الدوري الإنجليزي الممتاز', labelEn: 'EPL API Key', fallbackKey: '19a3b0d1fe31969b6b6e615f1c38fccd' },
  { key: 'api_key_laliga', labelAr: 'مفتاح الدوري الإسباني', labelEn: 'La Liga API Key', fallbackKey: '19a3b0d1fe31969b6b6e615f1c38fccd' },
  { key: 'api_key_seriea', labelAr: 'مفتاح الدوري الإيطالي', labelEn: 'Serie A API Key', fallbackKey: '19a3b0d1fe31969b6b6e615f1c38fccd' },
  { key: 'api_key_bundesliga', labelAr: 'مفتاح الدوري الألماني', labelEn: 'Bundesliga API Key', fallbackKey: '19a3b0d1fe31969b6b6e615f1c38fccd' },
  { key: 'api_key_ligue1', labelAr: 'مفتاح الدوري الفرنسي', labelEn: 'Ligue 1 API Key', fallbackKey: '19a3b0d1fe31969b6b6e615f1c38fccd' },
  { key: 'api_key_ucl', labelAr: 'مفتاح دوري أبطال أوروبا', labelEn: 'UEFA Champions League API Key', fallbackKey: '19a3b0d1fe31969b6b6e615f1c38fccd' },
  { key: 'api_key_epl_egypt', labelAr: 'مفتاح الدوري المصري الممتاز', labelEn: 'Egyptian Premier League API Key', fallbackKey: '19a3b0d1fe31969b6b6e615f1c38fccd' },
];

export function ApiKeysTab({ activeLeague = 'worldcup' }: { activeLeague?: string }) {
  const { lang } = useLanguage();
  const isAr = lang === 'ar';
  const { settings, loading, save } = useSiteSettings();
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, string>>({});

  const displayedKeys = activeLeague === 'worldcup'
    ? API_KEY_ITEMS
    : API_KEY_ITEMS.filter((item) => item.key === `api_key_${activeLeague}`);

  const getVal = (key: string, fallback: string) => {
    if (edits[key] !== undefined) return edits[key];
    const row = settings.find((setting) => setting.key === key);
    return row ? row.value_en : fallback;
  };

  const setVal = (key: string, val: string) => {
    setEdits((prev) => ({ ...prev, [key]: val }));
  };

  const saveKey = async (key: string, fallback: string) => {
    setSaving(key);
    const value = getVal(key, fallback).trim();
    await save(key, value, value); // save to both value_en and value_ar for consistency
    setSaving(null);
    setSaved(key);
    toast({ 
      title: isAr ? 'تم الحفظ!' : 'Saved!', 
      description: isAr ? 'تم تحديث مفتاح الـ API بنجاح.' : `API Key "${key}" updated successfully.` 
    });
    setTimeout(() => setSaved(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 text-right sm:text-start" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
        <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
          <Key className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display font-extrabold text-lg text-white">
            {isAr ? 'مفاتيح API-Football المخصصة' : 'Custom API-Football Keys'}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isAr 
              ? 'توزيع مفاتيح مختلفة لكل دوري لتجنب تجاوز الحد اليومي للمشترك المجاني (100 طلب/يوم).' 
              : 'Distribute different API keys per league to avoid exceeding the daily free tier limit.'}
          </p>
        </div>
      </div>

      <Card className="border-border bg-gradient-card p-5 space-y-4">
        <div className="space-y-3">
          {displayedKeys.map(({ key, labelAr, labelEn, fallbackKey }) => (
            <div 
              key={key} 
              className="grid gap-4 rounded-xl border border-white/5 bg-black/40 p-4 sm:grid-cols-[1fr_auto] items-end"
            >
              <div className="space-y-1.5 text-start w-full">
                <Label className="text-xs font-bold text-muted-foreground">
                  {isAr ? labelAr : labelEn}
                </Label>
                <Input
                  value={getVal(key, fallbackKey)}
                  onChange={(event) => setVal(key, event.target.value)}
                  placeholder="e.g. 19a3b0d1fe31969b..."
                  className="h-10 font-mono text-xs w-full text-start"
                  dir="ltr"
                />
              </div>
              
              <Button
                size="sm"
                onClick={() => saveKey(key, fallbackKey)}
                disabled={saving === key}
                className="h-10 px-5 bg-primary text-primary-foreground hover:bg-primary-glow font-bold gap-2 self-end shrink-0"
              >
                {saving === key ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : saved === key ? (
                  <Check className="h-4 w-4 text-green-400" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isAr ? 'حفظ المفتاح' : 'Save Key'}
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
