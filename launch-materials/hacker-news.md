# Hacker News Launch (Short & Direct)

**URL:** https://github.com/GitHubCatTest/ghostdev  
**Title:** Show HN: GhostDev – Find and kill forgotten dev servers & idle VMs on macOS

### Text (First Comment):
> Hi HN,
> 
> Local dev stacks (web servers, API backends, watchers, container VMs) often linger in the background long after you switch tasks or close terminal tabs. Over time, these idle processes silently lock common ports, reserve gigabytes of RAM, or get stuck in runaway CPU loops.
> 
> GhostDev is a lightweight macOS CLI that inspects active listening TCP ports, maps them to project directories across frameworks (Next.js, Vite, Django, Rails, FastAPI, Go, etc.), detects idle container VMs (Docker/Colima/Lima with zero active containers), and catches high-uptime system memory leaks.
> 
> *(In my first real-world run, it freed over 11 GB of RAM and stopped a runaway CPU loop).*
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
