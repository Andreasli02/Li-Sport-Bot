FROM debian:12.12-slim AS base

WORKDIR /app

# Install Deno
COPY --from=denoland/deno:bin-2.5.6 /deno /usr/local/bin/deno

# Install curl
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*

FROM base AS local

# Install git
RUN apt-get update && \
    apt-get install -y git openssh-server && \
    rm -rf /var/lib/apt/lists/*

# Production image for notzure
FROM base AS production

# Copy application files
COPY . .

EXPOSE 8999

# Cache the dependencies
RUN deno cache ./src/li-sport-bot.ts

CMD ["deno", "task", "start"]