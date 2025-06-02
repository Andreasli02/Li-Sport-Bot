import "jsr:@std/dotenv/load";

const API_KEY = Deno.env.get("API_KEY") ?? (() => {
  throw new Error("API_KEY variable not found");
})();

//export const ITEMS_URL = "https://ddragon.leagueoflegends.com/cdn/14.3.1/img/item/"
// export const CHAMPIONS_URL = "https://ddragon.bangingheads.net/cdn/14.3.1/img/champion/"
// const ITEMS_JSON_URL = `https://ddragon.leagueoflegends.com/cdn/14.3.1/data/en_US/item.json`

// export const ITEMS_URL = "https://ddragon.bangingheads.net/cdn/PATCH_VERSION/img/item/"
// export const CHAMPIONS_URL = "https://ddragon.leagueoflegends.com/cdn/PATCH_VERSION/img/champion/"
// export const RUNES_JSON_URL = "https://ddragon.leagueoflegends.com/cdn/PATCH_VERSION/data/en_US/runesReforged.json"
// export const ITEMS_JSON_URL = `https://ddragon.leagueoflegends.com/cdn/PATCH_VERSION/data/en_US/item.json`

const API_URL_PERSISTED = "https://esports-api.lolesports.com/persisted/gw";
const API_URL_LIVE = "https://feed.lolesports.com/livestats/v1";

type Schedule = {
  data: {
    schedule: {
      pages: {
        older: string;
        newer: string;
      };
      events: {
        startTime: string;
        state: string;
        type: string;
        blockName: string;
        league: { name: string; slug: string };
        match: {
          id: string;
          flags: string[]; //"isSpoiler"
          teams: [
            {
              name: string;
              code: string;
              image: string;
              result: { outcome: "win" | "loss" | null; gameWins: number };
              record: { wins: number; losses: number } | null;
            },
            {
              name: string;
              code: string;
              image: string;
              result: { outcome: "win" | "loss" | null; gameWins: number };
              record: { wins: number; losses: number } | null;
            },
          ];
          strategy: { type: "bestOf"; count: number };
        };
      }[];
    };
  };
};

export async function getSchedule(): Promise<Schedule> {
  const response = await fetch(`${API_URL_PERSISTED}/getSchedule?hl=en-US`, {
    headers: {
      "x-api-key": API_KEY,
    },
  });

  return response.json();
}
