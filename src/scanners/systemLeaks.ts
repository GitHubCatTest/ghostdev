import { ZombieItem } from '../types.js';
import { runCommand, formatBytes, parseEtime } from '../utils.js';

export function checkControlCenterLeak(rssBytes: number, uptimeSec: number, fdCount: number): boolean {
  // Normal Control Center is ~50MB and ~80 ports/descriptors
  // Flag as leaking if >= 400MB, or >= 300 open descriptors, or running for >= 1 day with >= 250MB
  return (
    rssBytes >= 400 * 1024 * 1024 ||
    fdCount >= 300 ||
    (uptimeSec >= 86400 && rssBytes >= 250 * 1024 * 1024)
  );
}

export async function getControlCenterInfo(): Promise<{
  pid: number;
  rssBytes: number;
  rssFormatted: string;
  cpuPercent: number;
  uptime: string;
  uptimeSeconds: number;
  fdCount: number;
  isLeaking: boolean;
} | null> {
  const ccRes = await runCommand('pgrep', ['-x', 'ControlCenter']);
  if (ccRes.exitCode !== 0 || !ccRes.stdout.trim()) {
    return null;
  }

  const pid = parseInt(ccRes.stdout.trim().split('\n')[0], 10);
  if (isNaN(pid)) return null;

  const psRes = await runCommand('ps', ['-p', pid.toString(), '-o', 'pid,%cpu,rss,etime,comm']);
  if (psRes.exitCode !== 0 || !psRes.stdout) return null;

  const lines = psRes.stdout.split('\n').slice(1);
  for (const line of lines) {
    if (!line.trim()) continue;
    const match = line.trim().match(/^(\d+)\s+([\d.]+)\s+(\d+)\s+([^\s]+)\s+(.+)$/);
    if (!match) continue;

    const cpu = parseFloat(match[2]);
    const rssKb = parseInt(match[3], 10);
    const etime = match[4];

    const rssBytes = rssKb * 1024;
    const { seconds: uptimeSec, formatted: uptimeFormatted } = parseEtime(etime);

    const lsofRes = await runCommand('lsof', ['-p', pid.toString()]);
    const fdCount = lsofRes.stdout.split('\n').length;
    const isLeaking = checkControlCenterLeak(rssBytes, uptimeSec, fdCount);

    return {
      pid,
      rssBytes,
      rssFormatted: formatBytes(rssBytes),
      cpuPercent: cpu,
      uptime: uptimeFormatted,
      uptimeSeconds: uptimeSec,
      fdCount,
      isLeaking,
    };
  }

  return null;
}

export async function scanSystemLeaks(): Promise<ZombieItem[]> {
  const items: ZombieItem[] = [];
  const cc = await getControlCenterInfo();

  if (cc && cc.isLeaking) {
    const isSevere = cc.rssBytes >= 1024 * 1024 * 1024;
    const leakDescription = isSevere
      ? `Severe memory leak: using ${cc.rssFormatted} (normal is ~50 MB). Restarting resets memory immediately.`
      : `Memory leak over ${cc.uptime} uptime: using ${cc.rssFormatted} (${cc.fdCount} open descriptors, normal is ~80).`;

    items.push({
      id: `leak-controlcenter-${cc.pid}`,
      type: 'memory-leak',
      name: 'macOS Control Center',
      framework: 'CoreServices',
      pid: cc.pid,
      rssBytes: cc.rssBytes,
      rssFormatted: cc.rssFormatted,
      cpuPercent: cc.cpuPercent,
      uptime: cc.uptime,
      uptimeSeconds: cc.uptimeSeconds,
      ports: [],
      command: 'ControlCenter',
      reason: leakDescription,
      killable: true,
    });
  }

  return items;
}
