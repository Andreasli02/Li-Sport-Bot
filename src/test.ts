import * as EsportApi from "./lol-esports-api.ts";
import * as ChampionStats from "./champion-stats/champion-stats-data.ts";

// console.log(await ChampionStats.getChampionStats());
console.log(await EsportApi.getLiveDraft());
