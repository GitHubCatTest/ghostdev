import { describe, it, expect } from 'vitest';
import { reapProcesses } from '../src/reaper/processReaper.js';
import { ZombieItem } from '../src/types.js';

describe('reapProcesses', () => {
  const mockItems: ZombieItem[] = [
    {
      id: 'dev-1234',
      type: 'dev-server',
      name: 'my-web-app (Next.js)',
      pid: 1234,
      rssBytes: 1.5 * 1024 * 1024 * 1024,
      rssFormatted: '1.50 GB',
      cpuPercent: 144.3,
      uptime: '2d 7h',
      uptimeSeconds: 198000,
      ports: [3000],
      command: 'next-server (v16.2.11)',
      reason: 'Forgotten server running for 2.3 days',
      killable: true,
    },
    {
      id: 'vm-colima',
      type: 'virtual-machine',
      name: 'Colima VM',
      pid: 5678,
      rssBytes: 8 * 1024 * 1024 * 1024,
      rssFormatted: '8.00 GB',
      cpuPercent: 0.1,
      uptime: '3d 0h',
      uptimeSeconds: 259200,
      ports: [],
      command: 'colima start',
      reason: '0 active containers',
      killable: true,
    },
  ];

  it('correctly calculates reaped memory in dry-run mode without killing', async () => {
    const res = await reapProcesses(mockItems, { dryRun: true });

    expect(res.reaped.length).toBe(2);
    expect(res.failed.length).toBe(0);
    expect(res.bytesReclaimed).toBe(9.5 * 1024 * 1024 * 1024);
    expect(res.formattedReclaimed).toBe('9.50 GB');
  });

  it('skips non-killable items', async () => {
    const unkillable = [{ ...mockItems[0], killable: false }];
    const res = await reapProcesses(unkillable, { dryRun: true });

    expect(res.reaped.length).toBe(0);
    expect(res.bytesReclaimed).toBe(0);
  });
});
