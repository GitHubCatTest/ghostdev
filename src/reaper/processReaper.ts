import { ReapOptions, ReapResult, ZombieItem } from '../types.js';
import { runCommand, formatBytes } from '../utils.js';

export async function reapProcesses(items: ZombieItem[], options: ReapOptions = {}): Promise<ReapResult> {
  const { dryRun = false } = options;
  const reaped: ZombieItem[] = [];
  const failed: { item: ZombieItem; error: string }[] = [];
  let bytesReclaimed = 0;

  for (const item of items) {
    if (!item.killable) continue;

    if (dryRun) {
      reaped.push(item);
      bytesReclaimed += item.rssBytes;
      continue;
    }

    try {
      if (item.type === 'virtual-machine') {
        if (item.id === 'vm-colima') {
          const res = await runCommand('colima', ['stop']);
          if (res.exitCode === 0) {
            reaped.push(item);
            bytesReclaimed += item.rssBytes;
          } else {
            failed.push({ item, error: res.stderr || 'Failed to stop Colima' });
          }
        } else if (item.id.startsWith('vm-lima-')) {
          const instName = item.id.replace('vm-lima-', '');
          const res = await runCommand('limactl', ['stop', instName]);
          if (res.exitCode === 0) {
            reaped.push(item);
            bytesReclaimed += item.rssBytes;
          } else {
            failed.push({ item, error: res.stderr || `Failed to stop Lima instance ${instName}` });
          }
        }
      } else if (item.type === 'memory-leak' && item.name.includes('Control Center')) {
        const res = await runCommand('killall', ['ControlCenter']);
        if (res.exitCode === 0) {
          reaped.push(item);
          bytesReclaimed += item.rssBytes;
        } else {
          failed.push({ item, error: res.stderr || 'Failed to restart Control Center' });
        }
      } else if (item.type === 'dev-server' && item.pid > 0) {
        // First kill child worker processes if any
        await runCommand('pkill', ['-P', item.pid.toString()]);

        // Send SIGTERM
        await runCommand('kill', ['-15', item.pid.toString()]);

        // Wait 1.5 seconds to see if it gracefully shuts down
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Check if still alive
        const check = await runCommand('ps', ['-p', item.pid.toString()]);
        if (check.exitCode === 0 && check.stdout.includes(item.pid.toString())) {
          // Force kill if it ignored SIGTERM
          await runCommand('kill', ['-9', item.pid.toString()]);
        }

        reaped.push(item);
        bytesReclaimed += item.rssBytes;
      }
    } catch (err: any) {
      failed.push({ item, error: err.message || 'Unknown error during reap' });
    }
  }

  return {
    reaped,
    failed,
    bytesReclaimed,
    formattedReclaimed: formatBytes(bytesReclaimed),
  };
}
