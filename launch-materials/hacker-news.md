# Hacker News Launch (Short & Direct)

**URL:** https://github.com/GitHubCatTest/ghostdev  
**Title:** Show HN: GhostDev – Find and kill forgotten dev servers & idle VMs on macOS

### Text (First Comment):
> Hi HN,
> 
> I built GhostDev after finding 11+ GB of memory trapped in ghost processes on my Mac:
> 
> - An idle Colima/Docker VM holding 8 GB of RAM with 0 running containers.
> - An orphaned Next.js server running for 2 days pegged at 144% CPU.
> - macOS Control Center leaking 1.8 GB over 5 days of uptime.
> 
> GhostDev is a lightweight CLI that scans active listening ports (3000, 5173, 8080, etc.), maps them to project directories (Next.js, Vite, Django, Rails, etc.), detects empty container VMs, and safely stops them.
> 
> You can try it directly without installing:
> ```bash
> npx ghostdev scan
> npx ghostdev reap --dry-run
> ```
> 
> 100% offline, zero cloud dependencies, and zero telemetry.
> 
> Code & README: https://github.com/GitHubCatTest/ghostdev
> 
> Feedback welcome!
