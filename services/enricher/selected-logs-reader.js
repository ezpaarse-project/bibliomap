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
  }

  listen = async (cb) => {
    // Path.resolve __dirname
    const filePath = './examples/insb.log';

    this.server = net.createServer();

    const stream = fs.createReadStream(filePath, { encoding: 'utf-8', highWaterMark: 2048 });

    const rl = readline.createInterface({
      input: stream,
    });

    const lineQueue = [];
    let paarseQueue = [];
    let timer = 0;
    let loading = true;
    let dayStart; let dayEnd;

    // To replace with env variables
    const multiplier = 4;
    const baseTime = 1000;
    const startAtFirstLog = true;

    rl.on('line', async (line) => {
      if (!line) return;
      paarseQueue.push(line);

      if (Math.max(lineQueue.length, paarseQueue.length) > 2) stream.pause();
      else stream.resume();

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
        if (loading) initPlayer(date);
        lineQueue.push({ date: date, log: log, line: line });
      }

      paarseQueue = paarseQueue.filter(l => l !== line);
    });

    function initPlayer(firstLogDate) {
      dayStart = DateTime.fromJSDate(new Date(firstLogDate.getTime()))
        .setZone('Europe/Paris')
        .startOf('day')
        .toMillis();

      dayEnd = DateTime.fromJSDate(new Date(firstLogDate.getTime()))
        .setZone('Europe/Paris')
        .endOf('day')
        .toMillis();

      loading = false;
      timer = firstLogDate.getTime();
      if (!startAtFirstLog) {
        timer = dayStart;
      }
    }

    const interval = setInterval(() => {
      if (timer >= dayEnd) return;
      if (Math.max(lineQueue.length, paarseQueue.length) > 2) stream.pause();
      else stream.resume();
      if (loading) return console.log("[debug] loading");

      timer += baseTime;
      console.log("[debug] timer:", new Date(timer));

      if (!lineQueue.length) return;
      const line = lineQueue[0];

      if (line.date.getTime() <= timer) {
        console.log("[debug] line date:", line.date);
        this.parseLine(lineQueue.shift().log);
        // this.parseNonexportedLine(lineQueue.shift().line);
      }
    }, baseTime / multiplier);

    return cb();
  }

  parseLine = (log) => {
    if (!log) return;
    this.emit('+exported_log', log.ezproxyName, 'bibliomap', 'info', log);
  }

  parseNonexportedLine = (line) => {
    if (!line) return;
    this.emit('+log', 'INSB', 'bibliomap', 'info', line);
  }
}

export default SelectedLogsReader;