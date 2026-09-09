# 👻 GhostDev

> **Stop hidden background servers from slowing down your Mac, heating it up, and draining your battery.**  
> Available as a **native macOS Menu Bar app** and a **zero-install CLI**.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Platform: macOS](https://img.shields.io/badge/platform-macOS-lightgrey.svg)](https://apple.com/macos)
[![Node: >=18](https://img.shields.io/badge/node-%3E%3D18-green.svg)](https://nodejs.org/)

---

## Why GhostDev?

**🚨 WHAT IS GHOSTDEV? (IN PLAIN ENGLISH):**  
When you close code editor windows or terminal tabs, your local servers and container environments often don't actually stop. Days later, they're still secretly running in the background:

- **Forgotten dev servers** (Next.js, Vite, Python, Rails, Node) quietly eating 5–10+ GB of RAM.
- **Watchers and bundlers** stuck in runaway loops burning 100%+ CPU and draining your battery.
- **Docker or Colima VMs** holding onto 8 GB of reserved memory even with **0 containers running**.

Unlike standard Activity Monitor (which just shows a mystery `node` process) or simple port killers (which only know a port number), GhostDev gives you the full picture.

### ⚙️ How It Works Under the Hood (3 Simple Steps):

1. **Finds the real project folder:**  
   GhostDev inspects the process and finds the exact folder on your disk where you ran the command. So instead of a mystery `node` process, it reads the folder name (like `dashboard` or `landing-page`) and detects the framework (`Next.js`, `Vite`, etc.).

2. **Checks how long it has been running:**  
   It tracks process uptime (e.g. `up 2d 7h`). If it's been running for days and the terminal window you started it in was closed, it flags it as a forgotten process.

3. **Checks if it's actually doing anything useful:**  
   - **For Docker / VMs:** It checks if any containers are actively running. If it's `0`, it knows the VM is just holding onto 8 GB of RAM for nothing.
   - **For CPU loops:** It checks if a build watcher is stuck in an infinite loop eating 100%+ CPU while you aren't using it.

```text
[DEV SERVER]   1.47 GB   my-web-app (Next.js)  :3000 (PID 45145)
               ↳ Runaway CPU (144%) pegged in build loop • up 2d 7h

[VM / DOCKER]  8.02 GB   Colima VM (Docker Runtime)
               ↳ 0 active Docker containers (idle RAM reservation) • up 3d 2h
```

**You can immediately see:**
- **What project it is** (e.g. `my-web-app` instead of just `node`)
- **What port it's using** (e.g. `:3000`)
- **How long it's been running** (e.g. `up 2d 7h`)
- **Why it's safe to stop** (e.g. `0 containers running` or `runaway CPU loop`)

---

## Two Ways to Use GhostDev

### 1. 👻 Native Menu Bar App (GUI)
*For people who don't want to use the terminal.*

A native, lightweight (<10 MB RAM) Mac menu bar app that sits at the top of your screen:
- **Live Memory Badge:** Displays wasted RAM at a glance (e.g. `👻 5.2 GB`).
- **One-Click Stop:** Click the icon to view running servers and stop individual projects or click **"Free All Memory"**.
- **100% Free & Open Source:** Built in native Swift—no subscriptions or Apple fees required.

```bash
# Build and launch the menu bar app
npm run build:app
open menubar/GhostDev.app
```

---

### 2. ⚡ Terminal CLI (Zero Install)
*For developers who prefer the command line.*

```bash
# 1. Scan for wasted memory (<50ms)
npx ghostdev scan

# 2. Preview what would be stopped (safe dry-run)
npx ghostdev reap --dry-run

# 3. Stop them and free your memory
npx ghostdev reap
```

---

## What It Detects

- **Web & API Servers:** Next.js, Vite, Nuxt, Astro, Remix, Django, FastAPI, Flask, Ruby on Rails, Express, and Node/Python.
- **Container VMs:** Colima, Lima, and Docker Desktop when **zero containers** are running.
- **macOS System Leaks:** Long-uptime background services like Control Center.
- **Protected Apps:** Automatically whitelists web browsers (Chrome, Safari, Arc), text editors (VS Code, Cursor), and IDE tools so you never lose active work.

---

## CLI Reference

| Command | What it does |
| :--- | :--- |
| `ghostdev scan` | Lists all idle dev servers, empty VMs, and wasted RAM. |
| `ghostdev reap` | Safely stops identified background processes and frees RAM. |
| `ghostdev reap --dry-run` | Previews what would be stopped without killing anything. |
| `ghostdev notify -t <mb>` | Sends a native Mac notification if wasted RAM exceeds threshold (default: 2048 MB). |
| `ghostdev daemon install` | Runs silently in the background and alerts you when RAM is wasted. |
| `ghostdev daemon uninstall` | Removes the background service. |

---

## Safety & Privacy

- **Never deletes code:** Dev servers are just local processes. All your files, code edits, and git branches stay 100% untouched.
- **100% Offline & Private:** No AI, no cloud servers, and no analytics. All checks run locally via native macOS system calls.

---

## License

MIT © [GhostDev](https://github.com/GitHubCatTest/ghostdev)
