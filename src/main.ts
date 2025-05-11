import * as EsportApi from "./lol-esports-api.ts";

const response = await EsportApi.getScheduleResponse()

console.log(response)