import fs from 'fs';
import path from 'path';
import Replay from './replay.js';
import { EventEmitter, once } from 'events';
import net from 'net';


function getDirectories(srcPath) {
  return fs.readdirSync(srcPath)
    .map(name => path.join(srcPath, name))
    .filter(fullPath => fs.statSync(fullPath).isDirectory());
}

function getLogFiles(srcPath) {
  return fs.readdirSync(srcPath)
    .map(name => path.join(srcPath, name))
    .filter(fullPath => fs.statSync(fullPath).isFile())
    .filter(fullPath => path.extname(fullPath) !== '.json');
}

function loadConfigJson(dirPath) {
  const configPath = path.join(dirPath, 'config.json');
  if (!(fs.existsSync(configPath) && fs.statSync(configPath).isFile())) {
    return {};
  }
  const rawData = fs.readFileSync(configPath, 'utf-8');
  const json = JSON.parse(rawData);
  if (json.disable) return null;
  return json;
}

export default class ReplayManager extends EventEmitter {
  constructor () {
    super();
    this.replays = [];
    const replayDirs = getDirectories('./data/replay_files/');
    replayDirs.forEach(dir => {
      const config = loadConfigJson(dir);
      if (!config) return;
      this.replays.push(
        new Replay(
          config.replayStartTime,
          config.replayMultiplier,
          getLogFiles(dir),
          config.replayDuration,
          config.description
        )
      );
    });
  }

  async listen(cb) {
    this.server = net.createServer();

    for (const replay of this.replays) {
      replay.listen(cb);

      this.on('isReady', (socketId) => {
      if (!replay.loading) this.emit('ready', socketId);
    });

      this.on('configRequest', (socketId) => {
        this.emit('configResponse', socketId, replay.timer, replay.startTimerAt, replay.dayEnd, replay.replayMultiplier, replay.description);
      });

      replay.on('configResponse', (socketId, timer, startTimerAt, dayEnd, replayMultiplier, description) => {
        this.emit('configResponse', socketId, timer, startTimerAt, dayEnd, replayMultiplier, description);
      });

      replay.on('timeUpdate', (time) => {
        this.emit('timeUpdate', time);
      });

      replay.on('+exported_log', (ezproxyName, logType, logLevel, log) => {
        this.emit('+exported_log', ezproxyName, logType, logLevel, log);
      });

      await once(replay, 'timerEnd');
    }
    return cb();
  }
}