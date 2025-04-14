import { EventEmitter } from 'events';
import fs from 'fs';
import net from 'net';
import readline from 'readline';
import request from 'request';
import { PassThrough } from 'stream';
import config from 'config';
import JSONStream from 'JSONStream';
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
    const streamName = 'INSB';

    this.server = net.createServer();

    const stream = fs.createReadStream(filePath, { encoding: 'utf-8', highWaterMark: 2048 });

    const rl = readline.createInterface({
      input: stream,
    });

    const lineQueue = [];
    let paarseQueue = [];
    let timer = 0;
    let firstLogDate;
    let loading = true;
    let dayStart; let dayEnd;

    const multiplier = 1;
    const baseTime = 1000;
    const startAtFirstLog = false;

    rl.on('line', async (line) => {
      if (line) {
        paarseQueue.push(line);

        if (Math.max(lineQueue.length, paarseQueue.length) > 2) stream.pause();
        else stream.resume();

        const response = await fetch(config.ezpaarse.url, {
          method: 'POST',
          headers: { // CANNOT SEEM TO USE THE HEADERS FROM THE CONFIG! HELP!!!
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
          if (!firstLogDate) firstLogDate = date;
          lineQueue.push({ date: date, line: line });
        }

        paarseQueue = paarseQueue.filter(l => l !== line);
      }
    });

    const interval = setInterval(() => {
      if (loading) console.log("[debug] loading");
      if (Math.max(lineQueue.length, paarseQueue.length) > 2) stream.pause();
      else stream.resume();
      if (!firstLogDate) return;

      if (loading) {

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

      timer += baseTime;
      console.log("[debug] timer:", new Date(timer));

      if (!lineQueue.length) return;
      const line = lineQueue[0];

      if (line.date.getTime() <= timer) {
        console.log("[debug] line date:", line.date);
        this.parseLine(lineQueue.shift().line, streamName);
      }
    }, baseTime / multiplier);

    return cb();
  }

  parseLine = (line, streamName) => {
    if (!line) return;
    this.emit('+log', streamName.toUpperCase(), 'bibliomap', 'info', line.trim());
  }
}

export default SelectedLogsReader;