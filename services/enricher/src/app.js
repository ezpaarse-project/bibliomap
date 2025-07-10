/* eslint-disable import/extensions */
import LogIoListener from 'log.io-server-parser';
import pino from 'pino';
import http from 'http';
import { Server } from 'socket.io';
import PaarseQueue from './paarse-queue.js';
import ReplayManager from './replay-manager.js';

const logger = pino();

/**
 * Connect to bibliomap-viewer
 */

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Websocket server launched');
});

const io = new Server(server, {
  cors: {
    origin: '*', // TO CHANGE
    methods: ['GET', 'POST'],
  },
});

server.listen(process.env.WEBSOCKET_PORT, () => {
  logger.info(`Websocket server is running on port ${process.env.WEBSOCKET_PORT}`);
});

const viewers = new Set();

/**
 * Listen events coming from harvester
 * then forward it to ezpaarse jobs
 */

const harvesterConfig = {
  host: process.env.HARVESTER_URL.split(':')[0],
  port: process.env.HARVESTER_URL.split(':')[1],
};

const logIoListener = process.env.REPLAY_MODE === 'true'
  ? new ReplayManager()
  : new LogIoListener(harvesterConfig);

logIoListener.listen(() => {
  if (process.env.REPLAY_MODE !== 'true') logger.info(`Waiting for harvester at ${JSON.stringify(harvesterConfig)}`);
  else logger.info('Replay sessions starting');
});

if (process.env.REPLAY_MODE !== 'true') logIoListener.server.on('connection', (logListenerSocket) => {
  logger.info('Harvester connected');

  logListenerSocket.on('close', () => {
    logger.info('Harvester disconnected');
  });
});

io.on('connection', (viewerSocket) => {
  logger.info('Viewer connected');
  viewers.add(viewerSocket);

  viewerSocket.on('disconnect', () => {
    logger.info('Viewer disconnected');
    viewers.delete(viewerSocket);
  });

  viewerSocket.on('isReady', (socketId) => {
    logIoListener.emit('isReady', socketId);
  });

  viewerSocket.on('replayConfigRequest', (socketId) => {
    logIoListener.emit('replayConfigRequest', socketId);
  });
});

function randomizePos(log) {
  const randomizedLog = log;
  randomizedLog['geoip-latitude'] = parseFloat(log['geoip-latitude']) + 0.4 * (Math.random() - 0.5);
  randomizedLog['geoip-longitude'] = parseFloat(log['geoip-longitude']) + 0.4 * (Math.random() - 0.5);
  return randomizedLog;
}

let paarseQueue;

logIoListener.on('+log', async (streamName, node, type, log) => {
  if (!paarseQueue) {
    paarseQueue = new PaarseQueue(
      (data) => {
        if (viewers && viewers.size) [...viewers].map((s) => s.emit('log', randomizePos(data)));
      },
      () => {
        paarseQueue = null;
      },
    );
  }
  paarseQueue.push(log);
});

logIoListener.on('+exported_log', (streamName, node, type, log) => {
  if (viewers && viewers.size) [...viewers].map((s) => s.emit('log', randomizePos(log)));
});

logIoListener.on('ready', (socketId) => {
  if (!socketId) {
    io.emit('ready');
    return;
  }
  const socket = [...viewers].filter((s) => s.id === socketId);
  if (socket) io.to(socket).emit('ready');
});

logIoListener.on('timeUpdate', (time) => io.emit('timeUpdate', time));

logIoListener.on('replayConfig', (socketId, replayConfig) => {
  if(!socketId) {
    return io.emit('replayConfig', replayConfig);
  }
  const socket = [...viewers].find((s) => s.id === socketId);
  if (socket) {
    socket.emit('replayConfig', replayConfig);
  } else {
    console.warn(`Socket with ID ${socketId} not found in viewers set`);
  }
});