# Short & Punchy Launch Posts (High Retention)

---

## 1. Reddit: r/SideProject & r/coolgithubprojects

**Title:**
Mac running hot or battery dying fast? Check for forgotten "node" servers

**Body:**
```text
If your Mac is heating up or feeling sluggish while coding, this is probably why:

Especially with AI tools (Cursor, Claude, etc.), when port 3000 is busy, they quietly open 3001 instead. They never close the old servers.

You open Activity Monitor to check, but it just says "node" taking 2 GB. You think it might be important, so you leave it running.

Days later, you have 5 mystery servers eating 10 GB of RAM.

I built GhostDev to fix this. It shows you what Activity Monitor won't:
- The actual project name (like my-web-app)
- The port it is on
- How long it has been sitting idle (e.g. untouched for 2 days)

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
Purpose: Shows what Activity Monitor hides. When your Mac gets warm, Activity Monitor just shows mystery "node" processes taking 2+ GB. Especially with AI coding tools opening port 3001 when 3000 is busy, old servers pile up. GhostDev shows the project folder name, port, and uptime (e.g. idle for 2 days) so you can safely kill them.

Creator: Independent dev (GitHubCatTest). Free and open source.

Price: 100% Free (MIT). No ads, no tracking.

Comparison: Activity Monitor only shows "node". GhostDev tells you the project name, port, and if it's abandoned.

Availability: Native macOS Menu Bar app (180 KB) and CLI (npx ghostdev scan).

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

With AI coding assistants opening new ports (e.g. 3001 when 3000 is busy) and never killing old ones, these abandoned servers pile up fast.

GhostDev maps those mystery processes back to their actual project folders, shows how long they have been idle (e.g. up 2 days in a closed tab), and lets you kill them in one click.

Native macOS menu bar app (180 KB) and zero-install CLI:
npx ghostdev scan

GitHub: https://github.com/GitHubCatTest/ghostdev
```
