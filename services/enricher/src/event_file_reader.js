import { parse } from 'csv-parse';
import readline from 'readline';
import PaarseQueue from './paarse-queue.js';
import config from '../config/config.json' with { type: 'json' };

class EventFileReader {
  constructor(file, stream) {
    this.file = file;
    this.stream = stream;
    this.type = path.extname(file);

    this.lineQueue = [];

    this.parsing = false;
    this.eof = false;

    this.initFileReader();
  }

  initFileReader() {
    const fileReaders = {
      log: this.initLogFileReader,
      csv: this.initCsvFileReader,
    };

    fileReaders[this.type].call(this);
  }

  initLogFileReader() {
    const rl = readline.createInterface({
      input: this.stream,
    });

    rl.on('line', (line) => {
        this.pushToQueue(line);
      })
      .on('end', () => {
        this.eof = true;
      });
  }

  initCsvFileReader() {
    const broadcastedFields = config.broadcasted_fields;
    this.stream
      .pipe(parse({ columns: true, delimiter: ';' }))
      .on('data', (row) => {
        const exportedLine = {
          date: new Date(row.datetime),
          log: {},
        };
        broadcastedFields.forEach((field) => {
            exportedLine.log[field] = row[field];
          });
        exportedLine.log['ezproxyName'] = row[config.portal_field];
        this.lineQueue.push(exportedLine);
        if (!this.firstLog) this.firstLog = exportedLine;
        this.stopReaderOverload();
      })
      .on('end', () => {
        this.eof = true;
      });
  }

  pushToQueue(line) {
    if (!this.paarseQueue) {
      const broadcastedFields = config.broadcasted_fields;
      this.paarseQueue = new PaarseQueue(
        (data) => {
          const log = {
            date: new Date(data.datetime),
            log: {},
          };
          broadcastedFields.forEach((field) => {
            log.log[field] = data[field];
          });
          this.lineQueue.push(log);
          if (!this.firstLog) this.firstLog = log;
          this.stopReaderOverload();
        },
        () => {
          this.paarseQueue = null;
        },
      );
    }
    this.paarseQueue.push(line);
  }

  stopReaderOverload() {
    if (this.lineQueue.length > 5) {
      this.stream.pause();
    } else this.stream.resume();
  }

  returnAllPassedLogs(date) {
    const passedLogs = this.lineQueue
      .filter((log) => log.date.getTime() <= date);

    this.lineQueue = this.lineQueue.filter((log) => log.date.getTime() > date);

    this.stopReaderOverload();

    return passedLogs;
  }
}

export default EventFileReader;
