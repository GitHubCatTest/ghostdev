import pc from 'picocolors';
import { runFullScan } from '../scanners/index.js';
import { reapProcesses } from '../reaper/processReaper.js';
import { sendMacNotification } from '../notifier/macosNotifier.js';
import { formatScanResult, formatReapResult } from './formatters.js';
import { ScanOptions, ReapOptions } from '../types.js';

export async function scanCommand(options: ScanOptions = {}): Promise<void> {
  const result = await runFullScan(options);
  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }
  console.log(formatScanResult(result));
}

export async function reapCommand(options: ReapOptions = {}): Promise<void> {
  const scanResult = await runFullScan(options);

  if (scanResult.items.length === 0) {
    if (options.json) {
      console.log(JSON.stringify({ reaped: [], failed: [], bytesReclaimed: 0, formattedReclaimed: '0 B' }, null, 2));
      return;
    }
    console.log(formatScanResult(scanResult));
    return;
  }

  const reapResult = await reapProcesses(scanResult.items, options);
  if (options.json) {
    console.log(JSON.stringify(reapResult, null, 2));
    return;
  }
  console.log(
    formatReapResult(
      reapResult.reaped,
      reapResult.failed,
      reapResult.formattedReclaimed,
      options.dryRun ?? false
    )
  );
}

export async function notifyCommand(options: { thresholdMb?: number } = {}): Promise<void> {
  const thresholdMb = options.thresholdMb ?? 2048; // default 2 GB
  const thresholdBytes = thresholdMb * 1024 * 1024;

  const result = await runFullScan();

  if (result.totalRssBytes >= thresholdBytes && result.items.length > 0) {
    await sendMacNotification({
      title: '👻 GhostDev: Idle RAM Alert',
      subtitle: `${result.items.length} idle dev processes detected`,
      message: `Holding ${result.totalRssFormatted} of RAM. Run "ghostdev reap" in terminal to reclaim.`,
      sound: 'Blow',
    });
    console.log(pc.green(`✔ Notification sent (${result.totalRssFormatted} detected)`));
  } else {
    console.log(pc.dim(`✔ Memory usage is below alert threshold (${result.totalRssFormatted} < ${thresholdMb} MB)`));
  }
}

import fs from 'node:fs';
import path from 'node:path';
import os from 'os';
import { runCommand } from '../utils.js';

export async function daemonCommand(options: { intervalMinutes?: number; thresholdMb?: number } = {}): Promise<void> {
  const interval = (options.intervalMinutes ?? 30) * 60 * 1000;
  const thresholdMb = options.thresholdMb ?? 2048;

  console.log(pc.bold(pc.cyan('👻 GhostDev Daemon started.')));
  console.log(pc.dim(`Monitoring every ${options.intervalMinutes ?? 30} minutes (Alert threshold: ${thresholdMb} MB RAM)...\n`));

  // Run initial check
  await notifyCommand({ thresholdMb });

  setInterval(async () => {
    try {
      await notifyCommand({ thresholdMb });
    } catch (err: any) {
      console.error(pc.red(`Daemon error: ${err.message}`));
    }
  }, interval);
}

export async function installDaemonCommand(options: { intervalMinutes?: number; thresholdMb?: number } = {}): Promise<void> {
  const intervalSec = (options.intervalMinutes ?? 30) * 60;
  const thresholdMb = options.thresholdMb ?? 2048;
  const homeDir = os.homedir();
  const launchAgentsDir = path.join(homeDir, 'Library', 'LaunchAgents');
  const plistPath = path.join(launchAgentsDir, 'com.ghostdev.watchdog.plist');

  const nodePath = process.execPath;
  const scriptPath = path.resolve(process.argv[1]);

  const plistContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.ghostdev.watchdog</string>
    <key>ProgramArguments</key>
    <array>
        <string>${nodePath}</string>
        <string>${scriptPath}</string>
        <string>notify</string>
        <string>--threshold</string>
        <string>${thresholdMb}</string>
    </array>
    <key>StartInterval</key>
    <integer>${intervalSec}</integer>
    <key>RunAtLoad</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/ghostdev-watchdog.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/ghostdev-watchdog.err</string>
</dict>
</plist>
`;

  if (!fs.existsSync(launchAgentsDir)) {
    fs.mkdirSync(launchAgentsDir, { recursive: true });
  }

  fs.writeFileSync(plistPath, plistContent, 'utf8');
  await runCommand('launchctl', ['unload', plistPath]);
  const loadRes = await runCommand('launchctl', ['load', plistPath]);

  if (loadRes.exitCode === 0) {
    console.log(pc.green(`✔ GhostDev LaunchAgent installed and running!`));
    console.log(pc.dim(`  Service file: ${plistPath}`));
    console.log(pc.dim(`  Will alert when idle dev servers & VMs exceed ${thresholdMb} MB RAM.`));
  } else {
    console.error(pc.red(`✖ Failed to load LaunchAgent: ${loadRes.stderr}`));
  }
}

export async function uninstallDaemonCommand(): Promise<void> {
  const homeDir = os.homedir();
  const plistPath = path.join(homeDir, 'Library', 'LaunchAgents', 'com.ghostdev.watchdog.plist');

  if (fs.existsSync(plistPath)) {
    await runCommand('launchctl', ['unload', plistPath]);
    fs.unlinkSync(plistPath);
    console.log(pc.green('✔ GhostDev LaunchAgent uninstalled successfully.'));
  } else {
    console.log(pc.dim('✔ No LaunchAgent was currently installed.'));
  }
}
