import pc from 'picocolors';
import { ScanResult, ZombieItem } from '../types.js';

export function formatHeader(): string {
  return `\n${pc.bold(pc.cyan('👻 GhostDev'))} ${pc.dim('v0.1.0')} : macOS Dev Server & Memory Reaper\n`;
}

export function formatScanResult(result: ScanResult): string {
  const lines: string[] = [formatHeader()];

  if (result.items.length === 0) {
    lines.push(
      pc.green('  ✔ All clean! No zombie dev servers, idle VMs, or memory leaks found.')
    );
    lines.push(pc.dim('  Your Mac is running lean and fast.\n'));
    return lines.join('\n');
  }

  lines.push(
    `  Found ${pc.bold(pc.yellow(result.items.length.toString()))} idle processes holding ` +
      `${pc.bold(pc.green(result.totalRssFormatted))} of memory:\n`
  );

  for (const item of result.items) {
    lines.push(formatItemRow(item));
  }

  lines.push(pc.dim('\n  ' + '─'.repeat(72)));
  lines.push(
    `  ${pc.bold('Total Reclaimable Memory:')} ${pc.bold(pc.green(result.totalRssFormatted))}`
  );
  
  const hasSystemLeak = result.items.some((it) => it.type === 'memory-leak');
  if (hasSystemLeak) {
    lines.push(
      `  Run ${pc.cyan('ghostdev restart-control-center')} to reset Control Center, or ${pc.cyan('ghostdev reap')} to free all.\n`
    );
  } else {
    lines.push(
      `  Run ${pc.cyan('ghostdev reap')} to safely free this RAM.\n`
    );
  }

  return lines.join('\n');
}

function formatItemRow(item: ZombieItem): string {
  let badge = '';
  switch (item.type) {
    case 'dev-server':
      badge = pc.cyan('[DEV SERVER]');
      break;
    case 'virtual-machine':
      badge = pc.yellow('[VM / DOCKER]');
      break;
    case 'memory-leak':
      badge = pc.red('[SYSTEM LEAK]');
      break;
  }

  const pidStr = item.pid > 0 ? pc.dim(`(PID ${item.pid})`) : '';
  const portStr = item.ports.length > 0 ? pc.magenta(` :${item.ports.join(', :')}`) : '';
  const memStr = pc.bold(pc.green(item.rssFormatted.padStart(9)));
  const cpuStr =
    item.cpuPercent >= 90
      ? pc.bold(pc.red(`${item.cpuPercent.toFixed(1)}% CPU`))
      : pc.dim(`${item.cpuPercent.toFixed(1)}% CPU`);
  const uptimeStr = pc.dim(`up ${item.uptime}`);

  const mainLine = `  ${badge.padEnd(16)} ${memStr}  ${pc.bold(item.name)} ${portStr} ${pidStr}`;
  const subLine = `  ${' '.repeat(16)} ${pc.dim('↳')} ${pc.dim(item.reason)} • ${cpuStr} • ${uptimeStr}`;

  return `${mainLine}\n${subLine}\n`;
}

export function formatReapResult(
  reaped: ZombieItem[],
  failed: { item: ZombieItem; error: string }[],
  totalReclaimed: string,
  isDryRun: boolean
): string {
  const lines: string[] = [formatHeader()];

  if (isDryRun) {
    lines.push(pc.yellow('  [DRY RUN] No processes were terminated.\n'));
    lines.push(`  Would have stopped ${pc.bold(reaped.length.toString())} items to reclaim ${pc.bold(pc.green(totalReclaimed))}:\n`);
    for (const item of reaped) {
      lines.push(`  ${pc.dim('•')} ${item.name} (${item.rssFormatted})`);
    }
    lines.push(pc.dim(`\n  Run ${pc.cyan('ghostdev reap')} without --dry-run to execute.\n`));
    return lines.join('\n');
  }

  if (reaped.length > 0) {
    lines.push(pc.green(`  ✔ Successfully reaped ${pc.bold(reaped.length.toString())} processes!`));
    lines.push(`  Freed ${pc.bold(pc.green(totalReclaimed))} of RAM back to macOS:\n`);
    for (const item of reaped) {
      const verb = item.type === 'memory-leak' ? 'Restarted' : 'Stopped';
      lines.push(`  ${pc.green('✔')} ${verb} ${item.name} ${pc.dim(`(reclaimed ${item.rssFormatted})`)}`);
    }
  }

  if (failed.length > 0) {
    lines.push(pc.red(`\n  ✖ Failed to terminate ${failed.length} processes:`));
    for (const f of failed) {
      lines.push(`  ${pc.red('✖')} ${f.item.name}: ${f.error}`);
    }
  }

  lines.push('');
  return lines.join('\n');
}
