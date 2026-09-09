# Short & Punchy Launch Posts (High Retention)

---

## 1. Reddit: r/SideProject & r/coolgithubprojects

**Title:**
Mac running hot or battery dying fast? Check for forgotten "node" servers

**Body:**
```text
If your Mac is heating up or feeling sluggish while coding, this is probably why:

Especially with AI tools (Cursor, Claude, etc.), when port 3000 is busy, they quietly open 3001 instead, spin up idle container VMs, or leave background watchers running. They never close the old servers.

You open Activity Monitor to check, but it just says "node" taking 2 GB. You think it might be important, so you leave it running.

Days later, you have 5 mystery servers eating 10 GB of RAM.

I built GhostDev to fix this. It shows you what Activity Monitor won't:
- The actual project name (like my-web-app)
- The framework and port it is on (Next.js, Vite, :3000, :5173, etc.)
- How long it has been sitting idle (e.g. untouched for 2 days)
- Idle Docker/container VMs holding 8 GB of RAM with 0 containers
- Runaway CPU loops burning 100%+
- and more!

1-click to kill them and get your battery and memory back.

Free and open source:
Menu bar app & CLI: https://github.com/GitHubCatTest/ghostdev

Or test it right in Terminal (no install):
npx ghostdev scan
```

---

## 2. Reddit: r/macapps (Strict PCPCA Format)

**Title:**
GhostDev: Tells you which project that 2GB "node" process in Activity Monitor actually belongs to

**Body:**
```text
Purpose: Shows what Activity Monitor hides. When your Mac gets warm, Activity Monitor just shows mystery "node" processes taking 2+ GB. Especially with AI coding tools opening port 3001 when 3000 is busy, idle VMs, and runaway loops, old servers pile up. GhostDev shows the project folder name, framework, port, idle uptime (e.g. untouched for 2 days), and empty Docker VMs so you can safely kill them.

Creator: Independent dev (GitHubCatTest). Free and open source.

Price: 100% Free (MIT). No ads, no tracking.

Comparison: Activity Monitor only shows "node". GhostDev tells you the project name, framework, port, empty VMs, and if it's abandoned.

Availability: Native macOS Menu Bar app (180 KB) and zero-install CLI (npx ghostdev scan).

Link: https://github.com/GitHubCatTest/ghostdev
```

---

## 3. Hacker News (Show HN)

**URL:** https://github.com/GitHubCatTest/ghostdev
**Title:** Show HN: GhostDev - See which project that 2GB "node" in Activity Monitor belongs to

**First Comment:**
```text
When your Mac starts running warm or battery drops, you check Activity Monitor and see:
node (2.4 GB)

You have no idea what project it is, what port it's on, or if you can safely close it.

With AI coding assistants opening new ports (e.g. 3001 when 3000 is busy), spinning up idle VMs, and never killing old ones, abandoned servers pile up fast.

GhostDev maps those mystery processes back to their actual project folders. It shows:
- Project name and framework (Next.js, Vite, Django, etc.)
- Active port
- How long it's been idle (e.g. up 2 days in a closed tab)
- Idle Docker/Colima VMs holding RAM with 0 containers
- Runaway build loops burning 100%+ CPU
- and more!

Lets you kill them in one click.

Native macOS menu bar app (180 KB) and zero-install CLI:
npx ghostdev scan

GitHub: https://github.com/GitHubCatTest/ghostdev
```
