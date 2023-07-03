import cluster from 'node:cluster';
import { isMultiMode } from './cli.js';
import { ProcessType } from '../types/process.js';

export const getProcessType = (): ProcessType => {
  if (isMultiMode()) {
    return cluster.isPrimary ? ProcessType.Master : ProcessType.Worker;
  }

  return ProcessType.Server;
};
