import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { teams, getFinishedMatches, getUpcomingMatches, getLiveMatches } from '@/lib/footballData';
import type { Match, Scorer } from '@/lib/footballData';
import { queryClient } from '@/App';
import { leaguesConfig } from '@/lib/leaguesConfig';

const COUNTRY_FLAGS: Record<string, string> = {
  'الأرجنتين': 'ar', 'فرنسا': 'fr', 'البرازيل': 'br', 'النرويج': 'no',
  'كندا': 'ca', 'الكونغو الديمقراطية': 'cd', 'السنغال': 'sn', 'إنجلترا': 'gb',
  'هولندا': 'nl', 'ألمانيا': 'de', 'المغرب': 'ma', 'سويسرا': 'ch',
  'نيوزيلندا': 'nz', 'كولومبيا': 'co', 'السويد': 'se', 'أوروجواي': 'uy',
  'أمريكا': 'us', 'النمسا': 'at', 'إسبانيا': 'es', 'بلجيكا': 'be',
  'كوت ديفوار': 'ci', 'البرتغال': 'pt', 'اليابان': 'jp', 'الجزائر': 'dz',
  'إيران': 'ir', 'المكسيك': 'mx', 'مصر': 'eg', 'كرواتيا': 'hr',
  'العراق': 'iq', 'إكوادور': 'ec', 'إسكتلندا': 'gb-sct', 'هايتى': 'ht',
  'التشيك': 'cz', 'الأردن': 'jo', 'كوريا الجنوبية': 'kr', 'غانا': 'gh',
  'باراجواي': 'py', 'أوزبكستان': 'uz', 'تركيا': 'tr', 'جنوب أفريقيا': 'za',
  'السعودية': 'sa', 'قطر': 'qa', 'تونس': 'tn', 'أستراليا': 'au',
  'كاب فيردي': 'cv', 'البوسنة والهرسك': 'ba', 'البوسنة': 'ba', 'كوراساو': 'cw'
};

export const resolveTeamFlag = (teamName: string | undefined | null) => {
  if (!teamName) return 'https://flagcdn.com/w160/un.png';
  const cleanName = teamName.trim();
  const code = COUNTRY_FLAGS[cleanName];
  if (code) {
    return `https://flagcdn.com/w160/${code}.png`;
  }
  return 'https://flagcdn.com/w160/un.png';
};

function getMatchTime(match: Match | undefined): number {
  if (!match || !match.date) return 0;
  const time = new Date(match.date).getTime();
  return isNaN(time) ? 0 : time;
}

function getSmartPollingInterval(): number | false {
  const now = Date.now();
  const liveMatches = queryClient.getQueryData<Match[]>(['live-fixtures']) || [];
  const currentLive = liveMatches.filter(m => m && m.status === 'live');
  
  if (currentLive.length > 0) {
    const activeMatch = currentLive.sort((a, b) => getMatchTime(b) - getMatchTime(a))[0];
    const kickoff = getMatchTime(activeMatch);
    const elapsedMins = kickoff ? (now - kickoff) / 60000 : 0;
    
    if (elapsedMins < 0) return false;
    if (elapsedMins >= 0 && elapsedMins < 115) return 240_000;
    if (elapsedMins >= 115) return 240_000;
  }
  
  const upcoming = queryClient.getQueryData<Match[]>(['upcoming-fixtures']) || [];
  const nextUpcoming = upcoming
    .filter(m => m && getMatchTime(m) > now)
    .sort((a, b) => getMatchTime(a) - getMatchTime(b));
    
  if (nextUpcoming.length === 0) return false;
  
  const nextKickoff = getMatchTime(nextUpcoming[0]);
  const timeToKickoff = nextKickoff ? nextKickoff - now : 0;
  
  if (timeToKickoff <= 0) return 240_000;
  return Math.min(timeToKickoff, 3600_000);
}

// World Cup 2026 league ID on API-Football is 1
const WC_LEAGUE = 'fifa.world';
const WC_SEASON = '2026';

async function fetchEspnDirectly(season: string) {
  const datesParam = season === '2026' ? '?dates=20260611-20260719' : '';
  const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard${datesParam}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`ESPN failed: ${response.status}`);
  const data = await response.json();
  return { response: data.events || [], espn: true };
}

