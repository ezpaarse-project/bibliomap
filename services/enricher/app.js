// log.io protocol example
// +log biblioinserm bibliomap info 16.2.255.24 - 13BBIU1158 [01/Aug/2013:16:56:36 +0100] "GET http://onlinelibrary.wiley.com:80/doi/10.1111/dme.12357/pdf HTTP/1.1" 200 13639
'use strict';

import config from 'config';
import LogIoListener from 'log.io-server-parser';
import SelectedLogsReader from './selected-logs-reader.js';
import request from 'request';
import { PassThrough } from 'stream';
import JSONStream from 'JSONStream';
import net from 'net';
import debug from 'debug';

const ezpaarseJobs = new Map();
const viewerConfig = config.broadcast.viewer;
const viewerUrl = `${viewerConfig.host}: ${viewerConfig.port}`;
const broadcastedFields = config.broadcast.fields;

/**
 * Connect to bibliomap-viewer
 */
console.log(`Connecting to viewer at ${viewerUrl}`);
const viewer = net.createConnection(viewerConfig);

viewer.on('connect', () => {
  console.log('Viewer connected');
  viewer.connected = true;
});

viewer.on('error', err => {
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
const logIoListener = process.env.REPLAY_MODE ? new SelectedLogsReader(config.listen.harvester) : new LogIoListener(config.listen.harvester);

logIoListener.listen(() => {
  console.log(`Waiting for harvester at ${JSON.stringify(config.listen.harvester)}`);
});

logIoListener.server.on('connection', socket => {
  console.log('Harvester connected');

  socket.on('close', () => {
    console.log('Harvester disconnected');
  });
});

logIoListener.on('+node', (node, streams) => {
  // Create one ezPAARSE job for each stream
  streams.forEach(createJob);
});

logIoListener.on('+log', (streamName, node, type, log) => {

  if (!ezpaarseJobs.get(streamName)) {
    createJob(streamName);
  }

  const job = ezpaarseJobs.get(streamName);
  job.writeStream.write(`${log}\n`);
});

logIoListener.on("+exported_log", (streamName, node, type, log) => {

  if (!ezpaarseJobs.get(streamName)) {
    createJob(streamName);
  }

  viewer.write(`${JSON.stringify(log)}\n`);
})

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
    console.log(`Job ${response.headers['job-id']} initiated for ${streamName}`);
  });

  function restartJob(err) {
    if (job.restarted) { return; }

    if (err) {
      console.log(`Job error for ${streamName} [${err}]`);
    } else {
      console.log(`Job terminated for ${streamName}`);
    }

    job.restarted = true;
    ezpaarseJobs.delete(streamName);

    debug(`Creating a new job for ${streamName} in ${config.autoConnectDelay}ms`);

    setTimeout(() => {
      createJob(streamName);
    }, config.autoConnectDelay);
  }
}