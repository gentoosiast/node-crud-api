export const isMultiMode = (): boolean => {
  return process.argv.includes('--multi');
};
