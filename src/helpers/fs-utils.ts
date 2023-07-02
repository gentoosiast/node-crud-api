import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const getModuleFilename = (fileURL: string | URL): string => {
  return fileURLToPath(fileURL);
};

export const getModuleDirectory = (fileURL: string | URL): string => {
  return dirname(getModuleFilename(fileURL));
};
