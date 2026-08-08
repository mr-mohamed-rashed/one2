import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function useNewsCategories() {
  const [categories, setCategories] = useState<string[]>(['News 2026']);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('news_categories')
      .select('name')
      .order('created_at', { ascending: true });

    const staticLeagues = ['epl', 'laliga', 'seriea', 'bundesliga', 'ligue1', 'ucl', 'epl_egypt'];

    if (error) {
      console.error('[news_categories] fetch error:', error);
      // Fallback to minimal array if table is missing or errors
      setCategories(['News 2026', ...staticLeagues]);
    } else if (data) {
      const names = data.map((d) => d.name);
      
      // Auto-append static leagues if not already in the DB list
      staticLeagues.forEach((l) => {
        if (!names.includes(l)) {
          names.push(l);
        }
      });

      if (!names.includes('News 2026')) {
        names.unshift('News 2026');
      }
      setCategories(names);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const addCategory = async (name: string) => {
    if (!name.trim()) return;
    const cleanName = name.trim();
    if (categories.includes(cleanName)) return;

    setCategories((prev) => [...prev, cleanName]);
    const { error } = await supabase.from('news_categories').insert({ name: cleanName });
    if (error) {
      console.error('Failed to add category', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حفظ التصنيف.',
        variant: 'destructive',
      });
      fetchCategories(); // revert on error
    } else {
      toast({
        title: 'نجاح',
        description: 'تمت إضافة التصنيف بنجاح.',
      });
    }
  };

  const deleteCategory = async (name: string) => {
    if (name === 'News 2026') return; // Cannot delete primary
    
    // Optimistic
    setCategories((prev) => prev.filter((c) => c !== name));
    
    // Move all news to primary category before deleting the category string
    const { error: updateError } = await supabase
      .from('manual_news')
      .update({ category: 'News 2026' })
      .eq('category', name);

    // Also update Pulse and Ticker tags if any are using this exact category
    await supabase.from('manual_news').update({ category: 'Pulse' }).eq('category', `Pulse:${name}`);
    await supabase.from('manual_news').update({ category: 'Ticker' }).eq('category', `Ticker:${name}`);

    const { error } = await supabase.from('news_categories').delete().eq('name', name);
    if (error) {
      console.error('Failed to delete category', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حذف التصنيف.',
        variant: 'destructive',
      });
      fetchCategories();
    } else {
      toast({
        title: 'نجاح',
        description: 'تم حذف التصنيف ونقل الأخبار للأساسي.',
      });
    }
  };

  return { categories, loading, addCategory, deleteCategory };
}
