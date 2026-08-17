import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import config from 'config';
import { PassThrough, Readable } from 'stream';
import { setTimeout as sleep } from 'timers/promises';
import consumeEzproxyLogs from './live.js';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const headersPath = path.join(dirname, '..', 'ezpaarse-headers.json');

const broadcastedFields = [
  'geoip-latitude',
  'geoip-longitude',
  'ezproxyName',
  'platform_name',
  'publication_title',
  'online_identifier',
  'print_identifier',
  'rtype',
  'mime',
];

const viewers = new Set();

const server = http.createServer((req, res) => {
  if (req.url === '/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    viewers.add(res);

    req.on('close', () => {
      viewers.delete(res);
      res.end();
    });

    return;
  }
  res.writeHead(404);
  res.end();
});

server.listen(config.port, () => {
  console.log('[enricher]: is running on port', config.port);
});

/**
 * send data to all connected viewers
 * @param {*} data one EC from ezPAARSE
 */
function sendData(data) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const res of viewers) {
    res.write(payload);
  }
}

function loadEzpaarseHeaders() {
  try {
    const raw = fs.readFileSync(headersPath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`Impossible de charger ${headersPath} : ${err.message}`);
  }
}

/**
 * blur Location of EC from ezPAARSE
 * @param {number} lat
 * @param {number} lng
 * @param {number} maxOffset
 * @returns
 */
function blurLocation(lat, lng, maxOffset = 0.01) {
  const offsetLat = (Math.random() * 2 - 1) * maxOffset;
  const offsetLng = (Math.random() * 2 - 1) * maxOffset;

  const newLat = lat + offsetLat;
  const newLng = lng + offsetLng;

  return {
    lat: parseFloat(newLat.toFixed(6)),
    lng: parseFloat(newLng.toFixed(6)),
  };
}

function handleEzpaarseData(data) {
  let parsedData;
  try {
    parsedData = JSON.parse(data);
  } catch (err) {
    console.error('[ezpaarse]: Cannot parse data', data);
    return;
  }
  // filter data to send to bibliomap
  const outputData = {};
  broadcastedFields.forEach((field) => {
    outputData[field] = parsedData[field];
  });
  outputData.datetime = parsedData.datetime;
  // add ezproxyName to data, this will incremente the counter in viewer
  outputData.ezproxyName = parsedData['bib-groups'];
  // blur location
  const newLocation = blurLocation(parseFloat(parsedData['geoip-latitude']), parseFloat(parsedData['geoip-longitude']));
  outputData['geoip-latitude'] = newLocation.lat;
  outputData['geoip-longitude'] = newLocation.lng;

  console.log('[ezpaarse]: receive data', JSON.stringify(outputData));
  // send data to http stream for bibliomap viewer
  sendData(outputData);
}

/**
 * start ezPAARSE job, get ECs, filter data, blur data, send data to viewers
 * In demo, read demo file line by line with no stop and send it to ezPAARSE job.
 * In live, read line by line from Redis and send it to ezPAARSE job.
 * @returns {PassThrough} le stream d'entrée du job ezPAARSE
 */
function createEzpaarseConnection() {
  let activeStream = null;
  let reconnecting = false;

  const retryDelayMs = 1000;

  function scheduleReconnect(reason) {
    if (reconnecting) return;
    reconnecting = true;
    console.warn(`[ezPAARSE]: interrupt connection to ezPAARSE, reason:(${reason}), restart in ${retryDelayMs}ms`);
    setTimeout(() => {
      reconnecting = false;
      connect();
    }, retryDelayMs);
  }

  function connect() {
    console.log('[ezPAARSE]: start job on', config.ezpaarseURL);

    const ezpaarseStream = new PassThrough();
    activeStream = ezpaarseStream;

    ezpaarseStream.on('error', (err) => {
      scheduleReconnect(`input stream error: ${err.message}`);
    });

    const headers = loadEzpaarseHeaders();
    // TODO 2026-08-13 : use async await
    fetch(config.ezpaarseURL, {
      method: 'POST',
      headers,
      body: ezpaarseStream,
      duplex: 'half',
      bodyTimeout: 120000,
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`[ezPAARSE]: Failed to start job: ${res.status} ${res.statusText}`);
        }

        console.log('[ezPAARSE]: job started');

        const nodeReadable = Readable.fromWeb(res.body);

        nodeReadable.on('data', handleEzpaarseData);

        nodeReadable.on('end', () => {
          scheduleReconnect('response stream ended');
        });

        nodeReadable.on('error', (err) => {
          scheduleReconnect(`response stream error: ${err.message}`);
        });
      })
      .catch((err) => {
        console.error('[ezPAARSE]: Erreur lors de la requête fetch:', err.message);
        scheduleReconnect('fetch failed');
      });
  }

  connect();

  return {
    write(line) {
      if (!activeStream || activeStream.destroyed || activeStream.writableEnded) {
        console.warn('[ezPAARSE]: pas de job actif pour le moment, ligne ignorée');
        return;
      }
      activeStream.write(line);
    },
  };
}

async function startEnricherProcess() {
  if (config.mode === 'demo') {
    console.log('[enricher]: is in demo mode');

    const logFilepath = path.resolve(dirname, '..', 'log', 'demo.log');
    const ezpaarseStream = createEzpaarseConnection();

    const lines = fs.readFileSync(logFilepath, 'utf-8').split('\n').filter(Boolean);

    // read demo file line by line with no stop and send it to ezPAARSE job
    while (true) {
      for (const line of lines) {
        await sleep(1000);
        console.log('[ezpaarse]: send line', line);
        ezpaarseStream.write(`${line}\n`);
      }
    }
  }
  if (config.mode === 'live') {
    console.log('[enricher]: is in live mode');

    const ezpaarseStream = createEzpaarseConnection();
    await consumeEzproxyLogs(ezpaarseStream);
  }
}

startEnricherProcess().catch((err) => {
  console.error('Error in startEnricherProcess():', err.message);
});