async function fetchEspnStatsDirectly() {
  const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/statistics`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`ESPN stats failed: ${response.status}`);
  return response.json();
}

async function callProxy(body: any) {
  try {
    if (['live', 'fixtures', 'results'].includes(body.endpoint)) {
      const cacheKey = `${body.endpoint}_${body.league}_${body.season}_`;
      try {
        const espnData = await fetchEspnDirectly(body.season ?? '2026');
        
        // Save to cache asynchronously to survive apocalyptic scenarios
        supabase.from('api_cache').upsert({
          endpoint: cacheKey,
          data: espnData,
          updated_at: new Date().toISOString()
        }, { onConflict: 'endpoint' }).then(({ error }) => {
          if (error) console.error('Cache save failed', error);
        });
        
        return espnData;
      } catch (espnErr) {
        console.warn('ESPN fetch failed, falling back to DB cache', espnErr);
        const { data: cacheRow } = await supabase.from('api_cache')
          .select('data')
          .eq('endpoint', cacheKey)
          .single();
          
        if (cacheRow?.data) return cacheRow.data;
        throw espnErr;
      }
    }
    // For standings, call the Supabase Edge Function
    if (['standings', 'topscorers'].includes(body.endpoint)) {
       const { data, error } = await supabase.functions.invoke('football-proxy', {
         body: body
       });
       if (error) throw error;
       return data;
    }
    
    throw new Error('Unsupported endpoint');
  } catch (err) {
    console.error('Data fetch failed', err);
    throw err;
  }
}

// ---------- Live fixtures ----------
export function useLiveFixtures() {
  return useQuery({
    queryKey: ['live-fixtures'],
    queryFn: async () => {
      try {
        const data = await callProxy({ endpoint: 'live' });
        
        let results: Match[] = [];
        if (data?.matches) results = data.matches as Match[];
        if (data?.espn) {
          results = data.response.map(mapEspnFixture).filter((m: Match) => m.status === 'live');
        } else if (data?.response?.length) {
          results = data.response.map(mapFixture);
        }
        results = [...results, ...getLiveMatches()];
        
        if (!results) return [];
        
        const previousLive = queryClient.getQueryData<Match[]>(['live-fixtures']);
        const hadLive = previousLive?.some(m => m.status === 'live');
        const hasLiveNow = results.some(m => m.status === 'live');
        
        if (hadLive && !hasLiveNow) {
           queryClient.invalidateQueries({ queryKey: ['results'] });
           queryClient.invalidateQueries({ queryKey: ['upcoming-fixtures'] });
           queryClient.invalidateQueries({ queryKey: ['standings'] });
           queryClient.invalidateQueries({ queryKey: ['topscorers'] });
        }
        
        return results;
      } catch {
        return [];
      }
    },
    refetchInterval: getSmartPollingInterval,
  });
}

// ---------- Live matches across all leagues (API-Football) ----------
export function useAllLiveFixtures() {
  return useQuery({
    queryKey: ['all-live-fixtures'],
    queryFn: async () => {
      try {
        let apiKey = '19a3b0d1fe31969b6b6e615f1c38fccd';
        try {
          const { data: eplKeySetting } = await supabase
            .from('site_settings')
            .select('value_en')
            .eq('key', 'api_key_epl')
            .single();
          if (eplKeySetting?.value_en) {
            apiKey = eplKeySetting.value_en;
          }
        } catch {}

        const response = await fetch('https://v3.football.api-sports.io/fixtures?live=all', {
          method: 'GET',
          headers: {
            'x-rapidapi-host': 'v3.football.api-sports.io',
            'x-rapidapi-key': apiKey
          }
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        
        if (data.errors && Object.keys(data.errors).length > 0) {
          console.error('[API-Football] errors:', data.errors);
          return [];
        }

        const interestedLeagueIds = Object.values(leaguesConfig)
          .map(l => l.apiLeagueId)
          .filter(Boolean) as number[];

        let results: Match[] = [];
        if (data?.response?.length) {
          const filteredResponse = data.response.filter((item: any) => 
            item?.league?.id && interestedLeagueIds.includes(Number(item.league.id))
          );
          results = filteredResponse.map(mapFixture);
        }
        return results;
      } catch (err) {
        console.error('[API-Football] useAllLiveFixtures error:', err);
        return [];
      }
    },
    refetchInterval: 60_000, // Refetch live scores every 1 minute
  });
}

// ---------- Upcoming fixtures ----------
export function useUpcomingFixtures() {
  return useQuery({
    queryKey: ['upcoming-fixtures'],
    queryFn: async () => {
      try {
        const data = await callProxy({ endpoint: 'fixtures', league: WC_LEAGUE, season: WC_SEASON });
        let results: Match[] = [];
        if (data?.espn) {
          results = getUpcomingOnly(data.response.map(mapEspnFixture));
        } else if (data?.matches?.length) {
          results = getUpcomingOnly(data.matches as Match[]);
        } else if (data?.response?.length) {
          results = getUpcomingOnly(data.response.map(mapFixture));
        }
        results = [...results, ...getUpcomingMatches()];
        
        const now = Date.now();
        return results
          .filter(m => m && m.date && new Date(m.date).getTime() >= now)
          .sort((a, b) => {
            if (!a?.date || !b?.date) return 0;
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          });
      } catch {
        return [];
      }
    },
    refetchInterval: false,
  });
}

const normalizeTeam = (apiName: string, apiId?: string) => {
  const name = apiName.toLowerCase().trim();
  const teamsMap = Object.values(teams);
  const exact = teamsMap.find(t => t.name.toLowerCase() === name || t.id === apiId);
  if (exact) return exact;
  
  if (name.includes('korea') && name.includes('south')) return teams.KOR;
  if (name.includes('bosnia')) return teams.BIH;
  if (name === 'usa' || name === 'united states' || name.includes('usa')) return teams.USA;
  if (name.includes('turkey') || name.includes('turkiye') || name.includes('türkiye')) return teams.TUR;
  if (name.includes('czech')) return teams.CZE;
  if (name.includes('curacao') || name.includes('curaçao')) return teams.CUR;
  if (name.includes('cape') && name.includes('verde')) return teams.CPV;
  if (name === 'iran') return teams.IRN;
  if (name.includes('congo dr') || name === 'congo republic') return teams.DRC;
  return null;
};

// ---------- Results ----------
export function useResults() {
  return useQuery({
    queryKey: ['results'],
    queryFn: async () => {
      try {
        const data = await callProxy({ endpoint: 'results', league: WC_LEAGUE, season: WC_SEASON });
        let proxyResults: Match[] = [];
        if (data?.espn) {
          proxyResults = getFinishedOnly(data.response.map(mapEspnFixture));
        } else if (data?.matches?.length) {
          proxyResults = getFinishedOnly(data.matches as Match[]);
        } else if (data?.response?.length) {
          proxyResults = getFinishedOnly(data.response.map(mapFixture));
        }
        proxyResults = [...proxyResults, ...getFinishedMatches()];
        
        proxyResults = proxyResults.map(m => {
          const homeTeam = normalizeTeam(m.home.name, m.home.id);
          const awayTeam = normalizeTeam(m.away.name, m.away.id);
          
          let normalizedWinnerId = undefined;
          if (m.winnerId) {
            if (m.winnerId === m.home.id && homeTeam) {
              normalizedWinnerId = homeTeam.id;
            } else if (m.winnerId === m.away.id && awayTeam) {
              normalizedWinnerId = awayTeam.id;
            }
          }
          if (!normalizedWinnerId && m.status === 'finished') {
            if (m.homeScore > m.awayScore && homeTeam) {
              normalizedWinnerId = homeTeam.id;
            } else if (m.awayScore > m.homeScore && awayTeam) {
              normalizedWinnerId = awayTeam.id;
            }
          }

          return {
            ...m,
            home: { 
              ...m.home, 
              name: homeTeam?.name || m.home.name,
              id: homeTeam?.id || m.home.id,
              flag: homeTeam?.flag || m.home.flag 
            },
            away: { 
              ...m.away, 
              name: awayTeam?.name || m.away.name,
              id: awayTeam?.id || m.away.id,
              flag: awayTeam?.flag || m.away.flag 
            },
            winnerId: normalizedWinnerId
          };
        });

        const uniqueResults: Match[] = [];
        const seen = new Set();
        for (const m of proxyResults) {
          const key = `${m.home.name}-${m.away.name}`;
          if (!seen.has(key)) {
            seen.add(key);
            uniqueResults.push(m);
          }
        }
        
        const sortedResults = uniqueResults
          .filter(m => m && m.date)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        // Fetch highlights from Supabase
        const { data: settings, error } = await supabase.from('site_settings').select('*').like('key', 'match_highlight_%');
        if (!error && settings && settings.length > 0) {
          return sortedResults.map(match => {
            const h = settings.find((x: any) => x.key === `match_highlight_${match.id}`);
            if (h) {
              return { ...match, highlight_url: h.value_en };
            }
            return match;
          });
        }
        return sortedResults;
      } catch {
        return [];
      }
    },
    refetchInterval: false,
  });
}

// ---------- Standings / Groups ----------
export function useStandings() {
  const { data: matches } = useResults();

  return useQuery({
    queryKey: ['standings', matches],
    queryFn: async () => {
      try {
        const { getTeams } = await import('@/lib/footballData');
        const allTeams = Object.values(getTeams());
        const groups: any[] = [];
        
        const teamsInOrder = [
          ['MEX', 'RSA', 'KOR', 'CZE'], // A
          ['CAN', 'QAT', 'SUI', 'BIH'], // B
          ['BRA', 'MAR', 'HAI', 'SCO'], // C
          ['USA', 'PAR', 'AUS', 'TUR'], // D
          ['GER', 'CUR', 'CIV', 'ECU'], // E
          ['NED', 'JPN', 'SWE', 'TUN'], // F
          ['BEL', 'EGY', 'IRN', 'NZL'], // G
          ['ESP', 'KSA', 'URU', 'CPV'], // H
          ['FRA', 'SEN', 'IRQ', 'NOR'], // I
          ['ARG', 'ALG', 'AUT', 'JOR'], // J
          ['POR', 'DRC', 'COL', 'UZB'], // K
          ['ENG', 'CRO', 'GHA', 'PAN']  // L
        ];

        teamsInOrder.forEach((groupCodes, index) => {
          const groupLetter = String.fromCharCode(65 + index); // A, B, C...
          const groupTeams = groupCodes.map((code) => {
            const t = allTeams.find(x => x.id === code || x.shortName === code)!;
            return {
              id: t.id,
              rank: 0, // Will calculate later
              name: t.name,
              nameAr: t.name, // Translation handled in component
              flag: t.flag,
              played: 0,
              won: 0,
              drawn: 0,
              lost: 0,
              gf: 0,
              ga: 0,
              gd: 0,
              points: 0,
              confirmed: true,
            };
          });
          groups.push({
            name: `Group ${groupLetter}`,
            nameAr: `المجموعة ${groupLetter}`,
            teams: groupTeams
          });
        });

        if (matches && matches.length > 0) {
          matches.forEach(match => {
            for (const group of groups) {
              const homeTeam = group.teams.find((t: any) => t.name === match.home.name || t.id === match.home.id);
              const awayTeam = group.teams.find((t: any) => t.name === match.away.name || t.id === match.away.id);
              
              if (homeTeam || awayTeam) {
                const processTeam = (team: any, isHome: boolean) => {
                  if (!team) return;
                  team.played += 1;
                  const scored = isHome ? match.homeScore : match.awayScore;
                  const conceded = isHome ? match.awayScore : match.homeScore;
                  
                  team.gf += scored;
                  team.ga += conceded;
                  team.gd = team.gf - team.ga;
                  
                  if (scored > conceded) {
                    team.won += 1;
                    team.points += 3;
                  } else if (scored === conceded) {
                    team.drawn += 1;
                    team.points += 1;
                  } else {
                    team.lost += 1;
                  }
                };
                
                processTeam(homeTeam, true);
                processTeam(awayTeam, false);
              }
            }
          });

          groups.forEach(group => {
            group.teams.sort((a: any, b: any) => {
              if (b.points !== a.points) return b.points - a.points;
              if (b.gd !== a.gd) return b.gd - a.gd;
              return b.gf - a.gf;
            });
            group.teams.forEach((t: any, i: number) => { t.rank = i + 1; });
          });
        } else {
          groups.forEach(group => {
            group.teams.forEach((t: any, i: number) => { t.rank = i + 1; });
          });
        }
        
        return groups;
      } catch (e) {
        console.error('Failed to fetch standings', e);
        return [];
      }
    },
    refetchInterval: false,
  });
}

// ---------- Top Scorers ----------
export function useTopScorers(tournament: string = 'كأس العالم 2026') {
  return useQuery({
    queryKey: ['topscorers', tournament],
    queryFn: async () => {
      try {
        // 1. Fetch from database first (Primary Source)
        const { data: dbData } = await supabase
          .from('player_stats')
          .select('*')
          .eq('tournament', tournament)
          .order('goals', { ascending: false })
          .order('assists', { ascending: false });
          
        if (dbData && dbData.length > 0) {
          return dbData.map((p, i) => ({
            rank: i + 1,
            name: p.player_name,
            club: p.team_name,
            country: {
              id: p.team_name,
              name: p.team_name,
              shortName: p.team_name.slice(0, 3).toUpperCase(),
              flag: resolveTeamFlag(p.team_name),
              code: p.team_name.slice(0, 2).toUpperCase(),
              color: '#888888',
            },
            goals: p.goals || 0,
            assists: p.assists || 0,
            matches: p.motm_awards || 0,
            isLeader: i === 0,
          }));
        }

        // 2. Fallback to ESPN if database is completely empty
        const data = await fetchEspnStatsDirectly();
        const goalsGroup = data?.stats?.find((g: any) => g.name === 'goalsLeaders');
        const assistsGroup = data?.stats?.find((g: any) => g.name === 'assistsLeaders');
        
        if (goalsGroup && goalsGroup.leaders && goalsGroup.leaders.length > 0) {
          const leadersMap: Record<string, any> = {};
          
          goalsGroup.leaders.forEach((l: any, i: number) => {
            const athleteId = l.athlete.id;
            const appStat = l.statistics?.find((s: any) => s.name === 'appearances');
            const goalsStat = l.statistics?.find((s: any) => s.name === 'totalGoals');
            const assistsStat = l.statistics?.find((s: any) => s.name === 'goalAssists');
            
            leadersMap[athleteId] = {
              rank: i + 1,
              name: l.athlete.displayName,
              club: l.athlete.team?.displayName || 'Unknown',
              photoUrl: l.athlete.headshot?.href || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(l.athlete.displayName)}`,
              country: {
                id: l.athlete.team?.displayName || 'Unknown',
                name: l.athlete.team?.displayName || 'Unknown',
                shortName: l.athlete.team?.abbreviation || 'UNK',
                flag: l.athlete.team?.logos?.[0]?.href || `https://flagcdn.com/w160/un.png`,
                code: l.athlete.team?.abbreviation || 'UN',
                color: '#888888',
              },
              goals: goalsStat ? goalsStat.value : (l.value || 0),
              assists: assistsStat ? assistsStat.value : 0,
              matches: appStat ? appStat.value : 0,
              isLeader: i === 0,
            };
          });
          
          if (assistsGroup && assistsGroup.leaders) {
            assistsGroup.leaders.forEach((l: any) => {
              const athleteId = l.athlete.id;
              const appStat = l.statistics?.find((s: any) => s.name === 'appearances');
              const goalsStat = l.statistics?.find((s: any) => s.name === 'totalGoals');
              const assistsStat = l.statistics?.find((s: any) => s.name === 'goalAssists');
              
              if (leadersMap[athleteId]) {
                leadersMap[athleteId].assists = assistsStat ? assistsStat.value : (l.value || 0);
              } else {
                leadersMap[athleteId] = {
                  rank: Object.keys(leadersMap).length + 1,
                  name: l.athlete.displayName,
                  club: l.athlete.team?.displayName || 'Unknown',
                  photoUrl: l.athlete.headshot?.href || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(l.athlete.displayName)}`,
                  country: {
                    id: l.athlete.team?.displayName || 'Unknown',
                    name: l.athlete.team?.displayName || 'Unknown',
                    shortName: l.athlete.team?.abbreviation || 'UNK',
                    flag: l.athlete.team?.logos?.[0]?.href || `https://flagcdn.com/w160/un.png`,
                    code: l.athlete.team?.abbreviation || 'UN',
                    color: '#888888',
                  },
                  goals: goalsStat ? goalsStat.value : 0,
                  assists: assistsStat ? assistsStat.value : (l.value || 0),
                  matches: appStat ? appStat.value : 0,
                  isLeader: false,
                };
              }
            });
          }
          
          const scorersArray = Object.values(leadersMap).sort((a: any, b: any) => {
            if (b.goals !== a.goals) return b.goals - a.goals;
            return b.assists - a.assists;
          });
          
          scorersArray.forEach((s: any, idx: number) => {
            s.rank = idx + 1;
            s.isLeader = idx === 0;
          });
          
          return scorersArray;
        }
        return [];
      } catch (err) {
        console.error('ESPN live stats fetch failed, falling back to DB:', err);
        return [];
      }
    },
    refetchInterval: false,
  });
}

