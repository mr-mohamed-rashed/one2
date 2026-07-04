import { useState, useEffect, useRef } from 'react';
import { Send, Shield, Ban, Trash2, MessageCircle, User, Smile, Pin, PinOff, Bot, BotOff } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useManualNews } from '@/hooks/useManualNews';
import { t } from '@/lib/i18n';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { ADMIN_EMAILS_LIST } from '@/config/admins';

interface ChatMessage {
  id: string;
  user_id: string;
  username: string;
  message: string;
  is_deleted: boolean;
  is_pinned?: boolean;
  match_id: string;
  created_at: string;
}

interface ChatUser {
  user_id: string;
  username: string;
  is_moderator: boolean;
  is_banned: boolean;
}

// Simple random ID for anonymous chat (no auth required)
function getOrCreateUserId(): string {
  let id = localStorage.getItem('tiki-user-id');
  if (!id) {
    id = `user_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem('tiki-user-id', id);
  }
  return id;
}

// Hardcoded moderator IDs for demo – in production, manage via the database
const MODERATOR_IDS = new Set(['mod_tiki_taka_admin']);

// Removed static BAD_WORDS and filterProfanity. It's handled dynamically inside the component now.

function renderMessageText(text: string) {
  // 1. Parse markdown-style links: [Link Text](https://...)
  const parts = text.split(/(\[[^\]]+\]\(https?:\/\/[^\s)]+\))/g);
  
  return parts.map((part, i) => {
    const mdMatch = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
    if (mdMatch) {
      const linkText = mdMatch[1];
      const linkUrl = mdMatch[2];
      return (
        <a key={i} href={linkUrl} target="_blank" rel="noopener noreferrer" 
           className="inline-flex items-center justify-center bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-1.5 px-4 rounded-full mt-2 mb-1 text-sm shadow-md transition-all gap-2"
           onClick={(e) => e.stopPropagation()}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          {linkText}
        </a>
      );
    }
    
    // 2. Fallback to normal raw URL parsing
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
    const subParts = part.split(urlRegex);
    
    return subParts.map((subPart, j) => {
      if (subPart.match(urlRegex)) {
        const href = subPart.startsWith('www.') ? `https://${subPart}` : subPart;
        let displayText = subPart;
        if (subPart.includes('/news/') && subPart.length > 40) {
          displayText = "🔗 التفاصيل من هنا";
        }
        return (
          <a key={`${i}-${j}`} href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold break-all" onClick={(e) => e.stopPropagation()}>
            {displayText}
          </a>
        );
      }
      return <span key={`${i}-${j}`}>{subPart}</span>;
    });
  });
}

interface LiveChatProps {
  matchId?: string;
  variant?: 'default' | 'overlay';
  isTheaterSplit?: boolean;
}

