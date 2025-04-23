import config from 'config';
import { parse } from 'csv-parse';
import readline from 'readline';

class SingleLogReader {
  constructor(file, stream) {
    this.file = file;
    this.stream = stream;
    this.type = file.split('.').pop();

    this.lineQueue = [];
    this.paarseQueue = [];

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

  initLogFileReader() {
    const rl = readline.createInterface({
      input: this.stream,
    });

    rl
      .on('line', (line) => {
        this.paarseQueue.push(line);
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
    if (Math.max(this.lineQueue.length, this.paarseQueue.length) > 5) {
      this.stream.pause();
    } else this.stream.resume();
  }

  initCsvReaderInterval() {
    return setInterval(() => {
      this.stopReaderOverload();
    }, 1000);
  }

  initLogReaderInterval() {
    return setInterval(async () => {
      this.stopReaderOverload();

      if (this.parsing) return;

      this.parsing = true;

      const currentLine = this.paarseQueue[0];
      console.log('sending line', currentLine);
      let response;

      try {
        response = await fetch(config.ezpaarse.url, {
          method: 'POST',
          headers: { // FIXME 2025-04-14 CANNOT SEEM TO USE THE HEADERS FROM THE CONFIG! HELP!!!
            Accept: 'application/jsonstream',
            'Double-Click-Removal': 'false',
            'crossref-enrich': 'false',
            'ezPAARSE-Predefined-Settings': 'bibliomap',
          },
          body: currentLine,
        });
      } catch (err) {
        console.error('[ezPAARSE] Cannot send line to ezPAARSE');
        console.error(err);
        return;
      } finally {
        this.paarseQueue.shift();
        this.parsing = false;
      }

      const responseText = await response.text();

      if (!response.ok) {
        console.error('ERROR:', response.status, response.statusText);
      } else if (responseText) {
        const json = JSON.parse(responseText.trim());
        const logDate = new Date(json.datetime);
        const exportedLine = {
          'geoip-latitude': json['geoip-latitude'],
          'geoip-longitude': json['geoip-longitude'],
          ezproxyName: json['bib-groups'].toUpperCase(),
          platform_name: json.platform_name,
          rtype: json.rtype,
          mime: json.mime,
        };
        const log = { date: logDate, log: exportedLine, line: currentLine };
        this.lineQueue.push(log);
        if (!this.firstLog) this.firstLog = log;
      }
    }, 250);
  }

  returnAllPassedLogs(date) {
    const passedLogs = this.lineQueue
      .filter((log) => log.date.getTime() <= date);

    this.lineQueue = this.lineQueue.filter((log) => log.date.getTime() > date);

    return passedLogs;
  }
}

export default SingleLogReader;
