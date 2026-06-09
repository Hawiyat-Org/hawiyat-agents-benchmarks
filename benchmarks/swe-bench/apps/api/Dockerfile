FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm@9.0.0

COPY pnpm-workspace.yaml package.json tsconfig.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/db/package.json ./packages/db/
COPY packages/shared/package.json ./packages/shared/
COPY packages/ui/package.json ./packages/ui/

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm db:generate
RUN pnpm db:push
RUN pnpm db:seed
RUN pnpm build

EXPOSE 3001

CMD ["node", "apps/api/dist/index.js"]
