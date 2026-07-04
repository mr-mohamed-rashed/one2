/**
 * Bilingual translations for One2.
 * Keys are in English; values are en/ar pairs.
 */

export type Lang = 'en' | 'ar';

const T = {
  home: { en: 'Home', ar: 'الرئيسية' },
  worldCupNews: { en: 'World Cup News', ar: 'أخبار كأس العالم' },
  standings: { en: 'Golden Boot', ar: 'الحذاء الذهبي' },
  liveMatches: { en: 'Live Matches', ar: 'المباريات المباشرة' },
  groups: { en: 'Groups', ar: 'المجموعات' },
  roadmap: { en: 'Road to the Cup', ar: 'طريق الكأس' },

  theBeautifulGame: { en: 'The Beautiful Game.', ar: 'اللعبة الجميلة.' },
  live: { en: 'Live.', ar: 'مباشر.' },
  watchLiveNow: { en: 'Watch Live Now', ar: 'شاهد الآن مباشرة' },
  viewStandings: { en: 'View Standings', ar: 'عرض الترتيب' },

  matchCenter: { en: 'Match Center', ar: 'مركز المباريات' },
  matchCenterSub: { en: 'Live scores, fixtures & results', ar: 'نتائج مباشرة، مواعيد ونتائج' },
  allMatches: { en: 'All matches', ar: 'كل المباريات' },
  goldenBoot: { en: 'Golden Boot Race', ar: 'سباق الحذاء الذهبي' },
  goldenBootSub: { en: "Tournament's leading scorers", ar: 'هدافو البطولة' },
  fullStandings: { en: 'Full standings', ar: 'الترتيب الكامل' },
  worldCupPulse: { en: 'World Cup Pulse', ar: 'نبض كأس العالم' },
  latestHeadlines: { en: 'Latest headlines', ar: 'آخر الأخبار' },
  highlights: { en: 'Highlights', ar: 'ملخصات المباريات' },
  highlightsSub: { en: 'Match summaries and tournament highlights', ar: 'ملخصات المباريات وأبرز لقطات البطولة' },

  tabLive: { en: 'Live', ar: 'مباشر' },
  tabFixtures: { en: 'Fixtures', ar: 'المواعيد' },
  tabResults: { en: 'Results', ar: 'النتائج' },
  kickOff: { en: 'Kick-off', ar: 'الانطلاق' },
  ft: { en: 'FT', ar: 'النهاية' },

  standingsTitle: { en: 'Standings & Rankings', ar: 'الترتيب والتصنيف' },
  standingsSub: { en: 'Golden Boot & best player rankings', ar: 'سباق الحذاء الذهبي وأفضل اللاعبين' },
  topScorers: { en: 'Top Scorers', ar: 'الهدافون' },
  bestPlayers: { en: 'Contributions', ar: 'المساهمات' },

  player: { en: 'Player', ar: 'اللاعب' },
  club: { en: 'Club', ar: 'النادي' },
  goals: { en: 'Goals', ar: 'أهداف' },
  assists: { en: 'Assists', ar: 'تمريرات' },
  red_cards: { en: 'Red', ar: 'حمراء' },
  yellow_cards: { en: 'Yellow', ar: 'صفراء' },
  matches: { en: 'MP', ar: 'مباريات' },
  rating: { en: 'Rating', ar: 'التقييم' },
  votes: { en: 'Votes', ar: 'أصوات' },
  position: { en: 'Pos', ar: 'المركز' },

  groupsTitle: { en: 'Group Stage', ar: 'دور المجموعات' },
  groupsSub: { en: 'World Cup tournament groups & standings', ar: 'مجموعات كأس العالم والترتيب' },
  group: { en: 'Group', ar: 'المجموعة' },
  played: { en: 'P', ar: 'لعب' },
  won: { en: 'W', ar: 'فاز' },
  drawn: { en: 'D', ar: 'تعادل' },
  lost: { en: 'L', ar: 'خسر' },
  gf: { en: 'GF', ar: 'له' },
  ga: { en: 'GA', ar: 'عليه' },
  gd: { en: 'GD', ar: 'الفرق' },
  points: { en: 'PTS', ar: 'نقاط' },
  team: { en: 'Team', ar: 'المنتخب' },

  liveTitle: { en: 'Live Matches', ar: 'المباريات المباشرة' },
  liveSub: { en: 'Real-time scores, 2D tracker & Arabic commentary', ar: 'نتائج لحظية، متعقب ثنائي الأبعاد وتعليق عربي' },
  matchTracker: { en: '2D Match Tracker', ar: 'متعقب المباراة ثنائي الأبعاد' },
  liveCommentary: { en: 'Live Commentary', ar: 'التعليق المباشر' },

  liveChat: { en: 'Live Chat', ar: 'الدردشة المباشرة' },
  chatPlaceholder: { en: 'Type your message...', ar: 'اكتب رسالتك...' },
  chatSend: { en: 'Send', ar: 'إرسال' },
  chatJoin: { en: 'Join as', ar: 'الانضمام باسم' },
  chatUsernamePh: { en: 'Your username', ar: 'اسم المستخدم' },
  chatEnter: { en: 'Enter Chat', ar: 'دخول الدردشة' },
  chatBan: { en: 'Ban', ar: 'حظر' },
  chatDelete: { en: 'Delete', ar: 'حذف' },
  moderator: { en: 'Moderator', ar: 'مشرف' },
  banned: { en: 'Banned', ar: 'محظور' },

  newsTitle: { en: 'World Cup News', ar: 'أخبار كأس العالم' },
  newsSub: { en: 'Every story from the tournament, updated in real time.', ar: 'كل أخبار البطولة بتحديثات فورية.' },
  tickerLabel: { en: 'World Cup Live', ar: 'كأس العالم مباشر' },

  footerStatement: {
    en: 'One2 is your FIFA World Cup hub: live scores, 2D match tracking, Arabic commentary, and real-time standings in one place.',
    ar: 'وان تو هو مركزك لمتابعة كأس العالم: نتائج مباشرة، متعقب ثنائي الأبعاد، تعليق عربي، وترتيب فوري في مكان واحد.',
  },
  footerNewsletter: { en: 'Get the latest World Cup updates', ar: 'احصل على آخر مستجدات كأس العالم' },
  footerEmail: { en: 'Email address', ar: 'البريد الإلكتروني' },
  footerSubscribe: { en: 'Subscribe', ar: 'اشترك' },
  footerCopyright: { en: '© 2026 One2. All rights reserved.', ar: '© 2026 وان تو. جميع الحقوق محفوظة.' },

  switchToAr: { en: 'العربية', ar: 'English' },
  loading: { en: 'Loading...', ar: 'جاري التحميل...' },
  usingLiveData: { en: 'Live data from API-Football', ar: 'بيانات مباشرة من API-Football' },

  adminDashboard: { en: 'Dashboard', ar: 'لوحة القيادة' },
  adminTitle: { en: 'One2 Admin', ar: 'إدارة وان تو' },
  adminViewSite: { en: 'View Site', ar: 'عرض الموقع' },
  adminEditWidgets: { en: 'Edit Widgets', ar: 'تعديل الأدوات' },
  adminLogout: { en: 'Logout', ar: 'تسجيل الخروج' },
  adminControlPanel: { en: 'Control Panel', ar: 'لوحة التحكم' },
  adminControlSub: { en: 'Visual page builder, ad banners, widget labels & manual news.', ar: 'منشئ صفحات مرئي، لافتات إعلانية، تسميات الأدوات، وأخبار يدوية.' },
  adminPageBuilder: { en: 'Page Builder', ar: 'منشئ الصفحات' },
  adminLabels: { en: 'Labels', ar: 'التسميات' },
  adminAds: { en: 'Ads', ar: 'الإعلانات' },
  adminNews: { en: 'News', ar: 'الأخبار' },
  adminMediaPlayer: { en: 'Media Player', ar: 'مشغل الميديا' },
  adminAnalytics: { en: 'Analytics', ar: 'التحليلات' },
} as const;

export type TKey = keyof typeof T;

export function t(key: TKey, lang: Lang): string {
  return T[key][lang];
}

export { T };
