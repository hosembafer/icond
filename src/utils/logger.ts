import pc from 'picocolors';

export const logger = {
  info: (message: string) => {
    console.log(pc.blue('ℹ'), message);
  },

  success: (message: string) => {
    console.log(pc.green('✓'), message);
  },

  warn: (message: string) => {
    console.log(pc.yellow('⚠'), message);
  },

  error: (message: string) => {
    console.log(pc.red('✖'), message);
  },

  step: (step: number, total: number, message: string) => {
    console.log(pc.cyan(`[${step}/${total}]`), message);
  },

  dim: (message: string) => {
    console.log(pc.dim(message));
  },
};
