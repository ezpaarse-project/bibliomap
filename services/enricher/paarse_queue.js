import { PassThrough, Readable } from 'stream';
import JSONStream from 'JSONStream';
import config from 'config';

class PaarseQueue {
  constructor(cb, errCb) {
    this.cb = cb;
    this.errCb = errCb;
    this.writeStream = new PassThrough();
    this.length = 0;

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
      if (!res.ok) {
        console.error(`[ezPAARSE] Failed to connect to ezPAARSE: ${res.status} ${res.statusText}`);
        return;
      }
      const nodeReadable = Readable.fromWeb(res.body);
      nodeReadable
        .pipe(JSONStream.parse())
        .on('data', (data) => {
          this.length -= 1;
          const output = {};
          broadcastedFields.forEach((field) => {
            output[field] = data[field];
          });
          output.ezproxyName = data['bib-groups'].toUpperCase();
          output.datetime = data.datetime;
          this.cb(output);
        })
        .on('end', () => {
          console.log('[ezPAARSE] connection closed');
          this.writeStream.end();
          this.errCb();
        })
        .on('close', () => {
          console.log('[ezPAARSE] connection closed');
          this.writeStream.end();
          this.errCb();
        })
        .on('error', (err) => {
          this.length -= 1;
          console.log('[ezPAARSE] error');
          console.error(err);
        });
    });
  }

  push(line) {
    this.length += 1;
    this.writeStream.write(`${line}\n`);
  }
}

export default PaarseQueue;