export function LiveChat({ matchId: _ignoredMatchId = 'general', variant = 'default', isTheaterSplit = false }: LiveChatProps) {
  const matchId = 'global'; // Force all chats to use a single global pipe
  const { lang } = useLanguage();
  const { user, signInWithGoogle, loading: authLoading } = useAuth();
  const { news } = useManualNews(true); // Fetch active news for the bots
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<Map<string, ChatUser>>(new Map());
  const botIndexRef = useRef(0);
  const msgIndexRef = useRef(0);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const [botsEnabled, setBotsEnabled] = useState(true);
  const [bannedWords, setBannedWords] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [typingChannel, setTypingChannel] = useState<any>(null);
  
  const [externalLinks, setExternalLinks] = useState<{name: string, url: string}[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasFetchedInitialRef = useRef(false);
  const mountTimeRef = useRef<number>(new Date().getTime());

  const userId = user?.id || getOrCreateUserId();
  
  // Auto-detect admin by known emails, or hardcoded IDs
  const isModerator = (user?.email && ADMIN_EMAILS_LIST?.includes(user.email.toLowerCase())) || user?.email === 'mrrashed0777@gmail.com' || user?.email === 'info@one2.cc' || MODERATOR_IDS.has(userId);

  const getNickname = () => {
    if (isModerator) return lang === 'ar' ? 'سوبر أدمن' : 'Super Admin';
    if (user?.user_metadata?.full_name) {
      const parts = user.user_metadata.full_name.trim().split(' ');
      return parts.length > 1 ? parts[parts.length - 1] : parts[0];
    }
    return user?.email?.split('@')[0] || 'Guest';
  };
  
  const username = getNickname();
  const joined = !!user;

  // Auto-scroll
  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollRef.current) {
        setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
          }
        }, 50);
      }
    };
    
    // Scroll on new messages
    scrollToBottom();
  }, [messages]);

  // Scroll on keyboard open / resize
  useEffect(() => {
    const handleResize = () => {
      if (scrollRef.current) {
        setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
          }
        }, 50);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load banned words and initialize
  useEffect(() => {
    if (hasFetchedInitialRef.current) return;
    hasFetchedInitialRef.current = true;
    
    // Fetch dynamic banned words
    supabase.from('chat_banned_words').select('word').then(({ data }) => {
      if (data) setBannedWords(data.map(d => d.word));
    });

    // Start with an empty chat, just finish loading
    setMessages([]);
    setLoading(false);
  }, [matchId]);

  const usersRef = useRef(users);
  useEffect(() => {
    usersRef.current = users;
  }, [users]);

  // Real-time subscription for messages and typing
  useEffect(() => {
    const channelId = `chat:${matchId}:${Math.random().toString(36).substring(7)}`;
    
    // Typing channel setup
    const tChannel = supabase.channel(`typing:${matchId}`);
    tChannel
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.username && payload.payload.user_id !== userId) {
          setTypingUsers((prev) => {
            const next = new Set(prev);
            next.add(payload.payload.username);
            return next;
          });
          
          // Clear typing after 3 seconds
          setTimeout(() => {
            setTypingUsers((prev) => {
              const next = new Set(prev);
              next.delete(payload.payload.username);
              return next;
            });
          }, 3000);
        }
      })
      .subscribe();
      
    setTypingChannel(tChannel);

    const channel = supabase
      .channel(channelId)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `match_id=eq.${matchId}`,
      }, (payload) => {
        const msg = payload.new as ChatMessage;
        // Check if sender is banned
        const sender = usersRef.current.get(msg.user_id);
        if (!sender?.is_banned) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg].slice(-100);
          });
          
          // Play sound if message is not from me
          if (msg.user_id !== userId) {
            try {
              const audio = new Audio('/sounds/message.ogg');
              audio.play().catch(e => console.log('Audio play blocked:', e));
            } catch (err) {}
          }
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'chat_messages',
        filter: `match_id=eq.${matchId}`,
      }, (payload) => {
        const updated = payload.new as ChatMessage;
        setMessages((prev) => prev.map((m) => m.id === updated.id ? updated : m));
      })
      .subscribe();

    return () => { 
      supabase.removeChannel(channel); 
      supabase.removeChannel(tChannel);
    };
  }, [matchId, userId]);

  // Fetch active broadcasts for bots
  useEffect(() => {
    if (!isModerator || !botsEnabled) return;
    
    supabase.from('active_broadcasts').select('*').eq('is_active', true).then(({ data }) => {
      if (data && data.length > 0) {
        const links: {name: string, url: string}[] = data.map(broadcast => ({
          name: broadcast.match_name,
          url: broadcast.direct_link
        }));
        // Shuffle or just use them
        setExternalLinks(links);
      }
    });
  }, [isModerator, botsEnabled]);

  // Automated 20 Admins (Bots) sending news
  useEffect(() => {
    // Only run this logic on the Moderator's client to prevent multiple clients from spamming the DB
    if (!isModerator || externalLinks.length === 0 || !botsEnabled) return;

    const BOT_NAMES = [
      'أحمد محمد', 'محمود سعد', 'كريم حسن', 'طارق السيد', 'علي عادل', 
      'عمر فاروق', 'يوسف مصطفى', 'حسن كمال', 'مصطفى فهمي', 'خالد عبد الله',
      'محمد صلاح', 'إبراهيم سعيد', 'حسام غالي', 'وليد سليمان', 'عبد الله السعيد',
      'عمرو جمال', 'محمد هاني', 'رامي ربيعة', 'محمود علاء', 'فرجاني ساسي'
    ];

    const interval = setInterval(() => {
      if (document.hidden) return;
      const now = new Date().getTime();
      const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;
      const isLastMsgBot = lastMsg && BOT_NAMES.includes(lastMsg.username);
      
      let waitTime = 15000; // Default wait time for bot-to-bot (15s)
      
      if (lastMsg && !isLastMsgBot) {
        // Last message was from a real user! Reply quickly!
        waitTime = 3000; // 3 seconds
      } else if (!lastMsg) {
        // Chat is empty
        waitTime = 5000; // 5 seconds
      }
      
      const lastMsgTime = lastMsg ? new Date(lastMsg.created_at).getTime() : mountTimeRef.current;
      
      if (now - lastMsgTime > waitTime) {
        const nextLink = externalLinks[msgIndexRef.current % externalLinks.length];
        const nextBot = BOT_NAMES[botIndexRef.current % BOT_NAMES.length];
        
        msgIndexRef.current += 1;
        botIndexRef.current += 1;

        const text = nextLink.name;
        const link = nextLink.url;
        
        supabase.from('chat_messages').insert({
          user_id: userId,
          username: nextBot,
          message: `${text} \n ${link}`,
          match_id: matchId,
        }).select().single().then(({ data, error }) => {
          if (error) {
            console.error("Bot insert error:", error);
          } else if (data) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === data.id)) return prev;
              return [...prev, data as ChatMessage].slice(-100);
            });
          }
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [messages, isModerator, news, matchId, lang, botsEnabled, userId]);

  const handleJoin = async () => {
    try {
      await signInWithGoogle();
    } catch (e) {
      console.error('Google login failed:', e);
    }
  };

  const sendMessage = async () => {
    const text = inputMsg.trim();
    if (!text || !username) return;

    // Check if user is banned
    const { data: userRow } = await supabase
      .from('chat_users')
      .select('is_banned')
      .eq('user_id', userId)
      .maybeSingle();
    if (userRow?.is_banned) return;

    let containsBadWord = false;
    let filteredText = text;
    bannedWords.forEach(word => {
      // Use boundaries that work for Arabic (space, start/end of string, or punctuation)
      const regex = new RegExp(`(^|\\s|[.,!؟،؛"'])(${word})(?=\\s|$|[.,!؟،؛"'])`, 'gi');
      const newText = filteredText.replace(regex, '$1***');
      if (newText !== filteredText) {
        containsBadWord = true;
        filteredText = newText;
      }
    });

    if (containsBadWord) {
      // Log profanity asynchronously
      supabase.from('chat_profanity_logs').insert({
        user_id: userId,
        username: username,
        original_message: text
      }).then();
    }

    // 1. If message is entirely bad words, block it completely
    if (filteredText.replace(/\*/g, '').trim() === '') {
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        user_id: 'system',
        username: '🤖 المساعد الذكي',
        message: '🚫 تم الرفض: كلمات غير لائقة.',
        match_id: matchId,
        is_deleted: false,
        created_at: new Date().toISOString()
      }]);
      setInputMsg('');
      return;
    }

    // 2. If it has a bad word in the middle, we warn the user but send the masked version
    if (containsBadWord) {
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        user_id: 'system',
        username: '🤖 المساعد الذكي',
        message: '⚠️ تنبيه: تم التشفير.',
        match_id: matchId,
        is_deleted: false,
        created_at: new Date().toISOString()
      }]);
    }

    setIsSending(true);

    const { data, error } = await supabase.from('chat_messages').insert({
      user_id: userId,
      username,
      message: filteredText,
      match_id: matchId,
    }).select().single();
    
    if (error) {
      console.error("Chat error:", error);
    } else if (data) {
      setInputMsg('');
      setShowEmojis(false);
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev;
        return [...prev, data as ChatMessage].slice(-100);
      });
    }
    setIsSending(false);
  };

  const deleteMessage = async (id: string) => {
    await supabase.from('chat_messages').update({ is_deleted: true }).eq('id', id);
  };

  const clearChat = async () => {
    if (!window.confirm(lang === 'ar' ? 'هل أنت متأكد من حذف جميع الرسائل في هذه المحادثة؟' : 'Are you sure you want to clear the chat?')) return;
    
    const { error } = await supabase.from('chat_messages').update({ is_deleted: true }).eq('match_id', matchId);
    if (!error) {
      setMessages([]);
    } else {
      console.error("Failed to clear chat:", error);
    }
  };

  const banUser = async (targetUserId: string) => {
    await supabase.from('chat_users').update({ is_banned: true }).eq('user_id', targetUserId);
    setUsers((prev) => {
      const m = new Map(prev);
      const u = m.get(targetUserId);
      if (u) m.set(targetUserId, { ...u, is_banned: true });
      return m;
    });
  };

  const togglePin = async (id: string, currentStatus: boolean) => {
    await supabase.from('chat_messages').update({ is_pinned: !currentStatus }).eq('id', id);
  };

  if (authLoading) {
    return (
      <Card className={cn("flex items-center justify-center", variant === 'overlay' ? 'bg-transparent border-none shadow-none h-full' : 'bg-gradient-card border-border h-[500px] md:h-full')}>
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </Card>
    );
  }



  const visibleMessages = messages.filter((m) => !m.is_deleted);
  const pinnedMessages = visibleMessages.filter((m) => m.is_pinned);
  // Show all messages in the normal flow, except those that were ONLY loaded because they were pinned 
  // (we load pinned messages on mount, so if they are old they will be at the top anyway)

  return (
    <Card className={cn(
      "overflow-hidden flex flex-col h-full select-text",
      variant === 'overlay' 
        ? 'bg-transparent border-none shadow-none' 
        : (isTheaterSplit 
            ? 'bg-black border-none rounded-none lg:bg-gradient-card lg:border-solid lg:border lg:border-border lg:rounded-xl' 
            : 'bg-gradient-card border-border')
    )}>
      {/* Header */}
      {variant !== 'overlay' && (
        <div className="hidden md:flex items-center justify-between px-5 py-3 border-b border-border bg-card/60 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/15">
            <MessageCircle className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className={cn('font-display font-extrabold text-lg', lang === 'ar' && 'font-arabic')}>{t('liveChat', lang)}</h3>
            <p className="text-xs text-muted-foreground">{username}</p>
          </div>
        </div>
        {isModerator && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearChat}
              className="h-7 text-xs gap-1.5 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
              title={lang === 'ar' ? 'مسح المحادثة بالكامل' : 'Clear Chat'}
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{lang === 'ar' ? 'تفريغ الشات' : 'Clear'}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBotsEnabled(!botsEnabled)}
              className={cn("h-7 text-xs gap-1.5 border-dashed", botsEnabled ? "bg-primary/10 text-primary border-primary/30" : "text-muted-foreground")}
            >
              {botsEnabled ? <Bot className="h-3.5 w-3.5" /> : <BotOff className="h-3.5 w-3.5" />}
              {lang === 'ar' ? (botsEnabled ? 'إيقاف البوتات' : 'تشغيل البوتات') : (botsEnabled ? 'Disable Bots' : 'Enable Bots')}
            </Button>
            <Badge className="bg-gold text-gold-foreground gap-1 hidden sm:flex">
              <Shield className="h-3 w-3" />
              <span className={cn('text-xs font-bold', lang === 'ar' && 'font-arabic')}>{t('moderator', lang)}</span>
            </Badge>
          </div>
        )}
        </div>
      )}
      {/* Pinned Messages */}
      {pinnedMessages.length > 0 && (
        <div className="bg-primary/10 border-b border-primary/20 p-3 shrink-0 flex flex-col gap-2">
          {pinnedMessages.map((msg) => (
            <div key={`pinned-${msg.id}`} className="flex items-start gap-2 text-sm relative group">
              <Pin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                <span className="font-bold mr-1.5 text-primary">
                  {msg.username} {lang === 'ar' ? ':' : ':'}
                </span>
                <span className={cn("text-foreground/90 font-medium whitespace-pre-wrap", variant === 'overlay' && "text-white")}>{renderMessageText(msg.message)}</span>
              </div>
              {isModerator && (
                <button onClick={() => togglePin(msg.id, true)} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-primary/20 text-primary transition-opacity absolute top-0 right-0 shrink-0" title={lang === 'ar' ? 'إلغاء التثبيت' : 'Unpin'}>
                  <PinOff className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Messages */}
      <div 
        ref={scrollRef} 
        className="commentary-scroll flex-1 min-h-0 overflow-y-auto p-3 flex flex-col gap-1"
        style={{ WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 16px)', maskImage: 'linear-gradient(to bottom, transparent, black 16px)' }}
      >
        <div className="flex-1 min-h-0" />
        {visibleMessages.map((msg) => {
          const isOwn = msg.user_id === userId;
          return (
            <div key={msg.id} className="group flex items-start gap-2 px-2 py-1.5 hover:bg-muted/50 rounded-lg transition-colors break-words text-sm relative animate-in slide-in-from-bottom-2 fade-in duration-300">
              <div className="flex-1 min-w-0" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                <span className={cn(
                  "font-bold mr-1.5",
                  isOwn ? "text-primary" : "text-blue-500"
                )}>
                  {msg.username} {lang === 'ar' ? ':' : ':'}
                </span>
                <span className={cn("text-foreground/90 whitespace-pre-wrap font-medium")}>{renderMessageText(msg.message)}</span>
              </div>
              
              {isModerator && (
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity shrink-0 bg-background/80 px-1 rounded absolute top-1 right-1">
                  <button onClick={() => togglePin(msg.id, !!msg.is_pinned)} className="p-1 rounded hover:bg-primary/20 text-primary transition-colors" title={lang === 'ar' ? (msg.is_pinned ? 'إلغاء التثبيت' : 'تثبيت') : (msg.is_pinned ? 'Unpin' : 'Pin')}>
                    {msg.is_pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                  </button>
                  <button onClick={() => deleteMessage(msg.id)} className="p-1 rounded hover:bg-destructive/20 text-destructive transition-colors" title={lang === 'ar' ? 'حذف' : 'Delete'}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  {!isOwn && (
                    <button onClick={() => banUser(msg.user_id)} className="p-1 rounded hover:bg-destructive/20 text-destructive transition-colors" title={lang === 'ar' ? 'حظر' : 'Ban'}>
                      <Ban className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {visibleMessages.length === 0 && (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            {lang === 'ar' ? 'لا توجد رسائل بعد. كن الأول!' : 'No messages yet. Be the first!'}
          </div>
        )}
      </div>

      {/* Typing Indicator */}
      {typingUsers.size > 0 && (
        <div className="px-4 py-1.5 text-xs text-primary font-medium animate-pulse shrink-0 border-t border-border/50 bg-primary/5" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          {Array.from(typingUsers).join(' و ')} {lang === 'ar' ? 'يكتب الآن...' : 'is typing...'}
        </div>
      )}

      {/* Input or Sign In */}
      {!joined ? (
        <div className={cn("p-4 shrink-0 border-t border-border bg-card/60")}>
          <Button onClick={handleJoin} className="w-full bg-primary text-primary-foreground hover:bg-primary-glow font-bold shadow-neon flex items-center justify-center gap-2">
            <svg viewBox="0 0 24 24" className="w-5 h-5 bg-white rounded-full p-0.5" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className={lang === 'ar' ? 'font-arabic' : ''}>
              {lang === 'ar' ? 'تسجيل الدخول للمشاركة' : 'Sign in to chat'}
            </span>
          </Button>
        </div>
      ) : (
        variant !== 'overlay' && (
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }} 
            className={cn("p-3 shrink-0 relative flex items-center gap-2 border-t border-border")}
          >
            {showEmojis && (
              <div className="absolute bottom-[110%] right-3 z-50 shadow-2xl rounded-xl overflow-hidden">
                <EmojiPicker 
                  onEmojiClick={(emojiData) => {
                    setInputMsg(prev => prev + emojiData.emoji);
                  }}
                  theme={Theme.DARK}
                  lazyLoadEmojis={true}
                  searchDisabled={true}
                  skinTonesDisabled={true}
                  width={280}
                  height={350}
                />
              </div>
            )}
            
            <div className="flex-1 bg-[#1e2025] rounded-[24px] flex items-center px-4 h-12 border border-border/50 overflow-hidden">
              <input
                value={inputMsg}
                onChange={(e) => {
                  setInputMsg(e.target.value);
                  if (typingChannel && e.target.value.trim().length > 0) {
                    typingChannel.send({
                      type: 'broadcast',
                      event: 'typing',
                      payload: { username, user_id: userId }
                    }).catch(() => {}); // Ignore errors if not fully connected yet
                  }
                }}
                placeholder={lang === 'ar' ? `تعليق باسم ${username}` : `Comment as ${username}`}
                className="bg-transparent text-foreground text-sm h-full w-full outline-none focus:ring-0 px-0 placeholder:text-muted-foreground"
                dir={lang === 'ar' ? 'rtl' : 'ltr'}
                maxLength={200}
                disabled={isSending}
              />
              <button
                type="button"
                onClick={() => setShowEmojis(!showEmojis)}
                className="p-2 text-muted-foreground hover:text-primary transition-colors focus:outline-none shrink-0"
              >
                <Smile className="h-5 w-5" />
              </button>
            </div>
            <Button type="submit" disabled={!inputMsg.trim() || isSending} size="icon" className="shrink-0 bg-primary hover:bg-primary-glow text-primary-foreground rounded-full h-12 w-12 shadow-md">
              <Send className={cn("h-5 w-5", lang === 'ar' && "rotate-180")} />
            </Button>
          </form>
        )
      )}
    </Card>
  );
}
