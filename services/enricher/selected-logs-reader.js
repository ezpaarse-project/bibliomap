import { EventEmitter } from 'events';
import fs from 'fs';
import net from 'net';
import readline from 'readline';
import config from 'config';
import { DateTime } from 'luxon';

class SelectedLogsReader extends EventEmitter {
  constructor(options) {
    super();
    this.options = options;
    this.options.port = options?.port || 28777;
    this.timer; this.dayStart; this.dayEnd;

    // TODO: replace with env variables
    this.startAtFirstLog = true;
    this.multiplier = 4;
    this.filePath = './examples/insb.log';
    this.lineQueue = [];
    this.paarseQueue = [];

    this.stream;
    this.loading = true;
  }

  listen = async (cb) => {
    // Path.resolve __dirname

    this.server = net.createServer();

    this.initLogFileReader();

    this.initInterval(1000 / this.multiplier)

    return cb();
  }

  initPlayer(firstLogDate) {
    this.dayStart = DateTime.fromJSDate(new Date(firstLogDate.getTime()))
      .setZone('Europe/Paris')
      .startOf('day')
      .toMillis();

    this.dayEnd = DateTime.fromJSDate(new Date(firstLogDate.getTime()))
      .setZone('Europe/Paris')
      .endOf('day')
      .toMillis();

    this.loading = false;
    this.timer = firstLogDate.getTime();
    if (!this.startAtFirstLog) {
      this.timer = dayStart;
    }
  }

  initInterval(timeout) {
    return setInterval(() => {
      if (this.timer >= this.dayEnd) return;
      if (Math.max(this.lineQueue.length, this.paarseQueue.length) > 2) this.stream.pause();
      else this.stream.resume();
      if (this.loading) {
        console.log("[debug] loading");
        return;
      }

      this.timer += 1000;
      console.log("[debug] timer:", new Date(this.timer));

      if (!this.lineQueue.length) return;
      const line = this.lineQueue[0];

      if (line.date.getTime() <= this.timer) {
        console.log("[debug] line date:", line.date);
        this.parseLine(this.lineQueue.shift().log);
      }
    }, timeout);
  }

  parseLine = (log) => {
    if (!log) return;
    this.emit('+exported_log', log.ezproxyName, 'bibliomap', 'info', log);
  }

  initLogFileReader(){
    this.stream = fs.createReadStream(this.filePath, { encoding: 'utf-8', highWaterMark: 2048 });

    const rl = readline.createInterface({
      input: this.stream,
    });
    this.timer = 0;

    rl.on('line', async (line) => {
      if (!line) return;
      this.paarseQueue.push(line);

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

      if (!response.ok) {
        console.error("ERROR:", response.status, response.statusText);
      }

      else if (responseText) {
        const json = JSON.parse(responseText.trim());
        const date = new Date(json.datetime);
        const log = {
          'geoip-latitude': json['geoip-latitude'],
          'geoip-longitude': json['geoip-longitude'],
          ezproxyName: json['bib-groups'].toUpperCase(),
          platform_name: json.platform_name,
          rtype: json.rtype,
          mime: json.mime
        };
        if (this.loading) this.initPlayer(date);
        this.lineQueue.push({ date: date, log: log, line: line });
      }

      this.paarseQueue = this.paarseQueue.filter(l => l !== line);
    });
  }
  
}

export default SelectedLogsReader;