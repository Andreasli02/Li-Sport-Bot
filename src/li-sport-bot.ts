import express, { Request, Response } from "express";
import {
  InteractionResponseFlags,
  InteractionResponseType,
  InteractionType,
  MessageComponentTypes,
  verifyKeyMiddleware,
} from "discord-interactions";
import "@std/dotenv/load";
import * as EsportApi from "./lol-esports-api.ts";

const app = express();

const PUBLIC_KEY = Deno.env.get("PUBLIC_KEY") ?? (() => {
  throw new Error("PUBLIC_KEY variable not found");
})();

app.post(
  "/interactions",
  verifyKeyMiddleware(PUBLIC_KEY),
  async (req: Request, res: Response) => {
    const { type, data } = req.body;

    if (type === InteractionType.PING) {
      return res.send({ type: InteractionResponseType.PONG });
    }

    if (type === InteractionType.APPLICATION_COMMAND) {
      const { name } = data;

      if (name === "test") {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            flags: InteractionResponseFlags.IS_COMPONENTS_V2,
            components: [
              {
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: `hello world`,
              },
            ],
          },
        });
      }

      if (name === "schedule") {
        const schedule = await EsportApi.getSchedule();
        const events = schedule.data.schedule.events
          .filter((event) => {
            return event.state !== "completed";
          })
          .slice(0, 5);

        const content = events
          .map((event) => {
            const [team1, team2] = event.match.teams;
            const start = new Date(event.startTime).toLocaleString("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
            });
            return `**${team1.name}** vs **${team2.name}** (${event.league.name})\n${start}\n`;
          })
          .join("\n");

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            flags: InteractionResponseFlags.IS_COMPONENTS_V2,
            components: [
              {
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: `${content}`,
              },
            ],
          },
        });
      }
    }
  },
);

app.listen(8999, () => {
  console.log("Example app listening at http://localhost:8999");
});
