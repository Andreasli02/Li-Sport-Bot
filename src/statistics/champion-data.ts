import { readFileSync } from "node:fs";

// export type ChampionDataType = {
//   Champion: string;
//   ChampionDuplicate: string;
//   Picks: string;
//   Bans: string;
//   PrioScore: string;
//   Wins: string;
//   Losses: string;
//   Winrate: string;
//   KDA: string;
//   AvgBanTurn: string;
//   AvgRoundPicked: string;
//   GameTime: string;
//   CSPerMinute: string;
//   DamagePerMinute: string;
//   GoldPerMinute: string;
//   CSDifferentialAt15: string;
//   GoldDifferentialAt15: string;
//   XPDifferentialAt15: string;
// };

const csvText = readFileSync("./src/statistics/league.csv", "utf8");
const rows = csvText.split("\n");

const headers = rows[0].split(",");
const values = rows.slice(1).map((a) => {
  const object: any = {};
  const x = a.split(",");
  object[headers[0]] = x[0].slice(1);
  for (let i = 1; i < headers.length; i++) {
    object[headers[i]] = x[i];
  }
  return object;
});

console.log(values[0]);
