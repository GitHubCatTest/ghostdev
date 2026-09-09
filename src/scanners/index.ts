import { ScanOptions, ScanResult, ZombieItem } from '../types.js';
import { formatBytes } from '../utils.js';
import { scanDevServers } from './devServers.js';
import { scanVirtualMachines } from './virtualMachines.js';
import { scanSystemLeaks } from './systemLeaks.js';

export async function runFullScan(options: ScanOptions = {}): Promise<ScanResult> {
  const includeLeaks = options.includeLeaks ?? true;

  const [devServers, virtualMachines, systemLeaks] = await Promise.all([
    scanDevServers(options),
    scanVirtualMachines(),
    includeLeaks ? scanSystemLeaks() : Promise.resolve([]),
  ]);

  const items: ZombieItem[] = [...devServers, ...virtualMachines, ...systemLeaks];

  // Sort by highest RSS memory first
  items.sort((a, b) => b.rssBytes - a.rssBytes);

  const totalRssBytes = items.reduce((acc, it) => acc + it.rssBytes, 0);

  return {
    items,
    totalRssBytes,
    totalRssFormatted: formatBytes(totalRssBytes),
    scannedAt: new Date(),
  };
}

export { scanDevServers, scanVirtualMachines, scanSystemLeaks };
