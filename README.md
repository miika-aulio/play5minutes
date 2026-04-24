# play 5 minutes

A portfolio of small games. None longer than five minutes.

Built with React + Vite + TypeScript, database on Supabase, hosted on Cloudflare Pages.

## Development

```bash
npm install
cp .env.example .env.local   # fill in your Supabase values
npm run dev
```

## Build

```bash
npm run build   # outputs to dist/
npm run preview # preview the build locally
```

## Structure

```
src/
├── App.tsx              # Router and layout
├── pages/
│   └── Home.tsx         # Landing page with game list
├── games/
│   └── makkara/
│       └── Makkara.tsx  # Sausage game
└── shared/
    └── supabase.ts      # Database client and helpers
```

## Supabase schema

Run this in the SQL editor of your Supabase project:

```sql
create table scores (
  id uuid primary key default gen_random_uuid(),
  game_id text not null,
  name text not null check (length(name) between 1 and 16),
  score numeric not null,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index scores_game_score_idx on scores (game_id, score desc, created_at asc);

alter table scores enable row level security;

create policy "scores readable by anyone"
  on scores for select using (true);

create policy "scores insertable by anyone"
  on scores for insert with check (true);
```

## Deployment

1. Push to GitHub
2. Cloudflare Pages → Connect to Git → select repo
3. Build command: `npm run build`
4. Output directory: `dist`
5. Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
6. Add custom domain: `play5minutes.com`
