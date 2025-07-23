/* eslint-disable import/extensions */
import { EventEmitter } from 'events';
import fs from 'fs';
import net from 'net';
import DateFns from 'date-fns';
import { TZDate } from '@date-fns/tz';
import zlib from 'zlib';
import logger from './lib/logger.js';
import EventFileReader from './event_file_reader.js';
class Replay extends EventEmitter {
  constructor(replayStartTime, replayEndTime, replayMultiplier, replayFiles, replayDuration, description) {
    super();
    this.replayStartDatetime = replayStartTime;
    this.replayMultiplier = replayMultiplier || 1;
    this.replayEndTime = replayEndTime;
    this.replayFiles = replayFiles;
    this.replayDuration = replayDuration;
    if (this.replayDuration < 1) this.replayDuration = 1;
    this.description = description;

    this.loading = true;

    this.logReaders = [];
  }

  async listen(cb) {
    this.server = net.createServer();
    for (const filename of this.replayFiles) {
      const ext = path.extname(file);
      if (ext === 'gz') {
        const baseFileName = filename.slice(0, -3);
        const stream = await stream.pipe(zlib.createGunzip());
        this.logReaders.push(new EventFileReader(baseFileName, stream));
      } else {
        this.logReaders.push(new EventFileReader(filename, fs.createReadStream(filename)));
      }
    }

    this.initInterval(1000 / this.replayMultiplier);

    return cb();
  }
  setReplayConfig(timerStartTime, timerEndTime) {
    this.timerStartTime = new Date(timerStartTime).getTime();
    this.timerEndTime = new Date(timerEndTime).getTime();
    this.timer = this.timerStartTime;
    this.loading = false;
    this.initSendTimerInterval();
    this.emit('ready', null);
  }

  initTimer() {
    if (this.replayStartDatetime) {
      if (this.replayEndTime && this.replayStartDatetime < this.replayEndTime) return this.setReplayConfig(this.replayStartDatetime, this.replayEndTime);
      const endOfDay = DateFns.endOfDay(DateFns.addDays(TZDate.tz('Europe/Paris', new Date(this.replayStartDatetime)), this.replayDuration - 1)).getTime();
      this.setReplayConfig(this.replayStartDatetime, endOfDay);
      return;
    }

    const firstLogDate = this.logReaders
      .reduce((acc, reader) => Math.min(acc, reader.firstLog.date.getTime()), Infinity);
    const endOfDay = DateFns.endOfDay(DateFns.addDays(TZDate.tz('Europe/Paris', firstLogDate), this.replayDuration - 1)).getTime();
    const timerStartTime = this.dayStart + (this.replayStartDatetime ? new Date(`1970-01-01T${this.replayStartDatetime}`).getTime() : 0);

    this.setReplayConfig(timerStartTime, endOfDay);
  }

  updateTimer() {
    if (this.loading) {
      logger.debug('loading');
      return;
    }
    this.timer += 1000;
    logger.debug('timer:', new Date(this.timer));
  }

  initInterval(timeout) {
    return setInterval(() => {
      if (this.timer >= this.timerEndTime) {
        this.emit('timerEnd');
        return;
      };

      this.updateTimer();

      this.logReaders = this.logReaders.filter((reader) => !reader.eof);

      if (this.loading) {
        if ((this.replayStartDatetime) || this.logReaders.every((reader) => reader.firstLog)) {
          this.initTimer();
        } else { return; }
      }

      this.logReaders
        .flatMap((reader) => reader.returnAllPassedLogs(this.timer))
        .filter((log) => log.date.getTime() >= this.timerStartTime)
        .map((log) => this.parseLine(log.log));
    }, timeout);
  }

  parseLine(log) {
    if (!log) return;
    this.emit('+exported_log', log.ezproxyName, 'bibliomap', 'info', log);
  }

  initSendTimerInterval() {
  const intervalId = setInterval(() => {
    if (this.timer > this.timerEndTime) {
      this.emit('timeUpdate', this.timer);
    } else {
      clearInterval(intervalId);
    }
  }, 10000);

  return intervalId;
}
}

export default Replay;
