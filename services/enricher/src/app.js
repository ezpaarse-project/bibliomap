/* eslint-disable import/extensions */
import config from 'config';
import LogIoListener from 'log.io-server-parser';
import pino from 'pino';
import http from 'http';
import { Server } from 'socket.io';
import SelectedLogsReader from './selected-logs-reader.js';
import PaarseQueue from './paarse-queue.js';

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
logger.debug('config:', config.listen.harvester);

const logIoListener = process.env.REPLAY_MODE
  ? new SelectedLogsReader(config.listen.harvester)
  : new LogIoListener(config.listen.harvester);

logIoListener.listen(() => {
  logger.info(`Waiting for harvester at ${JSON.stringify(config.listen.harvester)}`);
});

logIoListener.server.on('connection', (logListenerSocket) => {
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

    viewerSocket.on('getTime', () => {
      logIoListener.emit('timeRequest', socketId);
    });
  });
});

const queues = {};

function randomizePos(log) {
  const randomizedLog = log;
  randomizedLog['geoip-latitude'] = parseFloat(log['geoip-latitude']) + 0.4 * (Math.random() - 0.5);
  randomizedLog['geoip-longitude'] = parseFloat(log['geoip-longitude']) + 0.4 * (Math.random() - 0.5);
  return randomizedLog;
}

logIoListener.on('+log', async (streamName, node, type, log) => {
  if (!queues[streamName]) {
    queues[streamName] = new PaarseQueue(
      (data) => {
        const ec = {
          'geoip-latitude': data['geoip-latitude'],
          'geoip-longitude': data['geoip-longitude'],
          ezproxyName: streamName,
          platform_name: data.platform_name,
          publication_title: data.publication_title,
          rtype: data.rtype,
          mime: data.mime,
        };

        if (!Object.values(ec).reduce((a, b) => a && b, true)) return;

        if (viewers && viewers.size) [...viewers].map((s) => s.emit('log', randomizePos(ec)));
      },
      () => {
        queues[streamName] = null;
      },
    );
  }
  queues[streamName].push(log);
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

logIoListener.on('timeResponse', (socketId, timer, start, end, multiplier) => {
  const socket = [...viewers].filter((s) => s.id === socketId);
  if (socket) io.to(socket).emit('timeResponse', timer, start, end, multiplier);
});
