/* eslint-disable no-console */
const es = require('event-stream');
const JSONStream = require('JSONStream');
const sha256 = require('sha256');
const net = require('net');
const express = require('express');

const app = express();
const httpServer = require('http').Server(app);
const io = require('socket.io')(httpServer);
const fs = require('fs');
const useragent = require('useragent');
const config = require('./config.js');
const pkg = require('./package.json');

const enricherCfg = config.listen.enricher;
// list of connected websockets
const websockets = {};

/**
 * bibliomap-enricher => bibliomap-viewer
 */
const server = net.createServer((socket) => { // 'connection' listener
  console.log('bibliomap-enricher connected');
  socket.on('end', () => {
    console.log('bibliomap-enricher disconnected');
  });

  // get and parse the bibliomap-enricher JSON stream
  // then send it to the browser

  socket
    .pipe(JSONStream.parse())
    .pipe(es.mapSync((event) => {
      Object.keys(websockets).forEach((sid) => {
        console.log('ezPAARSE EC recevied: ', event);

        // We don't need EC's that are not geolocalized
        if (!event['geoip-latitude'] || !event['geoip-longitude']) { return; }

        // Approximate coordinates in a radius of ~20km (0.2°)
        event['geoip-latitude'] = parseFloat(event['geoip-latitude']) + 0.4 * (Math.random() - 0.5);
        event['geoip-longitude'] = parseFloat(event['geoip-longitude']) + 0.4 * (Math.random() - 0.5);

        if (event.host) {
          event.host = sha256(event.host);
        }
        // send the filtered EC to the client through websocket
        websockets[sid].emit('ezpaarse-ec', event);
      });
    }));
});

server.listen(enricherCfg.port, enricherCfg.host, () => {
  console.log(`Waiting for bibliomap-enricher data at ${enricherCfg.host}  : ${enricherCfg.port}`);
});

/**
 * bibliomap => web browser through websocket
 */
httpServer.listen(config.listen.viewer.port, config.listen.viewer.host);

const entity = process.env.BBV_INDEX || 'cnrs';

app.set('views', `${__dirname}/themes`);
app.use(express.static(__dirname));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET');
  next();
});

app.use((req, res, next) => {
  const agent = useragent.is(req.headers['user-agent']).ie;
  if (agent) {
    return res.render('app/browser-compatibility.html.twig', { entity });
  }
  next();
  return null;
});

app.get('/', (req, res) => {
  let locale = req.query.lang || 'fr';
  let i18nGlobal;
  try {
    i18nGlobal = fs.readFileSync(`${__dirname}/themes/app/locale/${locale}.json`, 'utf-8');
  } catch (e) {
    locale = 'fr';
    i18nGlobal = fs.readFileSync(`${__dirname}/themes/app/locale/fr.json`, 'utf-8');
  }

  i18nGlobal = JSON.parse(i18nGlobal);
  i18nGlobal.locale = locale;
  const host = `${req.protocol}://${req.get('x-forwarded-host') || req.hostname}`;
  res.header('X-UA-Compatible', 'IE=edge');

  if (req.query && req.query.lang) {
    delete req.query.lang;
  }
  const query = Object.keys(req.query).map(q => `${q}=${req.query[q]}`).join('&');

  return res.render('app/layout.html.twig', {
    entity,
    version: pkg.version,
    i18n: i18nGlobal,
    host,
    query,
  });
});

io.on('connection', (client) => {
  console.log(`Web browser connected through websocket ${client.id}`);
  websockets[client.id] = client;
  client.on('disconnect', () => {
    console.log(`Web browser disconnected from the websocket ${client.id}`);
    delete websockets[client.id];
  });
});

console.log(`Bibliomap is listening on http://${config.listen.viewer.host}
  : ${config.listen.viewer.port} (open it with your browser!)`);

// exit on CTRL+C
function exitOnSignal(signal) {
  process.on(signal, () => {
    console.log(`Caught ${signal}, exiting`);
    process.exit(1);
  });
}
exitOnSignal('SIGINT');
exitOnSignal('SIGTERM');
