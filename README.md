<p align="center">
  <img src="public/favicon.svg" width="80" height="80" alt="FallingBlocks logo">
</p>

<h1 align="center">FallingBlocks</h1>

<p align="center">Endless survival. 40-line sprint.</p>

<p align="center">
  <a href="https://fallingblocks.vip/">Play FallingBlocks</a> ·
  <a href="#how-to-play">How to play</a> ·
  <a href="#run-locally">Development & deployment</a>
</p>

## Drop in, clear a few lines

- **Play immediately.** Choose Endless or 40-line Sprint and start. No account needed.
- **Find your pace.** Survive rising gravity in Endless, or clear 40 lines against the clock in Sprint.
- **Chase a best.** Personal bests and recent runs stay on your device, with separate records for each mode.
- **Make the top 10.** Compete on the shared leaderboard for Endless scores and completed Sprint times.
- **Keep your name.** Choose a public nickname once; eligible finished runs post automatically while it is remembered.
- **Play comfortably.** Use keyboard or touch controls, adjust sound and visual settings, and enable reduced motion.
- **See what changed.** Open **Updates** for the latest branding, gameplay, and performance changes.

## Get started

1. [Open FallingBlocks](https://fallingblocks.vip/) and choose **Endless** or **40-line sprint**.
2. Select **Play** or press **Space**. The opening animation never holds up the game.
3. Place blocks to complete full lines. Use **Pause** or **Escape** whenever you need a break.

## How to play

| Control | Action |
| --- | --- |
| ← / → or A / D | Move left / right |
| ↓ or S | Soft drop |
| Z / X | Rotate counterclockwise / clockwise |
| ↑ or W | Rotate clockwise |
| Q | Rotate 180° |
| C or Shift | Hold |
| Space | Hard drop |
| R | Restart |
| Escape | Pause / resume |

Large touch controls appear on phones and touchscreens. Open **How to play** in the game for a quick reminder.

Endless speeds up as you clear lines. Sprint keeps a steady speed and finishes when you clear at least 40 lines; the timer stops on the final placement.

## Your runs

Settings, personal bests, recent runs, and your remembered nickname are saved in your browser. Clearing site data can remove them; they do not automatically transfer between browsers or devices.

The shared leaderboard keeps the top 10 per mode. Endless ranks by highest score; Sprint ranks completed runs by fastest time. Your chosen nickname is public when a run is posted. Remembered names allow eligible finished runs to post automatically, and the results screen lets you change the name for future runs.

## Run locally

Use Node 24 and pnpm 11.

```sh
git clone https://github.com/leolunelove/FallingBlocks.git
cd FallingBlocks
pnpm install --frozen-lockfile
pnpm dev
```

Open [localhost:5173](http://localhost:5173/). Run `pnpm test` and `pnpm typecheck` to check changes. Use `pnpm build:pages` to test and build the static release.

## Repository guide

| Path | Purpose |
| --- | --- |
| [src/components/game/](src/components/game/) | Game interface, logo, menus, and leaderboard |
| [src/lib/game/](src/lib/game/) | Game rules, input, rendering, audio, settings, and records |
| [src/styles.css](src/styles.css) | Responsive layout, typography, and motion |
| [public/](public/) | Favicon, fonts, and social preview artwork |
| [game.test.mjs](game.test.mjs) | Game modes, timing, and record checks |
| [controller.test.mjs](controller.test.mjs) | Idle rendering, pause/resume, and hidden-tab recovery |
| [leaderboard.test.mjs](leaderboard.test.mjs) | Leaderboard API and validation checks |
| [submissions.test.mjs](submissions.test.mjs) | Automatic posting, retries, and duplicate protection |
| [leaderboard.sql](leaderboard.sql) | Shared leaderboard schema and permissions |
| [leaderboard-edge.ts](leaderboard-edge.ts) | Shared leaderboard service |
| [.github/workflows/](.github/workflows/) | Checks and GitHub Pages publishing |

GitHub Pages hosts [fallingblocks.vip](https://fallingblocks.vip/). Pushing to `main` runs the **Deploy 3TRIS to GitHub Pages** workflow, which checks, builds, and deploys the static game.

## Built with

React, TypeScript, Vite, Zustand, and Tailwind CSS. The board uses Canvas 2D, audio is generated in the browser, and the interface uses Fixel and IBM Plex Mono.

The static frontend is hosted on GitHub Pages. Supabase powers the shared leaderboard; local settings and personal records stay in browser storage.

<details>
<summary>Leaderboard implementation notes</summary>

The leaderboard runs in the existing free `shared-memo` Supabase project. Dedicated `tris_scores` and `tris_run_tickets` tables support the `tris-leaderboard` Edge Function. The schema is in `leaderboard.sql`; the deployed function source is `leaderboard-edge.ts`.

Only the best 10 results per mode are retained (20 score rows maximum). A submission transaction removes any result below tenth place. Endless ranks by score descending; Sprint ranks completed runs by time ascending. Ties favor the earlier result. Each browser identity can hold one place per mode. Local personal bests remain on the device even when a shared result is discarded.

Players choose a public nickname when posting their first finished run. Once a name is remembered on the device, eligible finished runs post automatically, including when the player immediately starts another run. Results show posting status and offer a manual retry after a submission failure. The name can be changed on the results screen for future runs. A random browser token identifies repeat players; clearing browser storage creates a new identity. Run tickets are temporary and expire after 24 hours, with expired tickets removed when another run starts. No existing local history is uploaded automatically. Scores are client-reported with timing/plausibility checks, rate limits, and duplicate protection; this is not replay-verified competitive anti-cheat.

Database tables and submission functions are restricted to the server role. The Edge Function checks its own public 3TRIS app identifier, so gateway JWT verification is disabled. The frontend config grants no direct Supabase database access and contains no server credentials. RLS without policies is intentional: all direct client table access is denied.

Validation: `pnpm test` covers the engine and HTTP API. Database integration tests verify ranking, duplicate protection, mode separation, denied direct client access, and the ten-row storage cap, inside rolled-back transactions.

</details>
