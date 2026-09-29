# Team setup: how we build Wurst Case

How the Claude session team works on this repo. After a reboot, follow section 1.

## 1. Start after a reboot

**Quick way:** run `powershell -ExecutionPolicy Bypass -File C:\games\vegle\start-team.ps1`.
It starts Docker and the web container. Then it opens one Windows Terminal window with five
tabs in a single `wt` call. Each tab starts `claude -n <name> --permission-mode auto` with a
kickoff prompt that points to that session's section below. The starts are 8 s apart and the
head comes last (after about 48 s). A tab stays open if claude exits, so you can read the error.
Options: `-SkipDocker`, `-Model <alias>`, `-Stagger <seconds>`, and `-DryRun`, which only prints
the `wt` command.
The session names come from `-n`, so the `/rename` lines below are only needed for the
manual way.

**Manual way:**

1. **Start Docker Desktop.** The web container restarts by itself (`restart: unless-stopped`).
   If it's missing: `docker compose up -d --build web` in `C:\games\vegle`, then open
   http://localhost:8234. Never `docker compose down`.
2. **Open five terminals, all in `C:\games\vegle`.** All sessions have to start in this
   folder, not in a worktree, because it's what makes them share one project memory
   (`~/.claude/projects/C--games-vegle/memory`).
3. **In each terminal:** run `claude`, switch to **auto mode**, then `/rename <name>`,
   then paste that session's kickoff prompt from section 2.
   All five sessions need the same permission mode, otherwise messages between them
   wait for your approval.
4. **Start the head last.** It reads `QUEUE.md`, checks that the others are up, and tells
   each of them what to do next.

The worktrees `C:\games\vegle-impl`, `C:\games\vegle-ui` and `C:\games\vegle-validator` are
plain folders on disk and survive a reboot. Nothing to recreate.

## 2. Sessions and kickoff prompts

| Name | Job | Works in |
|---|---|---|
| `product-owner` | Turns your wishes into OpenSpec changes; design questions with you | `C:\games\vegle\openspec\changes\` (untracked proposals only) |
| `head-of-development` | Priority, routing, decisions, merge go; keeps `QUEUE.md` | reads only; talks to everyone |
| `implementation-worker` | Logic and balance changes | `C:\games\vegle-impl` on `impl/<change>` |
| `ui-worker` | UI-only and tooling changes | `C:\games\vegle-ui` on `ui/<change>` |
| `validator` | Feasibility before a change starts; verification before merge | `C:\games\vegle-validator` (detached) |

**product-owner**
```
/rename product-owner
You are the product-owner for Wurst Case (C:\games\vegle). Read MEMORY.md and
multi-session-roles.md in the project memory, then C:\games\vegle\QUEUE.md. You write
OpenSpec changes and announce each one to head-of-development in its own message: name,
summary, dependencies, urgency, UI-only or logic/balance. Balance changes name their
knobs, ranges, fallbacks, stop conditions and hard gates. Never touch src/, never message
the workers directly. Wait for my wishes or the head's requests.
```

**implementation-worker**
```
/rename implementation-worker
You are the implementation-worker for Wurst Case. Read MEMORY.md, multi-session-roles.md
and impl-worker-worktree.md in the project memory. You apply logic/balance changes that
head-of-development assigns, in C:\games\vegle-impl on impl/<change>. Report in the fixed
format and merge into main only on the head's "merge". Tell head-of-development you are
up, and the state of your worktree (git status, branch).
```

**ui-worker**
```
/rename ui-worker
You are the ui-worker for Wurst Case. Read MEMORY.md, multi-session-roles.md and
ui-worker-checklist.md in the project memory. You apply UI-only and tooling changes that
head-of-development assigns, in C:\games\vegle-ui on ui/<change>. Browser check at
1280/900/375/320 in DE and EN. Merge only on the head's "merge". Tell
head-of-development you are up, and the state of your worktree.
```

**validator**
```
/rename validator
You are the validator for Wurst Case. Read MEMORY.md, multi-session-roles.md and
validator-worktree.md in the project memory. You never edit C:\games\vegle and never
commit. You run feasibility sims on proposals and verify worker branches before merge,
in C:\games\vegle-validator. Report verdict first. Tell head-of-development you are up.
```

**head-of-development** (start this one last)
```
/rename head-of-development
You are head-of-development for Wurst Case. Read MEMORY.md, multi-session-roles.md,
queue-file.md and C:\games\vegle\TEAM-SETUP.md, then C:\games\vegle\QUEUE.md. Run
ListAgents, check that the four other sessions are up, check git status and
git worktree list, then tell me the queue state and send each session its next step.
```

## 3. How a change flows

```
you ── wish ──► product-owner ── writes change, validate --strict ──► announces to head
                                                                          │
                            head: priority + route (logic/balance → impl, UI/tooling → ui)
                                                                          │
                  balance change? ── yes ──► validator: feasibility sims at the knob corners
                         │                          │ not feasible → back to product-owner (+ you)
                         no                         │ feasible
                         ▼                          ▼
                 worker: copy proposal into its worktree, apply, test, browser check,
                         archive, commit on its branch, rebase on main, report
                                                                          │
                            validator: verify the branch tip (tests, build, validate, gates)
                                                                          │
                            head: "merge" ──► worker: ff-only merge into main,
                                              delete the proposal folder in main,
                                              docker compose up -d --build web,
                                              park worktree on main, branch -d
                                                                          │
                                        head updates QUEUE.md, names dependent changes
                                        to the product-owner, flags playtest items to you
