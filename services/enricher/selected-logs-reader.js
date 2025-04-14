import { EventEmitter } from 'events';
import fs from 'fs';
import net from 'net';
import readline from 'readline';
import request from 'request';
import { PassThrough } from 'stream';
import config from 'config';
import JSONStream from 'JSONStream';

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

    this.emit('+node', '', streamName);

    const stream = fs.createReadStream(filePath, { encoding: 'utf-8', highWaterMark: 2048 });

    const rl = readline.createInterface({
      input: stream,
      output: process.stdout,
      terminal: false
    });

    const lineQueue = [];
    let paarseQueue = [];
    let timer = 0;
    let firstLogTime;

    const multiplier = 1;
    const baseTime = 1000;

    rl.on('line', async (line) => {
      if (line) {
        //console.log("LINE:", line);

        paarseQueue.push(line);

        if (Math.max(lineQueue.length, paarseQueue.length) > 2) stream.pause();
        else stream.resume();
        
        const response = await fetch(config.ezpaarse.url, {
          method: 'POST',
          headers: {
            "Accept": "application/jsonstream",
            "Double-Click-Removal": "false",
            "crossref-enrich": "false",
            "ezPAARSE-Buffer-Size": 0,
            "ezPAARSE-Predefined-Settings": "00-fr-bibcnrs"
          },
          body: line
        });

        const responseText = await response.text();

        if(!response.ok) {
          console.log("ERROR:", response.status, response.statusText);
        }

        else if(responseText) {
          const json = JSON.parse(responseText.trim());
          const date = new Date(json.datetime);
          if(!firstLogTime) firstLogTime = date;
          lineQueue.push({date: date, line: line});
          console.log("DATE AND LINE:", {date: date, line: line})
        }

        paarseQueue = paarseQueue.filter(l => l !== line);
      }
    })

    const interval = setInterval(() => {
      timer += baseTime * multiplier;
      if(Math.max(lineQueue.length, paarseQueue.length) > 2) stream.pause();
      else stream.resume();
      if (lineQueue.length > 1) {
        
        const line = lineQueue[0];
        if (line.date.getTime() - firstLogTime.getTime() < timer) {
          console.log("Line date:", line.date, "first log date:", firstLogTime, "difference:", line.date.getTime() - firstLogTime.getTime(), "timer:", timer);
          this.parseLine(lineQueue.shift().line, streamName);
        }
        
      }
    }, baseTime / multiplier);

    return cb();
  }

  /*
  *  line: [+log, streamName, node, type, log ("140.93.9.33 BKmQCaWyWCHfASb - anonymous@cnrs.fr_O_CNRS_I_DS61_OU_UMR0000 [21/Nov/2016:16:59:53 +0000] "GET http://ac.els-cdn.com:80/S0025540816301830/1-s2.0-S0025540816301830-main.pdf?_tid=eb7585fc-b00b-11e6-9bb6-00000aacb362&acdnat=1479747772_050f425fa2f4909faefe714448bd2ed6 HTTP/1.1" 206 606834 ins2i")]
  *  +log: new bubble
  */
  parseLine = (line, streamName) => {
    if(!line) return;
    this.emit('+log', streamName.toUpperCase(), 'bibliomap', 'info', line.trim());
  }
}

export default SelectedLogsReader;