export function useBestPlayers(tournament: string = 'كأس العالم 2026') {
  return useQuery({
    queryKey: ['bestplayers', tournament],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('player_stats')
          .select('*')
          .eq('tournament', tournament)
          .order('motm_awards', { ascending: false })
          .order('goals', { ascending: false });
          
        if (error || !data) return [];
        
        return data.map((p, i) => ({
          rank: i + 1,
          name: p.player_name,
          club: p.team_name,
          country: {
            id: p.team_name,
            name: p.team_name,
            shortName: p.team_name.slice(0, 3).toUpperCase(),
            flag: resolveTeamFlag(p.team_name),
            code: p.team_name.slice(0, 2).toUpperCase(),
            color: '#888888',
          },
          goals: p.goals,
          assists: p.assists,
          matches: p.motm_awards,
          isLeader: i === 0,
        }));
      } catch {
        return [];
      }
    },
    refetchInterval: false,
  });
}

export function usePlayerCards(tournament: string = 'كأس العالم 2026') {
  return useQuery({
    queryKey: ['playercards', tournament],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('player_stats')
          .select('*')
          .eq('tournament', tournament)
          .or('yellow_cards.gt.0,red_cards.gt.0')
          .order('red_cards', { ascending: false })
          .order('yellow_cards', { ascending: false });
          
        if (error || !data) return [];
        
        return data.map((p, i) => ({
          rank: i + 1,
          name: p.player_name,
          club: p.team_name,
          country: {
            id: p.team_name,
            name: p.team_name,
            flag: resolveTeamFlag(p.team_name)
          },
          yellow_cards: p.yellow_cards || 0,
          red_cards: p.red_cards || 0,
        }));
      } catch {
        return [];
      }
    },
    refetchInterval: false,
  });
}

