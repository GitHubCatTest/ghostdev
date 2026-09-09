export type ZombieType = 'dev-server' | 'virtual-machine' | 'memory-leak';

export interface ZombieItem {
  id: string;
  type: ZombieType;
  name: string;
  framework?: string;
  pid: number;
  ppid?: number;
  rssBytes: number;
  rssFormatted: string;
  cpuPercent: number;
  uptime: string;
  uptimeSeconds: number;
  ports: number[];
  projectPath?: string;
  command: string;
  reason: string;
  killable: boolean;
}

export interface ScanResult {
  items: ZombieItem[];
  totalRssBytes: number;
  totalRssFormatted: string;
  scannedAt: Date;
}

export interface ReapResult {
  reaped: ZombieItem[];
  failed: { item: ZombieItem; error: string }[];
  bytesReclaimed: number;
  formattedReclaimed: string;
}

export interface ScanOptions {
  minUptimeHours?: number;
  minMemoryMb?: number;
  includeLeaks?: boolean;
  json?: boolean;
}

export interface ReapOptions extends ScanOptions {
  dryRun?: boolean;
  force?: boolean;
  interactive?: boolean;
  type?: ZombieType;
}
