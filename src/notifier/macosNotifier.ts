import { runCommand } from '../utils.js';

export interface NotificationPayload {
  title: string;
  subtitle?: string;
  message: string;
  sound?: string;
}

export async function sendMacNotification(payload: NotificationPayload): Promise<boolean> {
  const title = payload.title.replace(/"/g, '\\"');
  const subtitle = payload.subtitle ? payload.subtitle.replace(/"/g, '\\"') : '';
  const message = payload.message.replace(/"/g, '\\"');
  const sound = payload.sound ? `sound name "${payload.sound.replace(/"/g, '\\"')}"` : '';

  let script = `display notification "${message}" with title "${title}"`;
  if (subtitle) {
    script += ` subtitle "${subtitle}"`;
  }
  if (sound) {
    script += ` ${sound}`;
  }

  const res = await runCommand('osascript', ['-e', script]);
  return res.exitCode === 0;
}
