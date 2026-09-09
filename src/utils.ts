import { execFile, execSync } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const val = bytes / Math.pow(1024, i);
  return `${val.toFixed(val >= 10 || i === 0 ? 1 : 2)} ${units[i]}`;
}

export function parseEtime(etime: string): { seconds: number; formatted: string } {
  // Format from ps -o etime can be [[dd-]hh:]mm:ss
  const trimmed = etime.trim();
  let days = 0;
  let rest = trimmed;

  if (trimmed.includes('-')) {
    const parts = trimmed.split('-');
    days = parseInt(parts[0], 10) || 0;
    rest = parts[1];
  }

  const timeParts = rest.split(':').map(p => parseInt(p, 10) || 0);
  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  if (timeParts.length === 3) {
    [hours, minutes, seconds] = timeParts;
  } else if (timeParts.length === 2) {
    [minutes, seconds] = timeParts;
  } else if (timeParts.length === 1) {
    [seconds] = timeParts;
  }

  const totalSeconds = days * 86400 + hours * 3600 + minutes * 60 + seconds;

  let formatted = '';
  if (days > 0) {
    formatted = `${days}d ${hours}h`;
  } else if (hours > 0) {
    formatted = `${hours}h ${minutes}m`;
  } else {
    formatted = `${minutes}m ${seconds}s`;
  }

  return { seconds: totalSeconds, formatted };
}

export async function runCommand(cmd: string, args: string[] = []): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  try {
    const res = await execFileAsync(cmd, args, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    return { stdout: res.stdout, stderr: res.stderr, exitCode: 0 };
  } catch (err: any) {
    return {
      stdout: err.stdout || '',
      stderr: err.stderr || err.message || '',
      exitCode: typeof err.code === 'number' ? err.code : 1,
    };
  }
}

export function runCommandSync(cmd: string, args: string[] = []): { stdout: string; stderr: string; exitCode: number } {
  try {
    const stdout = execSync(`${cmd} ${args.join(' ')}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    return { stdout, stderr: '', exitCode: 0 };
  } catch (err: any) {
    return {
      stdout: err.stdout?.toString() || '',
      stderr: err.stderr?.toString() || err.message || '',
      exitCode: typeof err.status === 'number' ? err.status : 1,
    };
  }
}

export async function getProcessCwd(pid: number): Promise<string | undefined> {
  const res = await runCommand('lsof', ['-a', '-d', 'cwd', '-p', pid.toString(), '-Fn']);
  if (res.exitCode === 0 && res.stdout) {
    const lines = res.stdout.split('\n');
    for (const line of lines) {
      if (line.startsWith('n/')) {
        return line.substring(1).trim();
      }
    }
  }
  return undefined;
}
