import "jsr:@std/dotenv/load";

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
    `https://esports-api.lolesports.com/persisted/gw/getSchedule?hl=en-US&leagueId=98767991314006698`,
    {
      headers: {
        "x-api-key": API_KEY,
      },
    },
  );

  return response.json();
}

// https://esports-api.lolesports.com/persisted/gw/getLive?hl=en-US

// https://feed.lolesports.com/livestats/v1/window/114256531619946030

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

export async function getLiveStats(): Promise<any> {
  const gameData = await fetch(
    `https://esports-api.lolesports.com/persisted/gw/getLive?hl=en-US`,
    {
      headers: {
        "x-api-key": API_KEY,
      },
    },
  ).then((res) => res.json());

  const liveEvents: Event[] = gameData.data.schedule.events;

  const liveEventsInprogress = liveEvents.flatMap((event) => {
    return event.match.games.filter((game) => game.state === "inProgress");
  });

  console.log(liveEventsInprogress);

  for (const liveEvent of liveEventsInprogress) {
    const yolo = await fetch(
      `https://feed.lolesports.com/livestats/v1/window/${liveEvent.id}`,
      {
        headers: {
          "x-api-key": API_KEY,
        },
      },
    ).then((res) => {
      if (res.body) {
        return res.json();
      }

      return null;
    });

    console.log(yolo);
  }
}
