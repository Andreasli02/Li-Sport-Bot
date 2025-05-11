import "jsr:@std/dotenv/load";

const API_URL_PERSISTED = "https://esports-api.lolesports.com/persisted/gw"
const API_URL_LIVE = "https://feed.lolesports.com/livestats/v1"
const API_KEY = Deno.env.get("API_KEY") ?? (() => {throw new Error("API_KEY variable not found")})();


export async function getScheduleResponse(): Promise<any> {
  const response = await fetch(`${API_URL_PERSISTED}/getSchedule?hl=en-US`, {
      headers: {
          "x-api-key": API_KEY,
      },
  })

  return response.json()
}

