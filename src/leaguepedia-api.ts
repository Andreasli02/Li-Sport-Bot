// Leaguepedia Cargo API for champion statistics from professional matches

const LEAGUEPEDIA_API = "https://lol.fandom.com/api.php";

type CargoQueryResponse = {
  cargoquery: Array<{
    title: {
      Champion: string;
      Winner: string;
      Team: string;
    };
  }>;
};

export type ChampionStats = {
  picks: number;
  wins: number;
  winRate: number;
};

// Champion name normalization map for differences between LoL Esports API and Leaguepedia
const CHAMPION_NAME_MAP: Record<string, string> = {
  // LoL Esports API name -> Leaguepedia name
  monkeyking: "Wukong",
  ksante: "K'Sante",
  kaisa: "Kai'Sa",
  khazix: "Kha'Zix",
  reksai: "Rek'Sai",
  chogath: "Cho'Gath",
  kogmaw: "Kog'Maw",
  velkoz: "Vel'Koz",
  belveth: "Bel'Veth",
  renata: "Renata Glasc",
  wukong: "Wukong",
  nunu: "Nunu & Willump",
};

/**
 * Normalize champion ID from LoL Esports API to Leaguepedia format
 */
export function normalizeChampionName(championId: string): string {
  const lower = championId.toLowerCase();

  // Check if there's a specific mapping
  if (CHAMPION_NAME_MAP[lower]) {
    return CHAMPION_NAME_MAP[lower];
  }

  // Default: capitalize first letter (most champion names work this way)
  return championId.charAt(0).toUpperCase() + championId.slice(1);
}

/**
 * Fetch champion statistics from Leaguepedia Cargo API
 * Queries professional match data from 2025 onwards
 */
export async function getChampionStats(): Promise<Map<string, ChampionStats>> {
  const stats = new Map<string, ChampionStats>();

  // Query champion picks with game winner info
  // We need to determine if the champion's team won
  const params = new URLSearchParams({
    action: "cargoquery",
    tables: "ScoreboardPlayers=SP,ScoreboardGames=SG",
    join_on: "SP.GameId=SG.GameId",
    fields: "SP.Champion,SP.Team,SG.Winner",
    where: 'SG.DateTime_UTC > "2025-01-01"',
    limit: "500",
    format: "json",
  });

  try {
    const response = await fetch(`${LEAGUEPEDIA_API}?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Leaguepedia API error: ${response.status}`);
    }

    const data: CargoQueryResponse = await response.json();

    if (!data.cargoquery) {
      console.error("Unexpected Leaguepedia response:", data);
      return stats;
    }

    // Process each record
    for (const record of data.cargoquery) {
      const { Champion, Team, Winner } = record.title;

      if (!Champion) continue;

      // Normalize champion name for consistent lookup
      const champKey = Champion.toLowerCase();

      if (!stats.has(champKey)) {
        stats.set(champKey, { picks: 0, wins: 0, winRate: 0.5 });
      }

      const champStats = stats.get(champKey)!;
      champStats.picks++;

      // Check if the champion's team won
      if (Team && Winner && Team === Winner) {
        champStats.wins++;
      }
    }

    // Calculate win rates
    for (const [_key, champStats] of stats) {
      if (champStats.picks > 0) {
        champStats.winRate = champStats.wins / champStats.picks;
      }
    }

    return stats;
  } catch (error) {
    console.error("Failed to fetch Leaguepedia stats:", error);
    return stats;
  }
}

/**
 * Get win rate for a specific champion
 * Returns 0.5 (50%) if champion not found in data
 */
export function getChampionWinrate(
  stats: Map<string, ChampionStats>,
  championId: string,
): number {
  const normalizedName = normalizeChampionName(championId);
  const champKey = normalizedName.toLowerCase();

  const champStats = stats.get(champKey);

  if (champStats && champStats.picks >= 5) {
    // Only use stats if we have at least 5 games for reliability
    return champStats.winRate;
  }

  // Default to 50% if no data or insufficient data
  return 0.5;
}

/**
 * Format win rate as percentage string
 */
export function formatWinRate(winRate: number): string {
  return `${Math.round(winRate * 100)}%`;
}