// ---------- Mappers ----------

type ApiFixture = {
  fixture: { id: number; date: string; status: { short: string; elapsed: number | null }; venue: { name: string } };
  league: { name: string; round: string };
  teams: { home: ApiTeam; away: ApiTeam };
  goals: { home: number | null; away: number | null };
};
type ApiTeam = { id: number; name: string; logo: string; winner: boolean | null };
type ApiStandingGroup = { group?: string; rank: number; team: ApiTeam; points: number; goalsDiff: number; all: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } } }[];

function mapFixture(f: ApiFixture) {
  const statusShort = f.fixture.status.short;
  const isLive = ['1H', '2H', 'HT', 'ET', 'P', 'BT'].includes(statusShort);
  const isFinished = ['FT', 'AET', 'PEN'].includes(statusShort);
  return {
    id: String(f.fixture.id),
    competition: f.league.name,
    stage: f.league.round,
    date: f.fixture.date,
    status: isLive ? 'live' as const : isFinished ? 'finished' as const : 'upcoming' as const,
    minute: isLive && f.fixture.status.elapsed ? `${f.fixture.status.elapsed}'` : undefined,
    home: {
      id: String(f.teams.home.id),
      name: f.teams.home.name,
      shortName: f.teams.home.name.slice(0, 3).toUpperCase(),
      flag: f.teams.home.logo,
      code: f.teams.home.name.slice(0, 2).toUpperCase(),
      color: '#888888',
    },
    away: {
      id: String(f.teams.away.id),
      name: f.teams.away.name,
      shortName: f.teams.away.name.slice(0, 3).toUpperCase(),
      flag: f.teams.away.logo,
      code: f.teams.away.name.slice(0, 2).toUpperCase(),
      color: '#AAAAAA',
    },
    homeScore: f.goals.home ?? 0,
    awayScore: f.goals.away ?? 0,
    venue: f.fixture.venue?.name ?? '',
    winnerId: f.teams.home.winner ? String(f.teams.home.id) : f.teams.away.winner ? String(f.teams.away.id) : undefined,
  };
}

