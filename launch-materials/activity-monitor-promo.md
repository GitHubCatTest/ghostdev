# GhostDev: "Activity Monitor for Developers" Promo Playbook

Positioning GhostDev not just as a cleanup tool, but as:
**"What Activity Monitor should look like for developers."**

---

## The Core Hook: Why Activity Monitor Fails Devs

When your Mac gets hot, sluggish, or fans spin up, you open macOS Activity Monitor.
You see:
- `node` (2.4 GB)
- `node` (1.8 GB)
- `next-server` (1.1 GB)
- `python3` (900 MB)
- `com.docker.backend` (8.0 GB)

Activity Monitor tells you nothing useful:
- Which project folder does that `node` belong to?
- Which port is it listening on?
- Was it started 3 days ago in a closed terminal tab?
- Is Docker running any containers, or is it holding 8 GB of RAM hostage while idle?
- If you click "Force Quit", will you kill your active work or a forgotten ghost?

GhostDev fixes this by inspecting the process, mapping the folder name, framework, and port, and letting you kill only what is abandoned.

---

## 1. Twitter / X (Visual Comparison Hook)

```text
Activity Monitor is basically useless for web developers.

When your Mac runs hot or lags, you open it and see:
- node (2.4 GB)
- node (1.6 GB)
- python3 (900 MB)

Zero project names. Zero ports. Zero context.
If you force quit, you might kill your active project.

I built GhostDev: an open source Activity Monitor made specifically for developers on macOS.

Instead of mystery "node" lines, it shows:
- Project folder (e.g. my-web-app)
- Framework (Next.js, Vite, Django, etc.)
- Active port (:3000, :5173, :8000)
- How long it's been running
- Idle Docker VMs holding RAM with 0 containers

One click to kill abandoned servers and reclaim 10+ GB of RAM.

Free and open source:
CLI: npx ghostdev scan
GUI: Native macOS menu bar app

https://github.com/GitHubCatTest/ghostdev
```

---

## 2. Reddit: r/macapps (Strict PCPCA Compliant)

**Title:**
GhostDev: A free developer-focused Activity Monitor for forgotten background servers and idle VMs

**Body:**
> **Purpose:**  
> Activity Monitor is great for system processes, but completely opaque for developers. When your Mac starts running hot or chewing battery, Activity Monitor just shows multiple lines of `node` or `python3` taking 2+ GB each. You have no idea which project folder they belong to, what port they are on, or if they are abandoned. GhostDev acts like a developer-specific Activity Monitor: it inspects listening dev servers, maps them to their actual project directories and frameworks, flags idle Docker/Colima VMs with 0 containers, and lets you safely free your memory.
>
> **Creator:**  
> Independent open-source developer (`GitHubCatTest`). Built after finding 11 GB of trapped RAM and a 144% CPU loop on my own MacBook from old project servers.
>
> **Pricing:**  
> 100% Free and Open Source (MIT License). No paid tiers, no telemetry, no tracking.
>
> **Comparison:**  
> Unlike Activity Monitor (which only shows raw process names like `node`), GhostDev shows the project folder name, dev framework, port, and uptime. Unlike blind port killers (`kill-port`), it audits all running projects at once and never requires you to guess port numbers.
>
> **Availability:**  
> Runs as a zero-install CLI (`npx ghostdev scan`) and a lightweight native macOS Menu Bar app (180 KB).
>
> **Link:**  
> https://github.com/GitHubCatTest/ghostdev

---

## 3. Reddit: r/SideProject & r/coolgithubprojects

**Title:**
Activity Monitor is useless for devs, so I built an open-source alternative for macOS

**Body:**
> If you write code on a Mac, you know this pain:
>
> Your laptop feels warm, battery is draining, and you open Activity Monitor.
>
> All you see is:
> - `node` (2.4 GB)
> - `node` (1.8 GB)
> - `next-server` (1.1 GB)
> - `com.docker.backend` (8.0 GB)
>
> You have no idea what project folder that `node` is running in, what port it's on, or whether you can safely kill it without breaking your current work.
>
> I built **GhostDev** to solve this. It's an open-source tool and macOS menu bar app that works like Activity Monitor, but built specifically for developers:
>
> 1. **Maps process to project folder:** Instead of `node`, it shows `my-web-app` or `backend-api`.
> 2. **Shows framework & port:** Displays Next.js (:3000), Vite (:5173), Django (:8000), etc.
> 3. **Catches idle Docker/Colima VMs:** Tells you when your Docker VM is quietly holding 8 GB of RAM while running 0 containers.
> 4. **Safe kill:** Stop abandoned servers and reclaim RAM in one click.
>
> You can try the CLI right now without installing anything:
> ```bash
> npx ghostdev scan
> npx ghostdev reap
> ```
>
> There is also a native macOS Menu Bar app (180 KB, no Electron).
>
> GitHub: https://github.com/GitHubCatTest/ghostdev
>
> Would love your feedback and thoughts!

---

## 4. Hacker News (Show HN)

**Title:**
Show HN: GhostDev - Developer-focused Activity Monitor for macOS

**URL:** https://github.com/GitHubCatTest/ghostdev

**Text (First Comment):**
> Hi HN,
>
> Activity Monitor has always had a blind spot for developers: it will tell you that a process named `node` is consuming 2.4 GB of RAM, but it won't tell you which project directory it came from, which port it's bound to, or whether it has been idling in a closed terminal tab for 4 days.
>
> As a result, developers either leave orphaned servers running (causing battery drain, thermal throttling, and port collision errors like `EADDRINUSE`), or blindly kill processes and accidentally terminate their active workspace.
>
> GhostDev is a lightweight macOS utility (CLI + 180 KB native Swift Menu Bar app) that fixes this:
>
> - Inspects listening TCP sockets and traces them back to project roots.
> - Detects frameworks from project configs (Next.js, Vite, Django, Rails, FastAPI, Go, etc.).
> - Inspects Docker / Colima / Lima VMs to flag instances holding RAM with 0 running containers.
> - Flags system-level memory leaks from long uptimes.
>
> You can test it via CLI without installing:
> ```bash
> npx ghostdev scan
> npx ghostdev reap --dry-run
> ```
>
> Fully open source (MIT), zero external network calls, zero analytics.
>
> Code & releases: https://github.com/GitHubCatTest/ghostdev
>
> Looking forward to your feedback.

---

## 5. Dev.to / Hashnode / Medium Article Pitch

**Title:**
Why Activity Monitor is Broken for Web Developers (And What to Use Instead)

**Key Sections:**
1. **The Phantom Node Problem:** The classic scenario of opening Activity Monitor and seeing 5 different `node` processes.
2. **Why Developers Don't Kill Them:** The fear of killing the wrong thing.
3. **The Hidden Costs:** Thermal throttling on M-series chips, battery drain, and port conflicts.
4. **How GhostDev Bridges the Gap:** Walking through how it resolves PID -> CWD -> package.json / framework.
5. **How to run it.**
