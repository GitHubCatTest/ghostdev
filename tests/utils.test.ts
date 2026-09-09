import { describe, it, expect } from 'vitest';
import { formatBytes, parseEtime } from '../src/utils.js';

describe('formatBytes', () => {
  it('formats zero bytes', () => {
    expect(formatBytes(0)).toBe('0 B');
  });

  it('formats kilobytes', () => {
    expect(formatBytes(1024)).toBe('1.00 KB');
    expect(formatBytes(20480)).toBe('20.0 KB');
  });

  it('formats megabytes', () => {
    expect(formatBytes(1024 * 1024)).toBe('1.00 MB');
    expect(formatBytes(350 * 1024 * 1024)).toBe('350.0 MB');
  });

  it('formats gigabytes with high precision', () => {
    expect(formatBytes(1024 * 1024 * 1024)).toBe('1.00 GB');
    expect(formatBytes(8.02 * 1024 * 1024 * 1024)).toBe('8.02 GB');
  });
});

describe('parseEtime', () => {
  it('parses mm:ss', () => {
    const res = parseEtime('04:30');
    expect(res.seconds).toBe(270);
    expect(res.formatted).toBe('4m 30s');
  });

  it('parses hh:mm:ss', () => {
    const res = parseEtime('02:15:30');
    expect(res.seconds).toBe(2 * 3600 + 15 * 60 + 30);
    expect(res.formatted).toBe('2h 15m');
  });

  it('parses dd-hh:mm:ss', () => {
    const res = parseEtime('02-07:49:39');
    expect(res.seconds).toBe(2 * 86400 + 7 * 3600 + 49 * 60 + 39);
    expect(res.formatted).toBe('2d 7h');
  });

  it('handles 5 days uptime', () => {
    const res = parseEtime('05-01:15:19');
    expect(res.seconds).toBe(5 * 86400 + 1 * 3600 + 15 * 60 + 19);
    expect(res.formatted).toBe('5d 1h');
  });
});