function mapEspnFixture(e: any): Match {
  const comp = e.competitions[0];
  const home = comp.competitors.find((c: any) => c.homeAway === 'home');
  const away = comp.competitors.find((c: any) => c.homeAway === 'away');
  
  const statusState = comp.status.type.state; // 'pre', 'in', 'post'
  const isLive = statusState === 'in';
  const isFinished = statusState === 'post';

  return {
    id: String(e.id),
    competition: e.season?.year === 2026 ? 'FIFA World Cup 2026' : e.name,
    stage: 'Group Stage', // ESPN doesn't always provide clean stage strings
    date: e.date,
    status: isLive ? 'live' : isFinished ? 'finished' : 'upcoming',
    minute: isLive ? comp.status.displayClock : undefined,
    home: {
      id: home.id,
      name: home.team.name,
      shortName: home.team.abbreviation || home.team.name.slice(0, 3).toUpperCase(),
      flag: home.team.logo,
      code: home.team.abbreviation || home.team.name.slice(0, 2).toUpperCase(),
      color: '#888888',
    },
    away: {
      id: away.id,
      name: away.team.name,
      shortName: away.team.abbreviation || away.team.name.slice(0, 3).toUpperCase(),
      flag: away.team.logo,
      code: away.team.abbreviation || away.team.name.slice(0, 2).toUpperCase(),
      color: '#AAAAAA',
    },
    homeScore: parseInt(home.score, 10) || 0,
    awayScore: parseInt(away.score, 10) || 0,
    venue: comp.venue?.fullName || '',
    winnerId: home.winner ? home.id : away.winner ? away.id : undefined,
  };
}

