FROM oven/bun:latest

WORKDIR /app

COPY package.json bun.lockb ./

RUN bun install --frozen-lockfile

COPY . .

EXPOSE 8000

CMD ["bun", "run", "src/index.ts"]