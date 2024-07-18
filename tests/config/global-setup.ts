import ChildProcess from 'child_process';
import DotEnv from 'dotenv';
import Path from 'path';

export function setup() {
  const env = DotEnv.config({ path: Path.resolve(import.meta.dirname, './tests.env') }).parsed;
  ChildProcess.execSync('prisma migrate deploy', { env: { ...process.env, ...env } });
}
