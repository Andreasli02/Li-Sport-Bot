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
import * as ChampionStats from "./champion-stats/champion-stats-data.ts";

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

      if (name === "predict") {
        try {
          const liveGames = await EsportApi.getLiveDraft();

          if (liveGames.length === 0) {
            return res.send({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                flags: InteractionResponseFlags.IS_COMPONENTS_V2,
                components: [
                  {
                    type: MessageComponentTypes.TEXT_DISPLAY,
                    content: "No live games currently in progress.",
                  },
                ],
              },
            });
          }

          const championStats = await ChampionStats.getChampionStats();

          const getWinRate = (championId: string): number => {
            const stats = championStats.get(championId.toLowerCase());
            return stats && stats.picks >= 5 ? stats.winRate : 0.5;
          };

          const formatWinRate = (rate: number): string =>
            `${Math.round(rate * 100)}%`;

          const predictions = liveGames.map((game) => {
            const blueTeam = game.blueTeamMetadata;
            const redTeam = game.redTeamMetadata;

            if (
              blueTeam.participantMetadata.length < 5 ||
              redTeam.participantMetadata.length < 5
            ) {
              return "Draft in progress - prediction unavailable";
            }

            const blueWinRates = blueTeam.participantMetadata.map((p) => ({
              champion: p.championId,
              winRate: getWinRate(p.championId),
            }));

            const redWinRates = redTeam.participantMetadata.map((p) => ({
              champion: p.championId,
              winRate: getWinRate(p.championId),
            }));

            const blueAvg = blueWinRates.reduce((sum, c) =>
              sum + c.winRate, 0) /
              blueWinRates.length;
            const redAvg = redWinRates.reduce((sum, c) => sum + c.winRate, 0) /
              redWinRates.length;

            const blueProb = blueAvg / (blueAvg + redAvg);
            const redProb = redAvg / (blueAvg + redAvg);

            const predictedWinner = blueProb >= redProb
              ? "Blue Side"
              : "Red Side";

            const blueChampions = blueWinRates
              .map((c) => `${c.champion} (${formatWinRate(c.winRate)})`)
              .join(", ");

            const redChampions = redWinRates
              .map((c) => `${c.champion} (${formatWinRate(c.winRate)})`)
              .join(", ");

            return `**Prediction: ${predictedWinner}** (${
              (blueProb * 100).toFixed(1)
            }% vs ${(redProb * 100).toFixed(1)}%)

            **Blue Team** (Avg: ${(blueAvg * 100).toFixed(1)}%)
            ${blueChampions}

            **Red Team** (Avg: ${(redAvg * 100).toFixed(1)}%)
            ${redChampions}`;
          });

          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              flags: InteractionResponseFlags.IS_COMPONENTS_V2,
              components: [
                {
                  type: MessageComponentTypes.TEXT_DISPLAY,
                  content: predictions.join("\n\n---\n\n"),
                },
              ],
            },
          });
        } catch (error) {
          console.error("Predict command error:", error);
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              flags: InteractionResponseFlags.IS_COMPONENTS_V2,
              components: [
                {
                  type: MessageComponentTypes.TEXT_DISPLAY,
                  content:
                    "An error occurred while fetching prediction data. Please try again later.",
                },
              ],
            },
          });
        }
      }
    }
  },
);

app.listen(8999, () => {
  console.log("Example app listening at http://localhost:8999");
});
