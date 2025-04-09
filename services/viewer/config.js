const nconf = require('nconf');
const defaultConfig = require('./config.json');

// to allow config overloading
// by a local config file

let localConf = {};
try {
  // eslint-disable-next-line
  localConf = require('./config.local.js');
} catch (err) {
  // eslint-disable-next-line no-console
  console.error(err);
}

nconf.argv()
  .env([
    'BBV_INDEX',
    'BBV_JSFILE',
    'BBV_LISTEN_ENRICHER_HOST',
    'BBV_LISTEN_ENRICHER_PORT',
    'BBV_LISTEN_HOST',
    'BBV_LISTEN_PORT',
  ])
  .overrides(localConf)
  .defaults(defaultConfig);

let config = nconf.get();

config = Object.assign(config, {
  index: config.BBV_INDEX || config.index,
  jsfile: config.BBV_JSFILE || config.jsfile,
});

if (config.BBV_LISTEN_ENRICHER_HOST) {
  config.listen.enricher.host = config.BBV_LISTEN_ENRICHER_HOST;
}
if (config.BBV_LISTEN_ENRICHER_PORT) {
  config.listen.enricher.port = config.BBV_LISTEN_ENRICHER_PORT;
}
if (config.BBV_LISTEN_HOST) {
  config.listen.viewer.host = config.BBV_LISTEN_HOST;
}
if (config.BBV_LISTEN_PORT) {
  config.listen.viewer.port = config.BBV_LISTEN_PORT;
}

module.exports = config;
