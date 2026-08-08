export interface LeagueTheme {
  id: string;
  nameEn: string;
  nameAr: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    accent: string;
  };
  logo: string;
  coverImage: string;
  apiLeagueId?: number;
  season?: number;
}

export const leaguesConfig: Record<string, LeagueTheme> = {
  epl: {
    id: 'epl',
    nameEn: 'English Premier League',
    nameAr: 'الدوري الإنجليزي الممتاز',
    colors: {
      primary: '#38003c', // Deep Purple
      secondary: '#e90052', // Neon Pink
      background: '#240026', // Very dark purple
      accent: '#00ff85', // Neon Green
    },
    logo: '/images/hub/epl-logo.png', // User will upload
    coverImage: '/images/hub/epl-bg.png', // User will upload
    apiLeagueId: 39,
    season: 2026,
  },
  ligue1: {
    id: 'ligue1',
    nameEn: 'Ligue 1',
    nameAr: 'الدوري الفرنسي',
    colors: {
      primary: '#12233f', // Dark Blue
      secondary: '#dae028', // Neon Yellow/Green
      background: '#0d182b',
      accent: '#dae028',
    },
    logo: '/images/hub/ligue1-logo.png',
    coverImage: '/images/hub/ligue1-bg.png',
    apiLeagueId: 61,
    season: 2026,
  },
  laliga: {
    id: 'laliga',
    nameEn: 'La Liga',
    nameAr: 'الدوري الإسباني',
    colors: {
      primary: '#ea2027', // Red
      secondary: '#ff7f50', // Coral/Orange
      background: '#1a0404',
      accent: '#FFD700', // Gold
    },
    logo: '/images/hub/laliga-logo.png',
    coverImage: '/images/hub/laliga-bg.png',
    apiLeagueId: 140,
    season: 2026,
  },
  seriea: {
    id: 'seriea',
    nameEn: 'Serie A',
    nameAr: 'الدوري الإيطالي',
    colors: {
      primary: '#0033a0', // Italian Blue
      secondary: '#0055ff', // Lighter Blue
      background: '#001133',
      accent: '#00a3e0',
    },
    logo: '/images/hub/seriea-logo.png',
    coverImage: '/images/hub/seriea-bg.png',
    apiLeagueId: 135,
    season: 2026,
  },
  ucl: {
    id: 'ucl',
    nameEn: 'UEFA Champions League',
    nameAr: 'دوري أبطال أوروبا',
    colors: {
      primary: '#0e1e5b', // UCL Dark Blue
      secondary: '#005eb8', // UCL Cyan/Blue
      background: '#040b23',
      accent: '#c0c0c0', // Silver
    },
    logo: '/images/hub/ucl-logo.png',
    coverImage: '/images/hub/ucl-bg.png',
    apiLeagueId: 2,
    season: 2026,
  },
  epl_egypt: {
    id: 'epl_egypt',
    nameEn: 'Egyptian Premier League',
    nameAr: 'الدوري المصري الممتاز',
    colors: {
      primary: '#ce1126', // Red
      secondary: '#000000', // Black
      background: '#1a0205',
      accent: '#FFD700', // Gold
    },
    logo: '/images/hub/egypt-logo.png',
    coverImage: '/images/hub/egypt-bg.png',
    apiLeagueId: 233,
    season: 2026,
  },
  bundesliga: {
    id: 'bundesliga',
    nameEn: 'Bundesliga',
    nameAr: 'الدوري الألماني',
    colors: {
      primary: '#d20515', // Red
      secondary: '#4a4a4a', // Grey
      background: '#140102',
      accent: '#ffffff', // White
    },
    logo: '/images/hub/bundesliga-logo.png',
    coverImage: '/images/hub/bundesliga-bg.png',
    apiLeagueId: 78,
    season: 2026,
  },
};
