import { parse } from 'csv-parse';
import readline from 'readline';
import PaarseQueue from './paarse_queue.js';

class SingleLogReader {
  constructor(file, stream) {
    this.file = file;
    this.stream = stream;
    this.type = file.split('.').pop();

    this.lineQueue = [];

    this.parsing = false;
    this.eof = false;

    this.initFileReader();
    this.initReaderInterval();
  }

  initFileReader() {
    const fileReaders = {
      log: this.initLogFileReader,
      csv: this.initCsvFileReader,
    };

    fileReaders[this.type].call(this);
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
            rtype: row.rtype,
            mime: row.mime,
          },
        };
        this.lineQueue.push(exportedLine);
        if (!this.firstLog) this.firstLog = exportedLine;
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
        },
        () => {
          this.paarseQueue = null;
        },
      );
    }
    this.paarseQueue.push(line);
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

  initReaderInterval() {
    const readerIntervals = {
      log: this.initLogReaderInterval,
      csv: this.initCsvReaderInterval,
    };

    this.interval = readerIntervals[this.type].call(this);
  }

  stopReaderOverload() {
    if (this.lineQueue.length > 5) {
      this.stream.pause();
    } else this.stream.resume();
  }

  initCsvReaderInterval() {
    return setInterval(() => {
      this.stopReaderOverload();
    }, 1000);
  }

  initLogReaderInterval() {
    return setInterval(() => {
      this.stopReaderOverload();
    }, 1000);
  }

  returnAllPassedLogs(date) {
    const passedLogs = this.lineQueue
      .filter((log) => log.date.getTime() <= date);

    this.lineQueue = this.lineQueue.filter((log) => log.date.getTime() > date);

    return passedLogs;
  }
}

export default SingleLogReader;
