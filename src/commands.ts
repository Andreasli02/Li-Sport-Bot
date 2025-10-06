import "@std/dotenv/load";

const DISCORD_TOKEN = Deno.env.get("DISCORD_TOKEN") ?? (() => {
  throw new Error("DISCORD_TOKEN variable not found");
})();
const APP_ID = Deno.env.get("APP_ID") ?? (() => {
  throw new Error("APP_ID variable not found");
})();
const GUILD_ID = Deno.env.get("GUILD_ID") ?? (() => {
  throw new Error("GUILD_ID variable not found");
})();

await fetch(
  `https://discord.com/api/v10/applications/${APP_ID}/guilds/${GUILD_ID}/commands`,
  {
    method: "PUT",
    headers: {
      "Authorization": `Bot ${DISCORD_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      {
        name: "test",
        description: "Test command",
      },
    ]),
  },
).then(console.log);