function getUpcomingOnly(matches: Match[]) {
  const cutoff = Date.now() - 4 * 60 * 60 * 1000;
  return matches
    .filter((match) => match && match.status === 'upcoming' && getMatchTime(match) > cutoff)
    .sort((a, b) => getMatchTime(a) - getMatchTime(b));
}

function getFinishedOnly(matches: Match[]) {
  return matches
    .filter((match) => match && match.status === 'finished')
    .sort((a, b) => getMatchTime(b) - getMatchTime(a));
}

type ApiScorer = { player: { name: string }; statistics: [{ team: { name: string; logo: string }; goals: { total: number; assists: number | null }; games: { appearences: number } }] };
function mapScorer(s: ApiScorer, i: number) {
  const stat = s.statistics[0];
  return {
    rank: i + 1,
    name: s.player.name,
    club: stat.team.name,
    country: {
      id: stat.team.name,
      name: stat.team.name,
      shortName: stat.team.name.slice(0, 3).toUpperCase(),
      flag: stat.team.logo,
      code: stat.team.name.slice(0, 2).toUpperCase(),
      color: '#888888',
    },
    goals: stat.goals.total ?? 0,
    assists: stat.goals.assists ?? 0,
    matches: stat.games.appearences ?? 0,
    isLeader: i === 0,
  };
}

