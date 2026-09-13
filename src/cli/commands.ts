import pc from 'picocolors';
import { runFullScan, getControlCenterInfo } from '../scanners/index.js';
import { reapProcesses } from '../reaper/processReaper.js';
import { sendMacNotification } from '../notifier/macosNotifier.js';
import { formatScanResult, formatReapResult } from './formatters.js';
import { ScanOptions, ReapOptions } from '../types.js';
import { runCommand, formatBytes } from '../utils.js';

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

export async function restartControlCenterCommand(options: { dryRun?: boolean; json?: boolean } = {}): Promise<void> {
  const info = await getControlCenterInfo();

  if (!info) {
    if (options.json) {
      console.log(JSON.stringify({ success: false, error: 'Control Center process not found' }, null, 2));
      return;
    }
    console.log(pc.yellow('⚠ Could not find a running macOS Control Center process.'));
    return;
  }

  if (options.dryRun) {
    if (options.json) {
      console.log(JSON.stringify({ dryRun: true, pid: info.pid, rssBytes: info.rssBytes, rssFormatted: info.rssFormatted, isLeaking: info.isLeaking }, null, 2));
      return;
    }
    console.log(pc.cyan(`\n[DRY RUN] macOS Control Center (PID ${info.pid}) is using ${pc.bold(info.rssFormatted)} RAM.`));
    if (info.isLeaking) {
      console.log(pc.yellow(`⚠ Status: LEAKING (${info.rssFormatted}, normal is ~50 MB). Would restart and free ~${info.rssFormatted}.\n`));
    } else {
      console.log(pc.green(`✔ Status: Normal memory usage.\n`));
    }
    return;
  }

  console.log(pc.bold(pc.cyan('\n🔄 Restarting macOS Control Center...')));
  console.log(pc.dim(`Current PID: ${info.pid} • Memory: ${info.rssFormatted} (normal is ~50 MB)`));

  const killRes = await runCommand('killall', ['ControlCenter']);
  if (killRes.exitCode !== 0) {
    if (options.json) {
      console.log(JSON.stringify({ success: false, error: killRes.stderr || 'Failed to restart Control Center' }, null, 2));
      return;
    }
    console.log(pc.red(`✖ Failed to restart Control Center: ${killRes.stderr || 'unknown error'}\n`));
    return;
  }

  // Wait 600ms for launchd to cleanly respawn Control Center
  await new Promise((r) => setTimeout(r, 600));

  const newInfo = await getControlCenterInfo();
  const reclaimedBytes = Math.max(0, info.rssBytes - (newInfo?.rssBytes ?? 0));
  const reclaimedFormatted = formatBytes(reclaimedBytes);

  if (options.json) {
    console.log(
      JSON.stringify(
        {
          success: true,
          oldPid: info.pid,
          newPid: newInfo?.pid,
          oldRssFormatted: info.rssFormatted,
          newRssFormatted: newInfo?.rssFormatted ?? 'unknown',
          reclaimedBytes,
          reclaimedFormatted,
        },
        null,
        2
      )
    );
    return;
  }

  console.log(pc.green(`✔ Control Center successfully restarted by macOS launchd!`));
  if (newInfo) {
    console.log(pc.dim(`  New PID: ${newInfo.pid} • Memory reset to: ${newInfo.rssFormatted}`));
  }
  if (reclaimedBytes > 100 * 1024 * 1024) {
    console.log(pc.bold(pc.green(`🎉 Reclaimed ${reclaimedFormatted} of RAM!\n`)));
  } else {
    console.log(pc.green(`✔ Memory successfully refreshed.\n`));
  }
}

export async function notifyCommand(options: { thresholdMb?: number } = {}): Promise<void> {
  const thresholdMb = options.thresholdMb ?? 2048; // default 2 GB
  const thresholdBytes = thresholdMb * 1024 * 1024;

  const result = await runFullScan();

  // Check specifically for Control Center leak
  const ccLeak = result.items.find(
    (it) => it.type === 'memory-leak' && it.name.includes('Control Center')
  );

  if (ccLeak && (ccLeak.rssBytes >= 800 * 1024 * 1024 || ccLeak.rssBytes >= thresholdBytes)) {
    await sendMacNotification({
      title: '👻 GhostDev: Control Center Memory Leak',
      subtitle: `Using ${ccLeak.rssFormatted} RAM (normal is ~50 MB)`,
      message: `Click menu bar icon or run "ghostdev restart-control-center" to reclaim ${ccLeak.rssFormatted} instantly.`,
      sound: 'Blow',
    });
    console.log(
      pc.yellow(`🚨 Alert sent: macOS Control Center is leaking ${ccLeak.rssFormatted} RAM`)
    );
    return;
  }

  if (result.totalRssBytes >= thresholdBytes && result.items.length > 0) {
    await sendMacNotification({
      title: '👻 GhostDev: Idle RAM Alert',
      subtitle: `${result.items.length} idle dev processes detected`,
      message: `Holding ${result.totalRssFormatted} of RAM. Run "ghostdev reap" in terminal to reclaim.`,
      sound: 'Blow',
    });
    console.log(pc.green(`✔ Notification sent (${result.totalRssFormatted} detected)`));
  } else {
    console.log(
      pc.dim(`✔ Memory usage is below alert threshold (${result.totalRssFormatted} < ${thresholdMb} MB)`)
    );
  }
}

import fs from 'node:fs';
import path from 'node:path';
import os from 'os';

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
