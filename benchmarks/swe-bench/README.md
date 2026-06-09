# Benchhy

A benchmark for AI agents. A monorepo with 20 seeded bugs ranging from simple to hard, across a full-stack TypeScript application.

## Stack

- **Frontend**: TanStack Start, TanStack Router, TanStack Query, React, Tailwind CSS
- **Backend**: Hono, Zod
- **Database**: Prisma ORM with SQLite
- **Monorepo**: pnpm workspaces, Turborepo

## Quick Start

```bash
# Install dependencies, generate Prisma client, push schema, seed data
pnpm setup

# Start both API and web dev servers
pnpm dev

# Run tests
pnpm test

# Build everything
pnpm build
```

## Project Structure

```
benchhy/
├── apps/
│   ├── api/          # Hono API server
│   └── web/          # TanStack Start frontend
├── packages/
│   ├── db/           # Prisma schema and client
│   ├── shared/       # Zod schemas and shared types
│   └── ui/           # Shared React components
├── task.md           # Agent instructions
├── format.md         # Output format specification
└── docker-compose.yaml
```

## Agent Benchmark

See `task.md` for the full benchmark instructions. Agents must find and fix 20 bugs without prior knowledge of their locations.

## Bug Categories

1. Easy: Syntax errors, missing awaits, wrong config values
2. Medium: Logic errors, missing transactions, query invalidation bugs
3. Hard: Race conditions, connection pool issues, unhandled rejections, subtle framework behavior changes

## License

MIT
