import { ZombieItem } from '../types.js';
import { runCommand, formatBytes, parseEtime } from '../utils.js';

export async function scanVirtualMachines(): Promise<ZombieItem[]> {
  const items: ZombieItem[] = [];

  // 1. Check Colima
  const colimaRes = await runCommand('colima', ['status']);
  if (colimaRes.exitCode === 0 && colimaRes.stdout.includes('colima is running')) {
    // Check if any containers are actively running
    const dockerPs = await runCommand('docker', ['ps', '-q']);
    const runningContainers = dockerPs.stdout.trim().split('\n').filter(Boolean);

    if (runningContainers.length === 0) {
      // Find the VM process (Apple Virtualization or QEMU for limactl)
      const vmPs = await runCommand('ps', ['aux']);
      const lines = vmPs.stdout.split('\n');

      let vmPid: number | undefined;
      let vmRssKb = 0;
      let vmEtime = '';
      let vmCpu = 0;

      for (const line of lines) {
        if (
          line.includes('Virtual Machine Service for limactl') ||
          (line.includes('limactl hostagent') && line.includes('colima'))
        ) {
          const parts = line.trim().split(/\s+/);
          const pid = parseInt(parts[1], 10);
          const cpu = parseFloat(parts[2]);
          const rss = parseInt(parts[5], 10);
          if (rss > vmRssKb) {
            vmRssKb = rss;
            vmPid = pid;
            vmCpu = cpu;
            vmEtime = parts[9];
          }
        }
      }

      const rssBytes = vmRssKb > 0 ? vmRssKb * 1024 : 8 * 1024 * 1024 * 1024; // default ~8GB if virtualized framework hides RSS
      const { seconds: uptimeSec, formatted: uptimeFormatted } = vmEtime
        ? parseEtime(vmEtime)
        : { seconds: 3600, formatted: '1h+' };

      items.push({
        id: 'vm-colima',
        type: 'virtual-machine',
        name: 'Colima VM (Docker Runtime)',
        framework: 'Colima / Lima',
        pid: vmPid || 0,
        rssBytes,
        rssFormatted: formatBytes(rssBytes),
        cpuPercent: vmCpu,
        uptime: uptimeFormatted,
        uptimeSeconds: uptimeSec,
        ports: [],
        command: 'colima start',
        reason: 'VM is running but has 0 active Docker containers (idle RAM reservation)',
        killable: true,
      });
    }
  }

  // 2. Check general Lima instances if limactl is installed
  const limaList = await runCommand('limactl', ['list', '--json']);
  if (limaList.exitCode === 0 && limaList.stdout.trim()) {
    try {
      const instances = JSON.parse(`[${limaList.stdout.trim().split('\n').join(',')}]`);
      for (const inst of instances) {
        if (inst.status === 'Running' && inst.name !== 'colima') {
          items.push({
            id: `vm-lima-${inst.name}`,
            type: 'virtual-machine',
            name: `Lima VM (${inst.name})`,
            framework: 'Lima',
            pid: 0,
            rssBytes: (inst.memory || 4) * 1024 * 1024 * 1024,
            rssFormatted: `${inst.memory || 4} GB`,
            cpuPercent: 0,
            uptime: 'Active',
            uptimeSeconds: 3600,
            ports: [],
            command: `limactl start ${inst.name}`,
            reason: `Lima instance ${inst.name} is running in background`,
            killable: true,
          });
        }
      }
    } catch {
      // Ignore JSON parse errors if limactl output format varies
    }
  }

  return items;
}
