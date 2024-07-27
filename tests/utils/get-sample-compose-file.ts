import Fs from 'fs/promises';
import FsSync from 'fs';
import Path from 'path';

export enum SampleComposeFile {
  WITHOUT_DEPS = '../samples/without-deps.docker-compose.yaml',
  WITH_DEPS = '../samples/with-deps.docker-compose.yaml',
}

export async function getSampleComposeFile(file: SampleComposeFile) {
  const filePath = Path.resolve(import.meta.dirname, file);

  if (!FsSync.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const content = (await Fs.readFile(filePath, 'utf-8')).toString();

  return content;
}
