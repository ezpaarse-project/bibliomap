import { EventEmitter } from 'events';
import net from 'net';
import pino from 'pino';

const logger = pino();

export default class HarvesterListener extends EventEmitter {
  constructor() {
    super();
    const [host, port] = process.env.HARVESTER_URL.split(':');
    this.options = {
      host,
      port,
    };
    console.log('OPTIONS:', this.options);
  }

  listen(cb) {
    this.server = net.createServer((c) => {
      this.connection = c;

      c.on('end', () => {
        logger.info('server disconnected');
      });

      // read the data stream
      c.map((line) => this.parseLine(line));
    });
    this.server.listen(this.options, () => {
      if (cb) cb();
    });
  }

  parseLine(l) {
    let line = l;
    const self = this;
    line = line.trim();
    self.emit('raw', line);
    line = line.split('|');
    if (line[0] === '+node') {
      self.emit('+node', line[1], line[2] ? line[2].split(',') : []);
    } else if (line[0] === '-node') {
      self.emit('-node', line[1]);
    } else if (line[0] === '+log') {
      self.emit('+log', line[1], line[2], line[3], line[4]);
    } else {
      self.emit('unknown', line);
    }
  }
}
