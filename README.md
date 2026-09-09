# 👻 GhostDev

> **Find and slay zombie dev servers, idle VMs, and memory leaks on macOS.**  
> Reclaim 10+ GB of RAM and stop runaway CPU cycles with a single command.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node: >=18](https://img.shields.io/badge/node-%3E%3D18-green.svg)](https://nodejs.org/)
[![Platform: macOS](https://img.shields.io/badge/platform-macOS-lightgrey.svg)](https://apple.com/macos)

---

## The Problem

You run `pnpm dev`, `colima start`, or `docker compose up`, switch tasks, close the terminal tab, or shut your laptop lid. 

Days later:
- A forgotten **Next.js server** is burning **144% CPU** in an infinite rebuild loop.
- An idle **Colima/Lima VM** is holding **8 GB of reserved RAM** with **0 active containers**.
- Abandoned **Vite/Node/Python** servers are blocking ports like `3000` and `8080`.
- macOS **Control Center** has leaked **1.8 GB of RAM** over 5 days of uptime.

**GhostDev finds these ghost processes and reclaims your memory instantly.**

---

## Terminal Preview

```text
$ npx ghostdev scan

👻 GhostDev v0.1.0 — macOS Zombie Dev Server & VM Reaper

  Found 3 idle processes holding 10.97 GB of memory:

  [VM / DOCKER]     8.02 GB  Colima VM (Docker Runtime)
                   ↳ VM is running but has 0 active Docker containers (idle RAM reservation) • 0.0% CPU • up 3d 2h

  [DEV SERVER]      1.47 GB  my-web-app (Next.js)  :3000 (PID 45145)
                   ↳ Runaway CPU (144.3%) pegged in build/event loop • 144.3% CPU • up 2d 7h

  [SYSTEM LEAK]     1.48 GB  macOS Control Center (PID 1270)
                   ↳ Memory & Mach-port leak over 5d 1h uptime (742 open descriptors) • 3.5% CPU • up 5d 1h

  ────────────────────────────────────────────────────────────────────────
  Total Reclaimable Memory: 10.97 GB
  Run ghostdev reap to safely free this RAM.
```

---

## Quick Start

Run instantly without installing:

```bash
# Scan for wasted memory and zombie servers
npx ghostdev scan

# Preview what would be stopped (safe dry run)
npx ghostdev reap --dry-run

# Reclaim memory and terminate zombies
npx ghostdev reap
```

Or install globally:

```bash
npm install -g ghostdev
ghostdev
```

---

## Features

### 🔍 1. Smart Dev Server Detection
Inspects active TCP listening ports and maps them to project directories and frameworks:
- **Frameworks supported:** Next.js, Vite, Nuxt, Astro, Remix, Django, FastAPI, Flask, Ruby on Rails, Webpack, esbuild, Hyperframes, and custom Node/Python runtimes.
- **Safety checks:** Protects active web browsers (Chrome, Safari, Arc, Firefox), text editors, and language servers (`rust-analyzer`, `pyright`, etc.) from accidental termination.

### 🐳 2. Idle VM & Container Watchdog
Detects background virtual machines (such as **Colima**, **Lima**, or **Docker**) that reserve 4–16 GB of system RAM when **0 containers or active workloads** exist.

### 🛠 3. macOS Memory Leak Refresh
Catches long-uptime macOS system daemons (like `ControlCenter` accumulating 700+ leaked Mach ports over several days) and triggers a clean sub-second restart to release gigabytes of RAM.

### 🔔 4. Native Desktop Notifications & Background Daemon
Set up GhostDev to run silently in the background and notify you when wasted RAM exceeds your threshold (e.g. 2 GB):

```bash
# Install as a native macOS background service (LaunchAgent)
ghostdev daemon install --interval 30 --threshold 2048

# Uninstall anytime
ghostdev daemon uninstall
```

---

## CLI Reference

| Command | Description |
| :--- | :--- |
| `ghostdev scan` *(default)* | Scans and lists all zombie dev servers, idle VMs, and memory leaks. |
| `ghostdev reap` | Gracefully stops identified zombies and frees RAM. |
| `ghostdev reap --dry-run` | Simulates the cleanup without terminating any processes. |
| `ghostdev reap -u <hours>` | Only targets processes running longer than $N$ hours (default: `1`). |
| `ghostdev notify -t <mb>` | Sends a native macOS notification if wasted RAM $\ge$ threshold (default: `2048`). |
| `ghostdev daemon` | Runs continuous monitoring in the terminal. |
| `ghostdev daemon install` | Installs a persistent macOS LaunchAgent background service. |
| `ghostdev daemon uninstall` | Removes the background service. |

---

## Safety & Privacy

- **100% Offline & Private:** Zero telemetry, no cloud servers, and no LLMs. All process inspection happens via local macOS system calls.
- **Graceful Shutdown:** Sends `SIGTERM` first, allowing servers to close connections cleanly before force killing.
- **Code is never deleted:** Dev servers are just processes serving `localhost`. All source files, edits, and git branches remain 100% untouched.

---

## License

MIT © [GhostDev](https://github.com/GitHubCatTest/ghostdev)
