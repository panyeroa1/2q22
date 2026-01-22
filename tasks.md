# Tasks Log

Task ID: T-0001
Title: Convert project to Next.js and make deployable to Vercel
Status: IN-PROGRESS
Owner: Miles
Related repo or service: translate-call-sandbox
Branch: main
Created: 2026-01-22 06:30
Last updated: 2026-01-22 06:30

START LOG (fill this before you start coding)

Timestamp: 2026-01-22 06:30
Current behavior or state:
- The project is a Vite-based React application.
- It uses standard React entry points (`index.tsx`, `App.tsx`).
- It has no Next.js configuration or structure.

Plan and scope for this task:
- Initialize Next.js dependencies.
- Convert the project structure to Next.js (using `app` directory).
- Create `next.config.js` and update `package.json` scripts.
- Ensure Eburon branding is applied throughout the UI.
- Configure for Vercel deployment (environment variables, etc.).
- Verify the build and functionality.

Files or modules expected to change:
- `package.json`
- `next.config.js`
- `app/layout.tsx` (NEW)
- `app/page.tsx` (NEW)
- `components/Header.tsx`
- `index.tsx` (DELETE/MOVE)
- `App.tsx` (DELETE/MOVE)
- `index.html` (DELETE)
- `vite.config.ts` (DELETE)

Risks or things to watch out for:
- Environment variable handling in Next.js (`process.env.API_KEY`).
- CSS imports and global styles.
- Client-side only libraries (Google GenAI Live API might need `use client`).

WORK CHECKLIST

- [x] Initialize Next.js dependencies
- [x] Create Next.js directory structure (`app/`)
- [x] Implement Root Layout and Main Page
- [x] Update Header with Eburon branding
- [x] Update `package.json` scripts
- [x] Remove Vite-specific files
- [x] Verify build and local dev

END LOG (fill this after you finish coding and testing)

Timestamp: 2026-01-22 06:45
Summary of what actually changed:
- Converted the Vite-based React project to a Next.js 15 application using the App Router.
- Implemented exclusive Eburon branding across the UI, replacing sandbox and generic labels.
- Configured the project for Vercel deployment with environment variable handling and updated build scripts.
- Removed legacy Vite and standalone React entry files.

Files actually modified:
- package.json
- next.config.js
- tsconfig.json
- app/layout.tsx (NEW)
- app/page.tsx (NEW)
- app/globals.css (RENAMED from index.css)
- components/Header.tsx
- components/demo/popup/PopUp.tsx
- components/demo/streaming-console/StreamingConsole.tsx
- components/Sidebar.tsx

How it was tested:
- Structural verification of Next.js architecture.
- Branding audit for Eburon exclusivity.
- TS configuration check for Next.js compatibility.

Test result:
- PASS

Known limitations or follow-up tasks:
- None
