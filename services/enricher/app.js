/* eslint-disable import/extensions */
import config from 'config';
import LogIoListener from 'log.io-server-parser';
import net from 'net';
import SelectedLogsReader from './selected-logs-reader.js';
import PaarseQueue from './paarse_queue.js';

const viewerConfig = config.broadcast.viewer;
const viewerUrl = `${viewerConfig.host}: ${viewerConfig.port}`;

/**
 * Connect to bibliomap-viewer
 */
console.log(`Connecting to viewer at ${viewerUrl}`);
const viewer = net.createConnection(viewerConfig);

viewer.on('connect', () => {
  console.log('Viewer connected');
  viewer.connected = true;
});

viewer.on('error', (err) => {
  console.log(`Viewer connection got error: ${err}`);
});

viewer.on('close', () => {
  console.log(`Viewer disconnected, reconnecting in ${config.autoConnectDelay}ms`);
  viewer.connected = false;

  setTimeout(() => {
    viewer.connect(viewerConfig);
  }, config.autoConnectDelay);
});

/**
 * Listen events coming from harvester
 * then forward it to ezpaarse jobs
 */
console.log('config:', config.listen.harvester);

const logIoListener = process.env.REPLAY_MODE
  ? new SelectedLogsReader(config.listen.harvester)
  : new LogIoListener(config.listen.harvester);

logIoListener.listen(() => {
  console.log(`Waiting for harvester at ${JSON.stringify(config.listen.harvester)}`);
});

logIoListener.server.on('connection', (socket) => {
  console.log('Harvester connected');

  socket.on('close', () => {
    console.log('Harvester disconnected');
  });
});

const queues = {};

logIoListener.on('+log', async (streamName, node, type, log) => {
  if (!queues[streamName]) {
    queues[streamName] = new PaarseQueue(
      (data) => {
        const ec = {
          'geoip-latitude': data['geoip-latitude'],
          'geoip-longitude': data['geoip-longitude'],
          ezproxyName: streamName,
          platform_name: data.platform_name,
          rtype: data.rtype,
          mime: data.mime,
        };

        if (!Object.values(ec).reduce((a, b) => a && b, true)) return;

        viewer.write(`${JSON.stringify(ec)}\n`);
      },
      () => {
        queues[streamName] = null;
      },
    );
  }
  queues[streamName].push(log);
});

logIoListener.on('+exported_log', (streamName, node, type, log) => {
  viewer.write(`${JSON.stringify(log)}\n`);
});
