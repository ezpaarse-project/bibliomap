import { PassThrough, Readable } from 'stream';
import JSONStream from 'JSONStream';
import config from 'config';
import pino from 'pino';

const logger = pino();

class PaarseQueue {
  constructor(onData, cb) {
    console.log('PaarseQueue constructor');
    this.onData = onData;
    this.cb = cb;
    this.writeStream = new PassThrough();

    const broadcastedFields = config.broadcast.fields;

    fetch(config.ezpaarse.url, {
      method: 'POST',
      headers: { // FIXME 2025-04-14 CANNOT SEEM TO USE THE HEADERS FROM THE CONFIG! HELP!!!
        Accept: 'application/jsonstream',
        'Double-Click-Removal': 'false',
        'crossref-enrich': 'false',
        'ezPAARSE-Predefined-Settings': 'bibliomap',
      },
      body: this.writeStream,
      duplex: 'half',
    }).then((res) => {
      console.log('RESPONSE', res);
      if (!res.ok) {
        logger.error(`[ezPAARSE] Failed to connect to ezPAARSE: ${res.status} ${res.statusText}`);
        return;
      }
      const nodeReadable = Readable.fromWeb(res.body);
      nodeReadable
        .pipe(JSONStream.parse())
        .on('data', (data) => {
          const output = {};
          broadcastedFields.forEach((field) => {
            output[field] = data[field];
          });
          output.ezproxyName = data['bib-groups'].toUpperCase();
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
    }).catch((err) => {
      logger.error('[ezPAARSE] error');
      logger.error(err);
    });
  }

  push(line) {
    this.writeStream.write(`${line}\n`);
  }
}

export default PaarseQueue;
