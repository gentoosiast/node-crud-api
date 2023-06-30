import fsPromises from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const BUILD_DIRECTORY = 'dist';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const buildPath = join(__dirname, BUILD_DIRECTORY);

await fsPromises.rm(buildPath, { recursive: true, force: true });
