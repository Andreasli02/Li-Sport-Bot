import * as EsportApi from "./lol-esports-api.ts";

// const response = await EsportApi.getSchedule();

// response.data.schedule.events.forEach((event) => console.log(event));

await EsportApi.getLiveStats();
