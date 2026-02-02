import { parse } from "jsr:@std/csv";

export type ChampionStats = {
  picks: number;
  winRate: number;
  prioScore: number;
};

const CHAMPION_NAME_MAP: Record<string, string> = {
  wukong: "monkeyking",
  "renata glasc": "renata",
  nunu: "nunu & willump",
  "jarvan iv": "jarvaniv",
  "xin zhao": "xinzhao",
  "lee sin": "leesin",
  "aurelion sol": "aurelionsol",
  "twisted fate": "twistedfate",
  "master yi": "masteryi",
  "tahm kench": "tahmkench",
};

function normalizeChampionName(championId: string): string {
  const lower = championId.toLowerCase();
  return CHAMPION_NAME_MAP[lower] ?? lower;
}

function parsePercent(value: string): number {
  const parsed = parseInt(value.replace("%", ""));
  return isNaN(parsed) ? 0 : parsed / 100;
}

export async function getChampionStats(): Promise<Map<string, ChampionStats>> {
  const stats = new Map<string, ChampionStats>();

  const csvPath = new URL("./champion-data.csv", import.meta.url);
  const csvContent = await Deno.readTextFile(csvPath);

  const records = parse(csvContent, { skipFirstRow: true }) as Record<
    string,
    string
  >[];

  for (const record of records) {
    const championName = record.Champion.replace(/[^\w\s'.]/g, "").trim();
    if (!championName) continue;

    stats.set(normalizeChampionName(championName), {
      picks: parseInt(record.Picks) || 0,
      winRate: parsePercent(record.Winrate),
      prioScore: parsePercent(record.PrioScore),
    });
  }

  return stats;
}
