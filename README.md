# 👻 GhostDev

> **The developer upgrade to macOS Activity Monitor.**  
> Stop hidden background servers and idle VMs from slowing down your Mac, heating it up, and draining your battery.  
> Built especially for fast-iterating developers and AI coding workflows (Cursor, Claude Code, Windsurf).  
> Available as a **native macOS Menu Bar app** (GUI) and a **zero-install CLI**.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Platform: macOS](https://img.shields.io/badge/platform-macOS-lightgrey.svg)](https://apple.com/macos)
[![Node: >=18](https://img.shields.io/badge/node-%3E%3D18-green.svg)](https://nodejs.org/)

---

## ⚡ Activity Monitor vs. GhostDev

When your Mac starts getting warm or fans spin up, you open macOS Activity Monitor. But for developers, Activity Monitor has a massive blind spot:

| What You Need to Know | macOS Activity Monitor | 👻 GhostDev |
| :--- | :--- | :--- |
| **Process Name** | Just says `node` or `python3` | **`my-web-app`** (actual folder on disk) |
| **Framework** | None | **Next.js, Vite, Django, Rails, etc.** |
| **Port** | Hidden (must dig through 500 lines of open files) | **`:3000`**, **`:5173`**, **`:8000`** |
| **Uptime & Idle Status** | Raw launch time | **`up 2d 7h`** (flags closed terminal tabs) |
| **Docker / Colima VMs** | Mystery VM taking 8 GB RAM | **Flags when 0 containers are running** |
| **Action** | Risky Force Quit (might kill active work) | **1-click safe kill for abandoned servers** |

---

## 🤖 Why This Is Essential for AI Coding & Fast Workflows

Modern development moves faster than ever. When building with AI coding assistants (like Cursor, Claude Code, or Windsurf) or multitasking across multiple client projects:

1. **AI Port Jumping:** When AI agents test your code, they run terminal commands behind the scenes to spin up dev servers. If port 3000 is occupied, they silently jump to port 3001, 3002, or 8081. They rarely shut down the previous servers.
2. **Invisible Background Leftovers:** Because agents and scripts run in the background, you never see the terminal windows. Days later, multiple servers are still running invisibly.
3. **Where the 10+ GB Actually Goes:**  
   - A modern Next.js 14/15 dev server (with in-memory Turbopack/Webpack compilation and AST caching) routinely consumes **1.2 GB to 2.5 GB of RAM**.
   - A container runtime on macOS (Docker Desktop, Colima, Lima) reserves **4 to 8 GB of host RAM** by default in a Linux VM. Even if you shut down all containers, that VM keeps holding onto 8 GB of memory.
   - **Result:** Just two forgotten dev servers plus an idle Docker VM locks up **over 11 GB of RAM** and can peg CPU cores in rebuild loops.

GhostDev acts as a safety net: it tracks these processes down so you can iterate fast without having to manually babysit background PIDs.

---

## ⚙️ How It Works Under the Hood (3 Simple Steps)

1. **Maps process to project folder:**  
   GhostDev inspects the process and finds the exact folder on your disk where the command was run. Instead of a mystery `node` line, it reads the folder name (e.g. `dashboard` or `my-web-app`) and identifies the framework (`Next.js`, `Vite`, etc.).

2. **Checks how long it has been running:**  
   It checks process uptime (e.g. `up 2d 7h`). If it has been running for days and the terminal tab or editor window you started it in was closed, it flags it as an abandoned process.

3. **Checks if it's actually doing anything useful:**  
   - **For Docker / VMs:** Checks if any containers are actively running. If it's `0`, it flags that the VM is holding onto 8 GB of RAM for nothing.
   - **For CPU loops:** Catches watchers stuck in runaway 100%+ CPU rebuild loops draining your battery.

```text
[DEV SERVER]   1.47 GB   my-web-app (Next.js)  :3000 (PID 45145)
               ↳ Runaway CPU (144%) pegged in build loop • up 2d 7h

[VM / DOCKER]  8.02 GB   Colima VM (Docker Runtime)
               ↳ 0 active Docker containers (idle RAM reservation) • up 3d 2h
```

---

## 🚀 HOW TO INSTALL & RUN (SUPER SIMPLE)

Pick whichever option you prefer:

### Option 1: Quick Scan in Terminal (Zero Install)
You don't need to download or install anything. Just open your Mac's **Terminal** app, paste this command, and press **Enter**:

```bash
npx ghostdev scan
```

To safely kill forgotten servers and get your RAM back:
```bash
npx ghostdev reap
```

---

### Option 2: Native Menu Bar App (GUI)
*If you want a 👻 ghost icon at the top of your Mac screen that tracks wasted memory in real time and lets you kill servers with one click.*

1. Open your Mac's **Terminal** app.
2. Copy and paste this single line, then press **Enter**:

```bash
git clone https://github.com/GitHubCatTest/ghostdev.git && cd ghostdev && bash menubar/build.sh && open menubar/GhostDev.app
```

**And you're all set!** The 👻 icon will immediately appear in your top menu bar.

- **Live Memory Badge:** Displays wasted RAM at a glance (e.g. `👻 5.2 GB`).
- **One-Click Kill:** Click the icon to view running servers and kill individual projects or click **"Free All Memory"**.
- **Control Center Leak Alert & 1-Click Restart:** Automatically flags if macOS Control Center starts leaking memory (e.g. over 1 GB) and adds a dedicated button to restart it in milliseconds without logging out.
- **100% Free & Open Source:** Built in native Swift (no subscriptions or Apple fees).

---

## What It Detects

- **Web & API Servers:** Next.js, Vite, Nuxt, Astro, Remix, Django, FastAPI, Flask, Ruby on Rails, Express, and Node/Python.
- **Container VMs:** Colima, Lima, and Docker Desktop when **zero containers** are running.
- **macOS System Leaks:** Detects when system background services like macOS Control Center leak memory (e.g. climbing past 1+ GB RAM) and provides an instant 1-click restart to reclaim memory.
- **Protected Apps:** Automatically whitelists web browsers (Chrome, Safari, Arc), text editors (VS Code, Cursor), and IDE tools so you never lose active work.

---

## CLI Reference

| Command | What it does |
| :--- | :--- |
| `ghostdev scan` | Lists all idle dev servers, empty VMs, and wasted RAM. |
| `ghostdev reap` | Safely stops identified background processes and frees RAM. |
| `ghostdev reap --dry-run` | Previews what would be stopped without killing anything. |
| `ghostdev restart-cc` | Restarts leaking macOS Control Center and reclaims leaked RAM (supports `--dry-run`). |
| `ghostdev notify -t <mb>` | Sends a native Mac notification if wasted RAM exceeds threshold (default: 2048 MB) or if Control Center is leaking. |
| `ghostdev daemon install` | Runs silently in the background and alerts you when RAM is wasted. |
| `ghostdev daemon uninstall` | Removes the background service. |

---

## Safety & Privacy

- **Never deletes code:** Dev servers are just local processes. All your files, code edits, and git branches stay 100% untouched.
- **100% Offline & Private:** No AI, no cloud servers, and no analytics. All checks run locally via native macOS system calls.

---

## License

MIT © [GhostDev](https://github.com/GitHubCatTest/ghostdev)
