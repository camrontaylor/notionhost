# Work from GitHub in Cursor

Everything for NotionHost lives in one repo: code, PRD, build plan, and stack setup.

## Clone and open in Cursor

1. **Clone the repo** (use a folder you’ll use only for this project, e.g. `~/dev`):

   ```bash
   cd ~/dev   # or wherever you keep projects
   git clone https://github.com/camrontaylor/notionhost.git
   cd notionhost
   ```

2. **Open in Cursor:**  
   **File → Open Folder** (or **Cmd+O** / **Ctrl+O**) and choose the `notionhost` folder you just cloned.

3. **Install and run:**

   ```bash
   pnpm install
   cp .env.example .env.local
   ```

   Edit `.env.local`: set `DATABASE_URL` (and optionally `NEXTAUTH_SECRET`, `EMAIL_FROM`, etc.). Then:

   ```bash
   pnpm dev
   ```

4. **Going forward:** All work happens in this cloned folder. Commit and push from here; pull before you start work if you use another machine.

## What’s in this repo

- **App:** Next.js app in `src/`, config at root.
- **docs/PRD.md** – Product requirements.
- **docs/notionhost-build-plan.md** – Build plan and phases.
- **docs/STACK-SETUP.md** – Service accounts and env wiring.
- **docs/WORK-FROM-GITHUB.md** – This file.

Your local `.env.local` is gitignored; never commit secrets. Use the same env var names on Vercel (or any host) when you deploy.
