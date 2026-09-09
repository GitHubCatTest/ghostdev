import path from 'node:path';
import { ZombieItem, ScanOptions } from '../types.js';
import { runCommand, formatBytes, parseEtime, getProcessCwd } from '../utils.js';

const SYSTEM_BINARIES = new Set([
  'launchd',
  'rapportd',
  'sharingd',
  'AirPlayXPCHelper',
  'SystemUIServer',
  'cupsd',
  'identityservicesd',
  'trustd',
  'remoted',
  'configd',
  'mDNSResponder',
  'UserEventAgent',
  'syspolicyd',
  'ControlCenter',
  'WindowServer',
  'kdc',
  // Common consumer apps and browsers that use internal ports
  'Google Chrome',
  'Google Chrome Helper',
  'Google',
  'Chromium',
  'Brave Browser',
  'Safari',
  'Arc',
  'Firefox',
  'Slack',
  'Discord',
  'Spotify',
  'Dropbox',
  'OneDrive',
]);

export async function scanDevServers(options: ScanOptions = {}): Promise<ZombieItem[]> {
  const minUptimeSec = (options.minUptimeHours ?? 1) * 3600;
  const minMemoryBytes = (options.minMemoryMb ?? 50) * 1024 * 1024;

  // 1. Get all processes listening on TCP ports
  const lsofRes = await runCommand('lsof', ['-iTCP', '-sTCP:LISTEN', '-n', '-P']);
  if (lsofRes.exitCode !== 0 || !lsofRes.stdout) {
    return [];
  }

  const pidToPorts = new Map<number, Set<number>>();
  const lines = lsofRes.stdout.split('\n').slice(1);

  for (const line of lines) {
    if (!line.trim()) continue;
    const parts = line.split(/\s+/);
    if (parts.length < 9) continue;

    const commandName = parts[0];
    const pid = parseInt(parts[1], 10);
    const address = parts[8]; // e.g. *:3000 or 127.0.0.1:5173

    if (isNaN(pid) || SYSTEM_BINARIES.has(commandName)) continue;

    const portMatch = address.match(/:(\d+)$/);
    if (portMatch) {
      const port = parseInt(portMatch[1], 10);
      if (!pidToPorts.has(pid)) {
        pidToPorts.set(pid, new Set());
      }
      pidToPorts.get(pid)!.add(port);
    }
  }

  if (pidToPorts.size === 0) {
    return [];
  }

  const pids = Array.from(pidToPorts.keys());
  const psRes = await runCommand('ps', [
    '-o',
    'pid,ppid,%cpu,rss,etime,command',
    '-p',
    pids.join(','),
  ]);

  if (psRes.exitCode !== 0 || !psRes.stdout) {
    return [];
  }

  const psLines = psRes.stdout.split('\n').slice(1);
  const items: ZombieItem[] = [];

  for (const line of psLines) {
    if (!line.trim()) continue;
    const match = line.trim().match(/^(\d+)\s+(\d+)\s+([\d.]+)\s+(\d+)\s+([^\s]+)\s+(.+)$/);
    if (!match) continue;

    const pid = parseInt(match[1], 10);
    const ppid = parseInt(match[2], 10);
    const cpu = parseFloat(match[3]);
    const rssKb = parseInt(match[4], 10);
    const etime = match[5];
    const command = match[6];

    const rssBytes = rssKb * 1024;
    const { seconds: uptimeSec, formatted: uptimeFormatted } = parseEtime(etime);
    const ports = Array.from(pidToPorts.get(pid) || []).sort((a, b) => a - b);

    // Filter out if below memory threshold or uptime threshold (unless runaway CPU)
    const isRunawayCpu = cpu >= 90.0;
    if (rssBytes < minMemoryBytes) continue;
    if (uptimeSec < minUptimeSec && !isRunawayCpu) continue;

    // Verify it is actually a dev server runtime, not a browser or system app
    const cmdBinName = path.basename(command.split(/\s+/)[0]);
    if (!isLikelyDevProcess(cmdBinName, command)) {
      continue;
    }

    // Detect framework & project info
    const cwd = await getProcessCwd(pid);
    const { framework, name: baseName } = detectFrameworkAndName(command, ports, cwd);
    const projectName = cwd ? path.basename(cwd) : undefined;
    const displayName = projectName
      ? `${projectName} (${framework || baseName})`
      : `${framework || baseName} [Port ${ports.join(', ')}]`;

    let reason = `Listening on port ${ports.join(', ')}`;
    if (isRunawayCpu) {
      reason = `Runaway CPU (${cpu.toFixed(1)}%) pegged in build/event loop`;
    } else if (uptimeSec >= 86400) {
      const days = (uptimeSec / 86400).toFixed(1);
      reason = `Forgotten server running for ${days} days (${ports.length ? 'port ' + ports.join(', ') : 'no active traffic'})`;
    } else if (ppid === 1) {
      reason = `Orphaned process (parent terminal closed) on port ${ports.join(', ')}`;
    }

    items.push({
      id: `dev-${pid}`,
      type: 'dev-server',
      name: displayName,
      framework,
      pid,
      ppid,
      rssBytes,
      rssFormatted: formatBytes(rssBytes),
      cpuPercent: cpu,
      uptime: uptimeFormatted,
      uptimeSeconds: uptimeSec,
      ports,
      projectPath: cwd,
      command,
      reason,
      killable: true,
    });
  }

  return items;
}

