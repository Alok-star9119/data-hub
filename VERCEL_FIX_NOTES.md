# Vercel deployment fix notes

## Immediate build failure fixed

The deployment error came from a dependency conflict between Vite 8.3.x and the project's direct `esbuild` development dependency.

- Vite 8.3.x expects a compatible `esbuild` release in the 0.27/0.28 line.
- The project declared `esbuild` as `^0.25.0`.
- Vercel's `npm install` therefore failed before the application build could start.

The corrected project uses `esbuild` `^0.28.2`.

## Vercel API architecture

The project also includes a Vercel catch-all function at `api/[...path].ts` which exports the Express app from `server/app.ts`.

## Environment

Vercel environment variables are configured in the Vercel dashboard when needed.

## Redeploy

After pushing the corrected files to GitHub, trigger a fresh Vercel deployment so that Vercel creates a new dependency tree.
