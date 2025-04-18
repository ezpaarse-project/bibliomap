/* eslint-disable import/extensions */
import config from 'config';
import LogIoListener from 'log.io-server-parser';
import net from 'net';
import SelectedLogsReader from './selected-logs-reader.js';
import util from 'util';

console.log('HEADERS:\n', util.inspect(config.ezpaarse.headers));

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

let cooldown = false;

logIoListener.on('+log', async (streamName, node, type, log) => {
  console.log('+log');
  if (cooldown) return;

  let response;

  try {
    response = await fetch(config.ezpaarse.url, {
      method: 'POST',
      headers: { // FIXME 2025-04-14 CANNOT SEEM TO USE THE HEADERS FROM THE CONFIG! HELP!!!
        Accept: 'application/jsonstream',
        'Double-Click-Removal': 'false',
        'crossref-enrich': 'false',
        'ezPAARSE-Predefined-Settings': 'bibliomap',
      },
      body: log,
    });
  } catch (err) {
    console.error(err);
    cooldown = true;
    setTimeout(() => { cooldown = false; }, 1000);
    return;
  }

  const text = await response.text();

  if (!text) return;

  const json = JSON.parse(text);

  const ec = {
    'geoip-latitude': json['geoip-latitude'],
    'geoip-longitude': json['geoip-longitude'],
    ezproxyName: streamName,
    platform_name: json.platform_name,
    rtype: json.rtype,
    mime: json.mime,
  };

  if (!Object.values(ec).reduce((a, b) => a && b, true)) return;

  viewer.write(`${JSON.stringify(ec)}\n`);
});

logIoListener.on('+exported_log', (streamName, node, type, log) => {
  viewer.write(`${JSON.stringify(log)}\n`);
});