import fs from 'node:fs';

function detectFrameworkAndName(command: string, ports: number[], cwd?: string): { framework?: string; name: string } {
  const lower = command.toLowerCase();

  // 1. Check command line indicators
  if (lower.includes('next-server') || lower.includes('next dev') || lower.includes('next/dist')) {
    return { framework: 'Next.js', name: 'Next.js Dev Server' };
  }
  if (lower.includes('vite') || ports.includes(5173)) {
    return { framework: 'Vite', name: 'Vite Dev Server' };
  }
  if (lower.includes('hyperframes')) {
    return { framework: 'Hyperframes', name: 'Hyperframes Preview' };
  }
  if (lower.includes('nuxt')) {
    return { framework: 'Nuxt', name: 'Nuxt Dev Server' };
  }
  if (lower.includes('astro') || ports.includes(4321)) {
    return { framework: 'Astro', name: 'Astro Server' };
  }
  if (lower.includes('remix')) {
    return { framework: 'Remix', name: 'Remix Server' };
  }
  if (lower.includes('manage.py runserver')) {
    return { framework: 'Django', name: 'Django Server' };
  }
  if (lower.includes('uvicorn') || lower.includes('fastapi')) {
    return { framework: 'FastAPI', name: 'FastAPI / Uvicorn' };
  }
  if (lower.includes('flask') || (lower.includes('python') && ports.includes(5000))) {
    return { framework: 'Flask', name: 'Flask Server' };
  }
  if (lower.includes('rails') || lower.includes('puma')) {
    return { framework: 'Rails', name: 'Ruby on Rails / Puma' };
  }
  if (lower.includes('webpack')) {
    return { framework: 'Webpack', name: 'Webpack Dev Server' };
  }
  if (lower.includes('esbuild')) {
    return { framework: 'esbuild', name: 'esbuild watcher' };
  }

  // 2. Check project directory files (package.json, manage.py)
  if (cwd) {
    try {
      const pkgPath = path.join(cwd, 'package.json');
      if (fs.existsSync(pkgPath)) {
        const pkgStr = fs.readFileSync(pkgPath, 'utf8');
        if (pkgStr.includes('"next"')) return { framework: 'Next.js', name: 'Next.js Server' };
        if (pkgStr.includes('"vite"')) return { framework: 'Vite', name: 'Vite Server' };
        if (pkgStr.includes('"nuxt"')) return { framework: 'Nuxt', name: 'Nuxt Server' };
        if (pkgStr.includes('"astro"')) return { framework: 'Astro', name: 'Astro Server' };
        if (pkgStr.includes('"@remix-run')) return { framework: 'Remix', name: 'Remix Server' };
        if (pkgStr.includes('"express"')) return { framework: 'Express', name: 'Express Server' };
        if (pkgStr.includes('"fastify"')) return { framework: 'Fastify', name: 'Fastify Server' };
      }
      if (fs.existsSync(path.join(cwd, 'manage.py'))) {
        return { framework: 'Django', name: 'Django Server' };
      }
    } catch {
      // Ignore read errors
    }
  }

  const execBase = path.basename(command.split(/\s+/)[0]);
  return { name: execBase || 'Dev Server' };
}

function isLikelyDevProcess(commandName: string, fullCommand: string): boolean {
  const lowerCmd = fullCommand.toLowerCase();
  const lowerName = commandName.toLowerCase();

  // If it's a known non-dev app, reject immediately
  const ignoredPatterns = [
    'google chrome',
    'chrome',
    'brave',
    'safari',
    'firefox',
    'arc',
    'slack',
    'discord',
    'spotify',
    'dropbox',
    'steam',
    'cursor',
    'code helper',
    'language_server',
    'languageserver',
    'rust-analyzer',
    'pyright',
    'gopls',
  ];

  for (const pat of ignoredPatterns) {
    if (lowerCmd.includes(pat) || lowerName.includes(pat)) {
      return false;
    }
  }

  // Common developer runtimes and tools
  const devRuntimes = [
    'node',
    'bun',
    'deno',
    'next-server',
    'vite',
    'esbuild',
    'python',
    'python3',
    'ruby',
    'puma',
    'rails',
    'hyperframes',
    'cargo',
    'go',
    'uvicorn',
    'gunicorn',
    'flask',
    'django',
    'webpack',
    'nodemon',
    'ts-node',
    'tsx',
  ];

  for (const runtime of devRuntimes) {
    if (lowerCmd.includes(runtime) || lowerName.includes(runtime)) {
      return true;
    }
  }

  return false;
}
