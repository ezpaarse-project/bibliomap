import { PassThrough, Readable } from 'stream';
import JSONStream from 'JSONStream';
import pino from 'pino';
import config from '../config/config.json' with { type: 'json' };

const logger = pino();

class PaarseQueue {
  constructor(onData, cb) {
    this.onData = onData;
    this.cb = cb;
    this.writeStream = new PassThrough();
    this.start();
  }

  async start() {
    try {
      const res = await fetch(process.env.EZPAARSE_URL, {
        method: 'POST',
        headers: config.headers,
        body: this.writeStream,
        duplex: 'half',
      });

      if (!res.ok) {
        logger.error(`[ezPAARSE] Failed to connect to ezPAARSE: ${res.status} ${res.statusText}`);
        return;
      }

      const broadcastedFields = config.broadcasted_fields;

      const nodeReadable = Readable.fromWeb(res.body);
      nodeReadable
        .pipe(JSONStream.parse())
        .on('data', (data) => {
          const output = {};
          broadcastedFields.forEach((field) => {
            output[field] = data[field];
          });
          if (config.multiple_portals && config.portal_field) {
            output.ezproxyName = data[config.portal_field];
          }
          output.datetime = data.datetime;
          this.onData(output);
        })
        .on('end', () => {
          logger.info('[ezPAARSE] connection closed');
          this.writeStream.end();
          this.cb();
        })
        .on('close', () => {
          logger.info('[ezPAARSE] connection closed');
          this.writeStream.end();
          this.cb();
        })
        .on('error', (err) => {
          logger.error('[ezPAARSE] error');
          logger.error(err);
        });
    } catch (err) {
      logger.error('[ezPAARSE] error');
      logger.error(err);
    }
  }

  push(line) {
    this.writeStream.write(`${line}\n`);
  }
}

export default PaarseQueue;
