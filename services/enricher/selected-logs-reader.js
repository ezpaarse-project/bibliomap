import { EventEmitter } from 'events';
import fs from 'fs';
import net from 'net';
import readline from 'readline';
import config from 'config';
import { DateTime } from 'luxon';
import { parse } from 'csv-parse';
import zlib from 'zlib';
import path from 'path';

class SelectedLogsReader extends EventEmitter {
  constructor(options) {
    super();
    this.options = options;
    this.options.port = options?.port || 28777;
    this.timer; this.dayStart; this.dayEnd; this.startTimerAt;

    this.replayStartTime = process.env.REPLAY_START_TIME;
    this.replayMultiplier = process.env.REPLAY_MULTIPLIER || 1;
    this.replayFiles = (process.env.REPLAY_FILE_PATHS).split(',').map(p => path.join('./replay_files/', p));

    this.lineQueue = [];
    this.paarseQueue = [];
    this.gzQueue = [];

    this.streams = [];
    this.loading = true;

    this.readers = {
      'log': this.initLogFileReader,
      'csv': this.initCSVFileReader,
      'gz': this.initGZFileReader
    }
  }

  listen = async (cb) => {

    this.server = net.createServer();

    this.replayFiles.forEach(file => {
      this.streams[file] = this.readers[file.split('.').pop()].call(this, file);
    })

    this.initInterval(1000 / this.replayMultiplier)

    return cb();
  }

  initTimer(firstLogDate) {
    this.dayStart = DateTime.fromJSDate(new Date(firstLogDate.getTime()))
      .setZone('Europe/Paris')
      .startOf('day')
      .toMillis();

    this.dayEnd = DateTime.fromJSDate(new Date(firstLogDate.getTime()))
      .setZone('Europe/Paris')
      .endOf('day')
      .toMillis();

    this.loading = false;

    this.startTimerAt = this.dayStart + (this.replayStartTime ? new Date(`1970-01-01T${this.replayStartTime}`).getTime() : 0)

    this.timer = this.startTimerAt;
  }

  updateTimer() {
    if (this.loading) {
      console.log("[debug] loading");
      return;
    }
    this.timer += 1000;
    console.log("[debug] timer:", new Date(this.timer));
  }

  initInterval(timeout) {
    return setInterval(() => {

      if (this.timer >= this.dayEnd || this.gzQueue.length) return;

      if (this.loading) {

        const allItems = Object.values(this.lineQueue)
        .flat()
        .filter(item => item && item.date);

        if (allItems.length) {
          this.initTimer(
            allItems.reduce((a, b) =>
              a.date.getTime() < b.date.getTime() ? a : b
            ).date
          )
        }
        return;
      };

      this.updateTimer();

      this.replayFiles.forEach(file => {

        if (Math.max(this.lineQueue[file].length, this.paarseQueue[file].length) > 5) this.streams[file].pause();
        else this.streams[file].resume();

        if (!this.lineQueue[file].length) return;

        this.lineQueue[file] = this.lineQueue[file].sort((a, b) => a.date.getTime() - b.date.getTime());

        const line = this.lineQueue[file][0];
        
        if (line.date.getTime() < this.startTimerAt) return this.lineQueue[file].shift();

        if (line.date.getTime() <= this.timer) {
          console.log("[debug] line date:", line.date);
          this.parseLine(this.lineQueue[file].shift().log);
        }
      })

    }, timeout);
  }

  parseLine = (log) => {
    if (!log) return;
    this.emit('+exported_log', log.ezproxyName, 'bibliomap', 'info', log);
  }

  initLogFileReader(file) {

    this.lineQueue[file] = [];
    this.paarseQueue[file] = [];

    const logStream = fs.createReadStream(file, { encoding: 'utf-8', highWaterMark: 2048 });

    const rl = readline.createInterface({
      input: logStream,
    });

    rl.on('line', async (line) => {
      if (!line) return;
      this.paarseQueue[file].push(line);

      const response = await fetch(config.ezpaarse.url, {
        method: 'POST',
        headers: { //FIXME 2025-04-14 CANNOT SEEM TO USE THE HEADERS FROM THE CONFIG! HELP!!!
          Accept: 'application/jsonstream',
          'Double-Click-Removal': 'false',
          'crossref-enrich': 'false',
          'ezPAARSE-Predefined-Settings': 'bibliomap'
        },
        body: line
      });

      const responseText = await response.text();

      this.paarseQueue[file] = this.paarseQueue[file].filter(l => l !== line);

      if (!response.ok) {
        console.error("ERROR:", response.status, response.statusText);
      }

      else if (responseText) {
        const json = JSON.parse(responseText.trim());
        const date = new Date(json.datetime);
        if (date.getTime() < this.startTimerAt) return;
        const log = {
          'geoip-latitude': json['geoip-latitude'],
          'geoip-longitude': json['geoip-longitude'],
          ezproxyName: json['bib-groups'].toUpperCase(),
          platform_name: json.platform_name,
          rtype: json.rtype,
          mime: json.mime
        };
        this.lineQueue[file].push({ date: date, log: log, line: line });
      }
    });
    return logStream;
  }

  initCSVFileReader(file) {

    this.lineQueue[file] = [];
    this.paarseQueue[file] = [];

    return fs.createReadStream(file, { encoding: 'utf-8', highWaterMark: 2048 })
      .pipe(parse({ columns: true, delimiter: ';' }))
      .on('data', (row) => {
        if ((new Date(row.datetime)).getTime() < this.startTimerAt) return;
        this.lineQueue[file].push({
          date: new Date(row.datetime), log: {
            'geoip-latitude': row['geoip-latitude'],
            'geoip-longitude': row['geoip-longitude'],
            ezproxyName: row['bib-groups'].toUpperCase(),
            platform_name: row.platform_name,
            rtype: row.rtype,
            mime: row.mime
          }
        });
      })
  }

  initGZFileReader(file) {
    this.gzQueue.push(file);
    this.replayFiles = this.replayFiles.filter(f => f !== file);
    const input = fs.createReadStream(file);
    fs.mkdirSync('./extracted', { recursive: true });
    const outputPath = path.join('./extracted', path.basename(file, '.gz'))
    const output = fs.createWriteStream(outputPath);

    input.pipe(zlib.createGunzip())
      .pipe(output)
      .on('finish', () => {
        this.streams[outputPath] = this.readers[outputPath.split('.').pop()].call(this, outputPath);
        this.gzQueue = this.gzQueue.filter(p => p !== file);
        this.replayFiles.push(outputPath);
      });
  }
}

export default SelectedLogsReader;