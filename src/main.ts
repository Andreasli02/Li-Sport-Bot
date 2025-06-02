import * as EsportApi from "./lol-esports-api.ts";

const response = await EsportApi.getSchedule();

console.log(
  response.data.schedule.events.forEach((event) =>
    console.log(event.match.teams)
  ),
);
