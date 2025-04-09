// log.io protocol example
// +log biblioinserm bibliomap info 16.2.255.24 - 13BBIU1158 [01/Aug/2013:16:56:36 +0100] "GET http://onlinelibrary.wiley.com:80/doi/10.1111/dme.12357/pdf HTTP/1.1" 200 13639
'use strict';

// Increase max concurrent connections (defaults to 5)
require('http').globalAgent.maxSockets = 20;
const EnrichedCsvReader = require('./enriched-csv-reader');

const config = require('config');
const LogIoListener = require('log.io-server-parser');
const request = require('request').defaults({ proxy: null });
const PassThrough = require('stream').PassThrough;
const JSONStream = require('JSONStream');
const net = require('net');
const debug = require('debug')('bibliomap-enricher');

const ezpaarseJobs = new Map();
const viewerConfig = config.broadcast['bibliomap-viewer'];
const viewerUrl = `${viewerConfig.host}: ${viewerConfig.port}`;
const broadcastedFields = config.broadcast.fields;

/**
 * Connect to bibliomap-viewer
 */
printLog(`Connecting to viewer at ${viewerUrl}`);
const viewer = net.createConnection(viewerConfig);

viewer.on('connect', () => {
  printLog('Viewer connected');
  viewer.connected = true;
});

viewer.on('error', err => {
  printLog(`Viewer connection got error: ${err}`);
});

viewer.on('close', () => {
  printLog(`Viewer disconnected, reconnecting in ${config.autoConnectDelay}ms`);
  viewer.connected = false;

  setTimeout(() => {
    viewer.connect(viewerConfig);
  }, config.autoConnectDelay);
});

/**
 * Listen events coming from bibliomap-harvester
 * then forward it to ezpaarse jobs
 */

console.log("EnrichedCsvReader:", EnrichedCsvReader);
const logIoListener = new EnrichedCsvReader(config.listen['bibliomap-harvester']) // new LogIoListener(config.listen['bibliomap-harvester']);
//const logIoListener = new LogIoListener(config.listen['bibliomap-harvester']);

logIoListener.listen(() => {
  printLog(`Waiting for harvester at ${JSON.stringify(config.listen['bibliomap-harvester'])}`);
});

logIoListener.server.on('connection', socket => {
  printLog('Harvester connected');

  socket.on('close', () => {
    printLog('Harvester disconnected');
  });
});

logIoListener.on('+node', (node, streams) => {
  // Create one ezPAARSE job for each stream
  streams.forEach(createJob);
});

logIoListener.on('+log', (streamName, node, type, log) => {
  const job = ezpaarseJobs.get(streamName);

  if (job) {
    job.writeStream.write(`${log}\n`);
  }
});

/**
 * Create the ezpaarse jobs and respawn
 * crashed or terminated jobs each N seconds
 */
function createJob(streamName) {
  if (ezpaarseJobs.has(streamName)) {
    return debug(`${streamName} already exists`);
  }

  console.log(`Creating an ezPAARSE job for ${streamName} at ${config.ezpaarse.url}`);

  const job = {
    request: request.post({
      url: config.ezpaarse.url,
      headers: config.ezpaarse.headers
    }),
    writeStream: new PassThrough()
  };

  ezpaarseJobs.set(streamName, job);

  job.writeStream.pipe(job.request);
  job.request
    .pipe(JSONStream.parse())
    .on('data', data => {
      const msg = [
        `[${data.datetime}]`,
        data.login,
        data.platform,
        data.platform_name,
        data.rtype,
        data.mime,
        data.print_identifier || '-',
        data.online_identifier || '-',
        data.doi || '-',
        data.url
      ].join(' ');

      data.ezproxyName = streamName;

      if (viewer && viewer.connected) {
        const exported = {};
        broadcastedFields.forEach(f => {
          if (data[f]) { exported[f] = data[f]; }
        });
        viewer.write(`${JSON.stringify(exported)}\n`);
      }

      debug(`+log|${streamName}-ezpaarse|bibliolog|info|${msg}`);
    });

  // check the ezpaarse connection is not closed
  job.request.on('error', err => { restartJob(err); });
  job.request.on('close', () => { restartJob(); });
  job.request.on('end', () => { restartJob(); });
  job.request.on('response', response => {
    printLog(`Job ${response.headers['job-id']} initiated for ${streamName}`);
  });

  function restartJob(err) {
    if (job.restarted) { return; }

    if (err) {
      printLog(`Job error for ${streamName} [${err}]`);
    } else {
      printLog(`Job terminated for ${streamName}`);
    }

    job.restarted = true;
    ezpaarseJobs.delete(streamName);

    debug(`Creating a new job for ${streamName} in ${config.autoConnectDelay}ms`);

    setTimeout(() => {
      createJob(streamName);
    }, config.autoConnectDelay);
  }
}

function printLog(str) {
  console.error(`${new Date()} - ${str}`);
}