```

## 4. Who decides what

| Who | Decides |
|---|---|
| Worker, alone | Tuning within the knobs and ranges the spec names; deviations that keep the spec's intent (logged in `design.md`) |
| Head | Priority, routing, pacing windows (guidelines), test thresholds, which spec-named fallback to use, merge timing |
| Product-owner + you | Design promises: crossover, MegaMeat's role, what a feature is for, hard gates |

## 5. Standing rules

- Specs: MODIFIED blocks are copied from `openspec/specs/`, never from another change;
  `openspec validate <change> --strict` must pass before hand-over.
- When a change lands, the head tells the product-owner which queued changes depend on it,
  and those get refreshed before release.
- `C:\games\vegle` stays clean: only committed work, untracked proposals and `QUEUE.md`.
  Nobody edits files there except the product-owner's proposals.
- Cleanup is part of the merge. The worker that merges also cleans up right after:
  `git -C <its worktree> switch --detach main`, then
  `git -C C:/games/vegle branch -d <its branch>`. Use `-d`, never `-D`: git refuses to
  delete an unmerged branch, and that refusal is a signal to report, not to force.
  The three worktrees stay and are reused. They are parked detached on main between
  changes, and a new change starts with `git switch -c impl/<change> main` (or `ui/…`).
  The validator's worktree is always detached, so it has no branches.
- The head checks after each merge: `git branch` shows only `main` (plus branches of
  changes in progress), and `git worktree list` shows exactly the four folders.
  Worktrees are only removed (`git worktree remove`) if one is abandoned or broken, and
  only on the head's say.
- Commit messages: one subject line, max 74 characters, no body, no attribution.
- Stop the Vite dev server before `openspec archive` (EPERM on Windows).
- Hard balance gates: crossover (sets 1 and 24), tempted checks, fed check
  (fewer customers at 30 min and ≤ 0.75 × fair earned at 60). Pacing windows are guidelines.
- Report format (all sessions): verdict · change · branch + commit · tests · validate ·
  browser check · deviations · playtest flags · open question.

## 6. Sanity checks after a restart

| Check | Expected |
|---|---|
| `git -C C:/games/vegle status --short` | only untracked proposal folders, if any |
| `git worktree list` | vegle, vegle-impl, vegle-ui, vegle-validator |
| `git branch` | `main`, plus branches of changes in progress |
| http://localhost:8234 | game loads |
| `QUEUE.md` | matches what the head reports |
| stray Vite servers | none; a leftover `node` holding a port blocks archiving |

## 7. Open items

Your open items and the playtest list live in `QUEUE.md` (local, ignored by git).
