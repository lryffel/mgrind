# mgrind

Math grinding app built with [Svelte 5](https://svelte.dev) + [Vite](https://vite.dev) + [Pico CSS](https://picocss.com).

## Prerequisites

- Node.js 22+
- npm

## Getting started

```bash
npm ci
npm run dev
```

Opens a dev server with hot reload at `http://localhost:5173`.

## Scripts

| Command             | Description                          |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Start dev server                     |
| `npm run build`     | Production build to `dist/`          |
| `npm run preview`   | Preview production build locally     |
| `npm run check`     | Typecheck (svelte-check + tsc)       |
| `npm run test`      | Run vitest                           |
| `npm run lint`      | Lint with eslint                     |
| `npm run format`    | Format with prettier                 |
| `npm run format:check` | Check formatting                 |

## Deploy to GitHub Pages

Every push to `main` triggers a GitHub Actions workflow that builds the app and deploys it to GitHub Pages.

### One-time setup

1. Go to **Settings → Pages** in the GitHub repo.
2. Under **Source**, select **GitHub Actions**.
3. Push to `main` — the workflow deploys automatically.

The site will be available at `https://(username).github.io/(reponame)`.

### Manual deploy

```bash
npm run build
```

Then upload the `dist/` folder to any static host.
