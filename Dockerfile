FROM oven/bun:latest

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile

COPY . .

ENV PORT=8000
EXPOSE 8000

CMD ["bun", "run", "start"]