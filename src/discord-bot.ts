import { Hono } from "hono";
import process from "node:process";
import {
  InteractionResponseFlags,
  InteractionResponseType,
  InteractionType,
  MessageComponentTypes,
  verifyKeyMiddleware,
} from "discord-interactions";
import "jsr:@std/dotenv/load";

const PUBLIC_KEY = Deno.env.get("PUBLIC_KEY") ?? (() => {
  throw new Error("PUBLIC_KEY variable not found");
})();

const app = new Hono();

const PORT = process.env.PORT || 3000;

app.post("/interactions", async (c, next) => {
  const verified = await verifyKeyMiddleware(PUBLIC_KEY);

  if (!verified) {
    return c.json({ error: "Invalid request signature" }, 401);
  }

  await next();
});

app.post("/interactions", async (c) => {
  const body = await c.req.json();
  const { type, data } = body;

  if (type === InteractionType.PING) {
    return c.json({ type: InteractionResponseType.PONG });
  }

  // Handle slash commands
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    if (name === "test") {
      return c.json({
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
  }

  return c.json({ error: "unknown command" }, 400);
});
