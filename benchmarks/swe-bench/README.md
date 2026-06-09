# Benchhy

A benchmark for AI agents. A full-stack TypeScript application with issues to discover and fix.

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

See `task.md` for the full benchmark instructions.

## License

MIT
