import pino from 'pino';
import { config } from '../config';

const transport = pino.transport({
  target: 'pino-pretty',
  options: {
    colorize: config.environment !== 'production',
    translateTime: 'SYS:standard',
    ignore: 'pid,hostname'
  }
});

export const logger = pino(
  {
    level: config.environment === 'production' ? 'info' : 'debug',
    base: undefined
  },
  transport
);