// ---------- League-Specific Hooks (API-Football Direct) ----------

const keysCache: Record<string, string> = {};

const getApiKeyForLeagueId = async (apiLeagueId?: number): Promise<string> => {
  const defaultKey = '19a3b0d1fe31969b6b6e615f1c38fccd';
  if (!apiLeagueId) return defaultKey;
  const league = Object.values(leaguesConfig).find((l) => l.apiLeagueId === apiLeagueId);
  if (!league) return defaultKey;
  
  if (keysCache[league.id]) {
    return keysCache[league.id];
  }

  try {
    const { data } = await supabase
      .from('site_settings')
      .select('value_en')
      .eq('key', `api_key_${league.id}`)
      .single();
    if (data?.value_en) {
      keysCache[league.id] = data.value_en;
      return data.value_en;
    }
  } catch (err) {
    console.error('Failed to load api key from supabase:', err);
  }
  return league.apiKey || defaultKey;
};

export function useLeagueAllFixtures(leagueId?: number, season?: number) {
  return useQuery({
    queryKey: ['league-fixtures', leagueId, season],
    queryFn: async () => {
      if (!leagueId || !season) return [];
      try {
        const apiKey = await getApiKeyForLeagueId(leagueId);
        const response = await fetch(`https://v3.football.api-sports.io/fixtures?league=${leagueId}&season=${season}`, {
          method: 'GET',
          headers: {
            'x-rapidapi-host': 'v3.football.api-sports.io',
            'x-rapidapi-key': apiKey
          }
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        
        if (data.errors && Object.keys(data.errors).length > 0) {
          console.error('[API-Football] errors:', data.errors);
          return [];
        }

        let results: Match[] = [];
        if (data?.response?.length) {
          results = data.response.map(mapFixture);
        }
        return results;
      } catch (err) {
        console.error('[API-Football] useLeagueAllFixtures error:', err);
        return [];
      }
    },
    enabled: !!leagueId && !!season,
    refetchInterval: 120_000, // 2 minutes
  });
}

export interface StandingsTeam {
  rank: number;
  team: {
    id: string;
    name: string;
    logo: string;
  };
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
  form?: string;
}

export function useLeagueStandings(leagueId?: number, season?: number) {
  return useQuery({
    queryKey: ['league-standings', leagueId, season],
    queryFn: async () => {
      if (!leagueId || !season) return [];
      try {
        const apiKey = await getApiKeyForLeagueId(leagueId);
        const response = await fetch(`https://v3.football.api-sports.io/standings?league=${leagueId}&season=${season}`, {
          method: 'GET',
          headers: {
            'x-rapidapi-host': 'v3.football.api-sports.io',
            'x-rapidapi-key': apiKey
          }
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        
        if (data.errors && Object.keys(data.errors).length > 0) {
          console.error('[API-Football] errors:', data.errors);
          return [];
        }

        const standings = data?.response?.[0]?.league?.standings?.[0] || [];
        return standings.map((item: any) => ({
          rank: item.rank,
          team: {
            id: String(item.team.id),
            name: item.team.name,
            logo: item.team.logo,
          },
          played: item.all.played,
          won: item.all.win,
          drawn: item.all.draw,
          lost: item.all.lose,
          gf: item.all.goals.for,
          ga: item.all.goals.against,
          gd: item.goalsDiff,
          points: item.points,
          form: item.form,
        })) as StandingsTeam[];
      } catch (err) {
        console.error('[API-Football] useLeagueStandings error:', err);
        return [];
      }
    },
    enabled: !!leagueId && !!season,
    refetchInterval: 300_000, // 5 minutes
  });
}

export interface ScorersPlayer {
  rank: number;
  name: string;
  club: string;
  goals: number;
  assists: number;
  matches: number;
  photo: string;
  logo: string;
}

export function useLeagueTopScorers(leagueId?: number, season?: number) {
  return useQuery({
    queryKey: ['league-topscorers', leagueId, season],
    queryFn: async () => {
      if (!leagueId || !season) return [];
      try {
        const apiKey = await getApiKeyForLeagueId(leagueId);
        const response = await fetch(`https://v3.football.api-sports.io/players/topscorers?league=${leagueId}&season=${season}`, {
          method: 'GET',
          headers: {
            'x-rapidapi-host': 'v3.football.api-sports.io',
            'x-rapidapi-key': apiKey
          }
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        
        if (data.errors && Object.keys(data.errors).length > 0) {
          console.error('[API-Football] errors:', data.errors);
          return [];
        }

        const players = data?.response || [];
        return players.map((item: any, index: number) => {
          const p = item.player;
          const stat = item.statistics[0];
          return {
            rank: index + 1,
            name: p.name,
            club: stat.team.name,
            goals: stat.goals.total || 0,
            assists: stat.goals.assists || 0,
            matches: stat.games.appearences || 0,
            photo: p.photo,
            logo: stat.team.logo,
          };
        }) as ScorersPlayer[];
      } catch (err) {
        console.error('[API-Football] useLeagueTopScorers error:', err);
        return [];
      }
    },
    enabled: !!leagueId && !!season,
    refetchInterval: 600_000, // 10 minutes
  });
}

export type { ApiStandingGroup };


