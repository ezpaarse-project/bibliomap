/* eslint-disable import/extensions */
import { EventEmitter } from 'events';
import fs from 'fs';
import net from 'net';
import { startOfDay, endOfDay, addDays } from 'date-fns';
import { TZDate } from '@date-fns/tz';
import zlib from 'zlib';
import path from 'path';
import pino from 'pino';
import EventFileReader from './event_file_reader.js';

const logger = pino();

async function handleGzFile(stream) {
  return stream.pipe(zlib.createGunzip());
}

class Replay extends EventEmitter {
  constructor(replayStartTime, replayMultiplier, replayFiles, replayDuration, description) {
    super();
    this.replayStartDatetime = replayStartTime;
    this.replayMultiplier = replayMultiplier || 1;
    this.replayFiles = replayFiles;
    this.replayDuration = replayDuration;
    if (this.replayDuration < 1) this.replayDuration = 1;
    this.description = description;

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
        this.logReaders.push(new EventFileReader(baseFileName, stream));
      } else {
        this.logReaders.push(new EventFileReader(file, fs.createReadStream(file)));
      }
    }

    this.initInterval(1000 / this.replayMultiplier);

    return cb();
  }

  initTimer() {
    if (process.env.REPLAY_START_DATETIME) {
      this.dayStart = startOfDay(TZDate.tz('Europe/Paris', new Date(process.env.REPLAY_START_DATETIME))).getTime();
      this.dayEnd = endOfDay(addDays(TZDate.tz('Europe/Paris', new Date(process.env.REPLAY_START_DATETIME)), this.replayDuration - 1)).getTime();
      this.startTimerAt = new Date(process.env.REPLAY_START_DATETIME).getTime();
      this.timer = this.startTimerAt;
      this.loading = false; 
      this.emit('ready', null);
      return;
    }

    const firstLogDate = this.logReaders
      .reduce((acc, reader) => Math.min(acc, reader.firstLog.date.getTime()), Infinity);

    this.dayStart = startOfDay(TZDate.tz('Europe/Paris', firstLogDate)).getTime();
    this.dayEnd = endOfDay(addDays(TZDate.tz('Europe/Paris', firstLogDate), this.replayDuration - 1)).getTime();

    this.loading = false;

    this.startTimerAt = this.dayStart + (this.replayStartDatetime ? new Date(`1970-01-01T${this.replayStartDatetime}`).getTime() : 0);

    this.timer = this.startTimerAt;
    this.initSendTimerInterval();

    this.emit('ready', null);
  }

  updateTimer() {
    if (this.loading) {
      logger.debug('[debug] loading');
      return;
    }
    this.timer += 1000;
    logger.debug('[debug] timer:', new Date(this.timer));
  }

  initInterval(timeout) {
    return setInterval(() => {
      if (this.timer >= this.dayEnd) {
        this.emit('timerEnd');
        return;
      };

      this.updateTimer();

      this.logReaders = this.logReaders.filter((reader) => !reader.eof);

      if (this.loading) {
        if ((process.env.REPLAY_START_DATETIME)
        || this.logReaders.every((reader) => reader.firstLog)) {
          this.initTimer();
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

  initSendTimerInterval() {
    return setInterval(() => {
      this.emit('timeUpdate', this.timer);
    }, 10000);
  }
}

export default Replay;
