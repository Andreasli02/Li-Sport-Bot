import express from "express";
import {
  InteractionResponseFlags,
  InteractionResponseType,
  InteractionType,
  MessageComponentTypes,
  verifyKeyMiddleware,
} from "discord-interactions";
import "jsr:@std/dotenv/load";

const app = express();

const PUBLIC_KEY = Deno.env.get("PUBLIC_KEY") ?? (() => {
  throw new Error("PUBLIC_KEY variable not found");
})();

app.post(
  "/interactions",
  verifyKeyMiddleware(PUBLIC_KEY),
  (req: any, res: any) => {
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
                content: `hello world 2`,
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
