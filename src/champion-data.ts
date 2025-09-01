import { readFileSync } from "node:fs";

const csvText = readFileSync("./src/league.csv", "utf8");

console.log(csvText);

export type ChampionDataType = {
  Champion: string;
  ChampionDuplicate: string;
  Picks: string;
  Bans: string;
  PrioScore: string;
  Wins: string;
  Losses: string;
  Winrate: string;
  KDA: string;
  AvgBanTurn: string;
  AvgRoundPicked: string;
  GameTime: string;
  CSPerMinute: string;
  DamagePerMinute: string;
  GoldPerMinute: string;
  CSDifferentialAt15: string;
  GoldDifferentialAt15: string;
  XPDifferentialAt15: string;
};
