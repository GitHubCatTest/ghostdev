# Short & Concise Launch Drafts (100% Privacy Safe)

> **Privacy Check:** Contains zero private paths, zero usernames, zero project names, and zero credentials.

---

## 1. Reddit (r/macapps, r/webdev, r/reactjs, r/nextjs)

**Title:** I built an open-source CLI to find & kill zombie dev servers and idle Docker VMs eating your Mac's RAM (`ghostdev`)

**Post:**
> Dev servers love to keep running in the background when you close terminal tabs or laptop lids.
> 
> Earlier today I realized my Mac was lagging because:
> - An idle Docker/Colima VM was reserving **8 GB of RAM** with 0 containers running.
> - An orphaned Next.js dev server from 2 days ago was stuck in an infinite rebuild loop eating **144% CPU** and **1.5 GB RAM**.
> - macOS Control Center had leaked **1.8 GB** over 5 days of uptime.
>
> That was **11+ GB of memory** held hostage by processes I wasn't even using.
>
> So I built **GhostDev** — a lightweight, zero-dependency macOS CLI that finds these ghost processes and reclaims your RAM:
>
> ```bash
> # 1. Scan for wasted RAM (takes <50ms)
> npx ghostdev scan
> 
> # 2. Preview what would be stopped
> npx ghostdev reap --dry-run
> 
> # 3. Free the memory
> npx ghostdev reap
> ```
>
> **GitHub (MIT Open Source):** https://github.com/GitHubCatTest/ghostdev
>
> - **100% Offline & Private:** No LLMs, no cloud APIs, no analytics. All checks run locally via native OS queries.
> - **Safe:** Whitelists browsers, text editors, and language servers so you never lose active work.
>
> Hope it saves your RAM and battery life!

---

## 2. X / Twitter (Short & Punchy)

> Dev servers linger forever when you close terminal tabs.
> 
> Found 11+ GB of RAM trapped on my Mac today:
> • 8.0 GB: Colima VM with 0 containers
> • 1.5 GB: Orphaned Next.js server at 144% CPU
> • 1.8 GB: Leaking macOS Control Center
> 
> Built an open-source CLI to slay them:
> 
> `npx ghostdev scan`
> `npx ghostdev reap`
> 
> 🔗 https://github.com/GitHubCatTest/ghostdev 👻

---

## 3. LinkedIn / Dev.to (Quick tip format)

> **Quick Mac Tip for Developers:**
>
> If your Mac is running warm or your battery is draining, check how many forgotten dev servers or idle container VMs are running in the background.
>
> I built a lightweight open-source tool called **GhostDev** to scan and safely reap them in one command:
>
> `npx ghostdev scan`
>
> Free & open source on GitHub: https://github.com/GitHubCatTest/ghostdev
