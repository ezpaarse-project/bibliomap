import { parse } from 'csv-parse';
import readline from 'readline';
import PaarseQueue from './paarse-queue.js';

class SingleLogReader {
  constructor(file, stream) {
    this.file = file;
    this.stream = stream;
    this.type = file.split('.').pop();

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

    rl
      .on('line', (line) => {
        this.pushToQueue(line);
      })
      .on('end', () => {
        this.eof = true;
      });
  }

  initCsvFileReader() {
    this.stream
      .pipe(parse({ columns: true, delimiter: ';' }))
      .on('data', (row) => {
        const exportedLine = {
          date: new Date(row.datetime),
          log: {
            'geoip-latitude': row['geoip-latitude'],
            'geoip-longitude': row['geoip-longitude'],
            ezproxyName: row['bib-groups'].toUpperCase(),
            platform_name: row.platform_name,
            publication_title: row.publication_title,
            rtype: row.rtype,
            mime: row.mime,
          },
        };
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
      this.paarseQueue = new PaarseQueue(
        (data) => {
          const log = {
            date: new Date(data.datetime),
            log: data,
          };
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

export default SingleLogReader;
