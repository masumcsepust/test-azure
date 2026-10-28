# Tempo

A focus timer that keeps your task list right next to your clock. No account, no
server, no sync — everything lives in `localStorage` in your browser.

Angular 22, standalone components, zero UI libraries. Every pixel is custom
CSS/SVG.

## Run it

```bash
npm install
npm start          # dev server on http://localhost:4200
npm run build     # production build → dist/
```

Requires **Node ≥ 22.22.3** (Angular 22's minimum). The version is pinned in
`package.json` under `engines`.

## What it does

- **Focus / break modes** with three presets — Classic 25/5, Deep work 50/10,
  Ultra 90/20. The preset you pick is remembered.
- **A progress ring** that drains as the session runs, and switches colour
  between mint (focus) and coral (break).
- **A task list** beside the clock: add, tick off, delete, and clear the
  finished ones. It persists between visits.
- **Session stats** — how many focus sessions you have run and how many
  minutes they added up to, all time.
- **Keyboard shortcuts** — `Space` start/pause, `R` reset, `1` `2` `3` pick a
  preset.

## Design — "Night Studio"

Deep ink-plum surfaces with soft glass panels, a mint accent for focus and
coral for breaks, and a violet/amber glow bleeding in from the edges.

| Token | Value | Use |
| --- | --- | --- |
| `--bg` | `#0c0a11` | page background |
| `--text` | `#f1eef8` | body text |
| `--mint` | `#6ee7a8` | focus accent |
| `--coral` | `#ff7a59` | break accent |
| `--violet` | `#a78bfa` | ambient glow |

**Type** — Space Grotesk for display numerals, Inter for UI, Geist Mono for
labels and shortcuts. All three are self-hosted variable fonts in `src/fonts/`,
so the app makes no external font requests and works offline.

## Structure

```
src/
  styles/
    _tokens.scss     design tokens + mixins (label, display, glass)
    _fonts.scss      @font-face for the three variable fonts
    _base.scss       reset, buttons, ambient background, keyframes
  app/
    app.ts|html|scss shell, live clock, keyboard shortcuts, toast
    shared/
      store.ts       signals + localStorage persistence
    timer/           the progress-ring timer
    tasks/           the task list
```

## State

Everything lives in one injectable store (`shared/store.ts`) built on Angular
signals. Three keys are written to `localStorage`:

| Key | Holds |
| --- | --- |
| `tempo.tasks.v1` | the task list |
| `tempo.stats.v1` | session count and total focus seconds |
| `tempo.preset.v1` | the selected timer preset |

If storage is unavailable (private mode, blocked cookies) the app still runs —
it just forgets between visits.

## Accessibility & responsiveness

- Semantic landmarks, labelled controls, `aria-pressed` on the task checkbox
- Visible focus rings, full keyboard operation including the shortcuts
- `prefers-reduced-motion` disables every animation
- Verified at 1440px and 390px with no horizontal overflow

## Deploying

See [DEPLOY.md](./DEPLOY.md). The short version: `npm run build` produces a
plain static site in `dist/` — point any static host at it.
