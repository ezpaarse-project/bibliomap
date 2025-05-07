/* eslint-disable import/extensions */
import { EventEmitter } from 'events';
import fs from 'fs';
import net from 'net';
import { startOfDay, endOfDay, addDays } from 'date-fns';
import { TZDate } from '@date-fns/tz';
import zlib from 'zlib';
import path from 'path';
import pino from 'pino';
import SingleLogReader from './single-logs-reader.js';

const logger = pino();

async function handleGzFile(stream) {
  return stream.pipe(zlib.createGunzip());
}

class SelectedLogsReader extends EventEmitter {
  constructor(options) {
    super();
    this.options = options;
    this.options.port = options?.port || 28777;

    this.replayStartTime = process.env.REPLAY_START_TIME;
    this.replayMultiplier = process.env.REPLAY_MULTIPLIER || 1;
    this.replayFiles = (process.env.REPLAY_FILE_PATHS).split(',').map((p) => path.join('./data/replay_files/', p));
    this.duration = process.env.REPLAY_DURATION || 1;
    if (this.duration < 1) this.duration = 1;

    this.loading = true;

    this.logReaders = [];
  }

  async listen(cb) {
    this.server = net.createServer();

    for (const file of this.replayFiles) {
      const ext = file.split('.').pop();
      if (ext === 'gz') {
        const baseFileName = file.split('.').slice(0, -1).join('.');
        const stream = await handleGzFile(fs.createReadStream(file));
        this.logReaders.push(new SingleLogReader(baseFileName, stream));
      } else {
        this.logReaders.push(new SingleLogReader(file, fs.createReadStream(file)));
      }
    }

    this.initInterval(1000 / this.replayMultiplier);

    this.on('isReady', (socketId) => {
      if (!this.loading) this.emit('ready', socketId);
    });

    this.on('timeRequest', (socketId) => {
      this.emit('timeResponse', socketId, this.timer, this.startTimerAt, this.dayEnd, this.replayMultiplier);
    });

    return cb();
  }

  initTimer(firstLogDate) {
    this.dayStart = startOfDay(TZDate.tz('Europe/Paris', firstLogDate)).getTime();
    this.dayEnd = endOfDay(addDays(TZDate.tz('Europe/Paris', firstLogDate), this.duration - 1)).getTime();

    this.loading = false;

    this.startTimerAt = this.dayStart + (this.replayStartTime ? new Date(`1970-01-01T${this.replayStartTime}`).getTime() : 0);

    this.timer = this.startTimerAt;

    this.emit('ready', null);
  }

  updateTimer() {
    if (this.loading) {
      logger.debug('[debug] loading');
      return;
    }
    this.timer += 1000;
    logger.debug('[debug] timer:', new Date(this.timer));
    this.emit('timeUpdate', new Date(this.timer));
  }

  initInterval(timeout) {
    return setInterval(() => {
      if (this.timer >= this.dayEnd) return;

      this.updateTimer();

      this.logReaders = this.logReaders.filter((reader) => !reader.eof);

      if (this.loading) {
        if (this.logReaders.every((reader) => reader.firstLog)) {
          this.initTimer(this.logReaders
            .reduce((acc, reader) => Math.min(acc, reader.firstLog.date.getTime()), Infinity));
        } else return;
      }

      this.logReaders
        .flatMap((reader) => reader.returnAllPassedLogs(this.timer))
        .filter((log) => log.date.getTime() >= this.startTimerAt)
        .map((log) => this.parseLine(log.log));
    }, timeout);
  }

  parseLine(log) {
    if (!log) return;
    this.emit('+exported_log', log.ezproxyName, 'bibliomap', 'info', log);
  }
}

export default SelectedLogsReader;
