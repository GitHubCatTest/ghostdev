import { describe, it, expect } from 'vitest';
import { checkControlCenterLeak } from '../src/scanners/systemLeaks.js';

describe('checkControlCenterLeak', () => {
  const MB = 1024 * 1024;
  const GB = 1024 * MB;

  it('identifies healthy Control Center memory usage as not leaking', () => {
    // Typical healthy baseline: ~50-80 MB, ~80 file descriptors, fresh uptime
    const isLeaking = checkControlCenterLeak(65 * MB, 3600, 85);
    expect(isLeaking).toBe(false);
  });

  it('detects memory leak when RSS exceeds 400 MB threshold', () => {
    // Moderate leak: 500 MB
    const isLeaking = checkControlCenterLeak(500 * MB, 7200, 120);
    expect(isLeaking).toBe(true);
  });

  it('detects severe memory leak when Control Center balloons to 1.5 GB', () => {
    // Severe real-world leak case reported by user (1.5 GB)
    const isLeaking = checkControlCenterLeak(1.5 * GB, 14400, 150);
    expect(isLeaking).toBe(true);
  });

  it('detects leak when file descriptor count spikes past 300', () => {
    // Descriptor leak even with moderate memory
    const isLeaking = checkControlCenterLeak(120 * MB, 5000, 320);
    expect(isLeaking).toBe(true);
  });

  it('detects leak when process has run for over 1 day with memory >= 250 MB', () => {
    // Extended uptime with elevated memory (90,000 seconds > 1 day, 260 MB)
    const isLeaking = checkControlCenterLeak(260 * MB, 90000, 110);
    expect(isLeaking).toBe(true);
  });

  it('does not flag process running over 1 day if memory remains low (< 250 MB)', () => {
    // Extended uptime with normal memory (90,000 seconds > 1 day, 100 MB)
    const isLeaking = checkControlCenterLeak(100 * MB, 90000, 90);
    expect(isLeaking).toBe(false);
  });
});
