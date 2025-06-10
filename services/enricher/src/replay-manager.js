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
  constructor() {
    super();
    this.replayDirs = getDirectories('./data/replay_files/');
  }

  async listen(cb) {
    this.server = net.createServer();
    let replay;

    this.on('isReady', (socketId) => {
      if (!replay) return;
      if (!replay.loading) this.emit('ready', socketId);
    });

    this.on('replayConfigRequest', (socketId) => {
      if (!replay) return;
      this.emit('replayConfig', socketId,
        {
          replayStartDatetime: replay.startTimerAt,
          replayEndDatetime: replay.endTimerAt,
          replayMultiplier: replay.replayMultiplier,
          replayDuration: replay.replayDuration,
          description: replay.description,
          timerStart: replay.startTimerAt
        }
      );
      this.emit('timeUpdate', replay.timer);
    });

    try {
      while (true) {
        const replays = this.getReplayObjectsFromDirs();

        for (replay of replays) {
          replay.listen(cb);
          await once(replay, 'ready');
          this.emit('replayConfig', null,
            {
              replayStartDatetime: replay.startTimerAt,
              replayEndDatetime: replay.endTimerAt,
              replayMultiplier: replay.replayMultiplier,
              replayDuration: replay.replayDuration,
              description: replay.description,
              timerStart: replay.startTimerAt
            }
          );

          replay.on('timeUpdate', (time) => {
            this.emit('timeUpdate', time);
          });

          replay.on('+exported_log', (ezproxyName, logType, logLevel, log) => {
            this.emit('+exported_log', ezproxyName, logType, logLevel, log);
          });

          await once(replay, 'timerEnd');
        }
      }
    }
    catch (err) {
      console.error(err);
    }
    finally {
      return cb();
    }
  }

  getReplayObjectsFromDirs() {
    const replays = [];
    this.replayDirs
      .filter(r => loadConfigJson(r) != null && loadConfigJson(r).disable !== false)
      .sort((a, b) => loadConfigJson(a).replayStartDatetime - loadConfigJson(b).replayStartDatetime)
      .forEach(dir => {
        const config = loadConfigJson(dir);
        if (!config) return;
        replays.push(
          new Replay(
            config.replayStartDatetime,
            config.replayEndDatetime,
            config.replayMultiplier,
            getLogFiles(dir),
            config.replayDuration,
            config.description
          )
        );
      });
    return replays;
  }
}