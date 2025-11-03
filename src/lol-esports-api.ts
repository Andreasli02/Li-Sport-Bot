import "@std/dotenv/load";

const API_KEY = Deno.env.get("API_KEY") ?? (() => {
  throw new Error("API_KEY variable not found");
})();
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
  const response = await fetch(
    `https://esports-api.lolesports.com/persisted/gw/getSchedule?hl=en-US`,
    {
      headers: {
        "x-api-key": API_KEY,
      },
    },
  );

  return response.json();
}

type Event = {
  id: string;
  startTime: string;
  state: "inProgress" | "unstarted" | string;
  match: Match;
};

type Match = {
  id: string;
  strategy: {
    type: "bestOf" | string;
    count: number;
  };
  games: Game[];
};

type Game = {
  number: number;
  id: string;
  state: "inProgress" | "unstarted" | string;
  teams: {
    id: string;
    side: "blue" | "red";
  }[];
};

type ParticipantMetadata = {
  participantId: number;
  esportsPlayerId: string;
  summonerName: string;
  championId: string;
  role: "top" | "jungle" | "mid" | "bottom" | "support";
};

type TeamMetadata = {
  esportsTeamId: string;
  participantMetadata: ParticipantMetadata[];
};

type GameMetadata = {
  patchVersion: string;
  blueTeamMetadata: TeamMetadata;
  redTeamMetadata: TeamMetadata;
};

export async function getLiveDraft(): Promise<GameMetadata[]> {
  const gameData = await fetch(
    `https://esports-api.lolesports.com/persisted/gw/getLive?hl=en-US`,
    {
      headers: {
        "x-api-key": API_KEY,
      },
    },
  ).then((res) => res.json());

  const liveEvents: Event[] = gameData.data.schedule.events;

  const liveGamesInProgress = liveEvents.flatMap((event) => {
    return event.match.games.filter((game) => game.state === "inProgress");
  });

  const liveGameStats = (await Promise.all(
    liveGamesInProgress.map((liveGame) =>
      fetch(
        `https://feed.lolesports.com/livestats/v1/window/${liveGame.id}`,
        {
          headers: { "x-api-key": API_KEY },
        },
      )
        .then((res) => (res.body ? res.json() : null))
    ),
  )).filter(Boolean);

  return liveGameStats.map((liveGameStat) =>
    liveGameStat.gameMetadata
  ) as GameMetadata[];
}

// https://gol.gg/champion/list/season-S15/split-Summer/tournament-ALL/

// export async function getSchedule(): Promise<Schedule> {
//   const response = await fetch(
//     `https://esports-api.lolesports.com/persisted/gw/getSchedule?hl=en-US`,
//     {
//       headers: {
//         "x-api-key": API_KEY,
//       },
//     },
//   );

//   return response.json();
// }

export async function test(): Promise<Schedule> {
  const response = await fetch(
    `https://api.lolesports.com/api/v1/teams`,
    {
      headers: {
        "x-api-key": API_KEY,
        slug: "GEN",
      },
    },
  );

  return response.json();
}
