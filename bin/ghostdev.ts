#!/usr/bin/env node
import { Command } from 'commander';
import { scanCommand, reapCommand, notifyCommand, daemonCommand } from '../src/cli/commands.js';

const program = new Command();

program
  .name('ghostdev')
  .description('Find and slay zombie dev servers, idle VMs, and memory leaks on macOS.')
  .version('0.1.0');

program
  .command('scan', { isDefault: true })
  .description('Scan for abandoned dev servers, idle VMs, and memory leaks (default)')
  .option('-u, --min-uptime <hours>', 'Minimum process uptime in hours to consider idle', '1')
  .option('-m, --min-memory <mb>', 'Minimum memory in MB to consider', '50')
  .option('--no-leaks', 'Exclude macOS system memory leaks like Control Center')
  .action(async (opts) => {
    await scanCommand({
      minUptimeHours: parseFloat(opts.minUptime),
      minMemoryMb: parseFloat(opts.minMemory),
      includeLeaks: opts.leaks,
    });
  });

program
  .command('reap')
  .description('Safely stop identified zombie dev servers and idle VMs')
  .option('-d, --dry-run', 'Simulate reap without killing any processes')
  .option('-u, --min-uptime <hours>', 'Minimum process uptime in hours to reap', '1')
  .option('-m, --min-memory <mb>', 'Minimum memory in MB to reap', '50')
  .option('--no-leaks', 'Exclude macOS system memory leaks')
  .action(async (opts) => {
    await reapCommand({
      dryRun: opts.dryRun,
      minUptimeHours: parseFloat(opts.minUptime),
      minMemoryMb: parseFloat(opts.minMemory),
      includeLeaks: opts.leaks,
    });
  });

program
  .command('notify')
  .description('Trigger a macOS desktop alert if wasted RAM exceeds threshold')
  .option('-t, --threshold <mb>', 'Alert threshold in MB', '2048')
  .action(async (opts) => {
    await notifyCommand({
      thresholdMb: parseFloat(opts.threshold),
    });
  });

const daemonCmd = program
  .command('daemon')
  .description('Run GhostDev continuously in the background and notify when RAM leaks')
  .option('-i, --interval <minutes>', 'Check interval in minutes', '30')
  .option('-t, --threshold <mb>', 'Alert threshold in MB', '2048')
  .action(async (opts) => {
    await daemonCommand({
      intervalMinutes: parseFloat(opts.interval),
      thresholdMb: parseFloat(opts.threshold),
    });
  });

daemonCmd
  .command('install')
  .description('Install GhostDev as a persistent macOS LaunchAgent background service')
  .option('-i, --interval <minutes>', 'Check interval in minutes', '30')
  .option('-t, --threshold <mb>', 'Alert threshold in MB', '2048')
  .action(async (opts) => {
    const { installDaemonCommand } = await import('../src/cli/commands.js');
    await installDaemonCommand({
      intervalMinutes: parseFloat(opts.interval),
      thresholdMb: parseFloat(opts.threshold),
    });
  });

daemonCmd
  .command('uninstall')
  .description('Uninstall GhostDev macOS LaunchAgent service')
  .action(async () => {
    const { uninstallDaemonCommand } = await import('../src/cli/commands.js');
    await uninstallDaemonCommand();
  });

program.parse(process.argv);
