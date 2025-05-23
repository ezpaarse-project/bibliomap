import { PassThrough, Readable } from 'stream';
import JSONStream from 'JSONStream';
import config from 'config';
import pino from 'pino';

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
      const res = await fetch(config.ezpaarse.url, {
        method: 'POST',
        headers: { // FIXME 2025-04-14 CANNOT SEEM TO USE THE HEADERS FROM THE CONFIG! HELP!!!
          Accept: 'application/jsonstream',
          'Traces-Level': 'info',
          'Log-Format-ezproxy': '%h %{ezproxy-session} %l %u %t "%r" %s %b %{bib-groups}<[a-zA-Z0-9@\\.\\-_%\\,=\\+]+>',
          'Crypted-Fields': 'login,user',
          'Output-Fields': '+bib-groups',
          'ezPAARSE-Middlewares': '(only) filter, parser, geolocalizer, ebscohost, qualifier', // TODO: only keep wanted middlewares
          extract: 'login => /^([^_]+)_O_([^_]+)_I_([^_]+)_OU_([^_]+)$/ => user,section,department,unit',
        },
        body: this.writeStream,
        duplex: 'half',
      });

      if (!res.ok) {
        logger.error(`[ezPAARSE] Failed to connect to ezPAARSE: ${res.status} ${res.statusText}`);
        return;
      }

      const broadcastedFields = config.broadcast.fields;

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
