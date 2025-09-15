import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

const prettyStream = isDev
  ? pino.transport({
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname',
      },
    })
  : undefined;

const streams = isDev ? [{ stream: prettyStream }] : [{ stream: process.stdout }];

const logger = pino(
  {
    level: 'info',
    base: null,
    formatters: {
      level(label) {
        return { level: label.toUpperCase() };
      },
    },
  },
  pino.multistream(streams),
);

export default logger;