# Baseline Sync Runbook

Use this when local work exists in `/home/node/railfin` but is not yet committed/pushed.

## Purpose
- Keep `main` aligned with current project files.
- Prevent drift between lane outputs and GitHub.
- Make recovery predictable after tooling/routing hiccups.

## When to run
- After major task blocks complete (recommended: at end of each block).
- Any time `git status --short` shows unexpected untracked/unstaged project files.
- Before weekly reporting snapshots.

## Command checklist

1) Verify repo + remote
```bash
git -C /home/node/railfin rev-parse --is-inside-work-tree
git -C /home/node/railfin remote -v
```

2) Check drift
```bash
git -C /home/node/railfin status --short
```

3) Stage only project files
```bash
cd /home/node/railfin
git add .gitignore .env.example docs src middleware.ts
```

4) Commit
```bash
git commit -m "chore(coo): baseline sync <YYYY-MM-DD>"
```

5) Push
```bash
git push origin main
```

## Guardrails
- Never commit real secrets.
- Keep `.env*` ignored except `.env.example`.
- Do not commit local assistant runtime artifacts (`.openclaw/`) or bootstrap/persona docs.
- If conflicts appear, stop and route to COO merge sequence.

## Output to report
- commit SHA
- files included
- push result
- any intentionally excluded files
