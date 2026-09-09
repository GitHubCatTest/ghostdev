import { ZombieItem } from '../types.js';
import { runCommand, formatBytes, parseEtime } from '../utils.js';

export async function scanSystemLeaks(): Promise<ZombieItem[]> {
  const items: ZombieItem[] = [];

  // Check ControlCenter
  const ccRes = await runCommand('pgrep', ['-x', 'ControlCenter']);
  if (ccRes.exitCode === 0 && ccRes.stdout.trim()) {
    const pid = parseInt(ccRes.stdout.trim().split('\n')[0], 10);
    if (!isNaN(pid)) {
      const psRes = await runCommand('ps', ['-p', pid.toString(), '-o', 'pid,%cpu,rss,etime,comm']);
      if (psRes.exitCode === 0 && psRes.stdout) {
        const lines = psRes.stdout.split('\n').slice(1);
        for (const line of lines) {
          if (!line.trim()) continue;
          const match = line.trim().match(/^(\d+)\s+([\d.]+)\s+(\d+)\s+([^\s]+)\s+(.+)$/);
          if (!match) continue;

          const cpu = parseFloat(match[2]);
          const rssKb = parseInt(match[3], 10);
          const etime = match[4];
          const comm = match[5];

          const rssBytes = rssKb * 1024;
          const { seconds: uptimeSec, formatted: uptimeFormatted } = parseEtime(etime);

          // Count open ports / descriptors
          const lsofRes = await runCommand('lsof', ['-p', pid.toString()]);
          const fdCount = lsofRes.stdout.split('\n').length;

          // Normal is ~50MB and ~80 ports. Flag if >400MB or >400 ports or high uptime with >300MB
          const isLeaking = rssBytes >= 400 * 1024 * 1024 || fdCount >= 400 || (uptimeSec >= 172800 && rssBytes >= 300 * 1024 * 1024);

          if (isLeaking) {
            items.push({
              id: `leak-controlcenter-${pid}`,
              type: 'memory-leak',
              name: 'macOS Control Center',
              framework: 'CoreServices',
              pid,
              rssBytes,
              rssFormatted: formatBytes(rssBytes),
              cpuPercent: cpu,
              uptime: uptimeFormatted,
              uptimeSeconds: uptimeSec,
              ports: [],
              command: comm,
              reason: `Memory & Mach-port leak over ${uptimeFormatted} uptime (${fdCount} open descriptors, normal is ~80)`,
              killable: true,
            });
          }
        }
      }
    }
  }

  return items;
}
