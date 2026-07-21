/* eslint-disable no-underscore-dangle */
/* eslint-disable max-classes-per-file */

/* Log.io Log Harvester

Watches local files and sends new log message to server via TCP.

# Sample configuration:
config =
  nodeName: 'my_server01'
  logStreams:
    web_server: [
      '/var/log/nginx/access.log',
      '/var/log/nginx/error.log'
    ],
  server:
    host: '0.0.0.0',
    port: 28777

# Sends the following TCP messages to the server:
"+node|my_server01|web_server\r\n"
"+bind|node|my_server01\r\n"
"+log|web_server|my_server01|info|this is log messages\r\n"

# Usage:
harvester = new LogHarvester(config)
harvester.run()
*/

const fs = require('fs');
const net = require('net');
const winston = require('winston');
const { EventEmitter } = require('events');

/**
 * LogStream is a group of local files paths.  It watches each file for
 * changes, extracts new log messages, and emits 'new_log' events.
 */
class LogStream extends EventEmitter {
  constructor(name, paths, _log) {
    super();
    this.name = name;
    this.paths = paths;
    this._log = _log;
  }

  watch() {
    console.log(`Starting log stream: '${this.name}'`);
    this.paths.forEach((p) => this._watchFile(p));
    return this;
  }

  _watchFile(path) {
    if (!fs.existsSync(path)) {
      console.error(`File doesn't exist: '${path}'`);
      setTimeout(() => this._watchFile(path), 1000);
      return;
    }

    console.log(`Watching file: '${path}'`);
    let currSize = fs.statSync(path).size;

    const watcher = fs.watch(path, (event) => {
      if (event === 'rename') {
        watcher.close();
        this._watchFile(path);
      } else if (event === 'change') {
        fs.stat(path, (err, stat) => {
          this._readNewLogs(path, stat.size, currSize);
          currSize = stat.size;
        });
      }
    });

    return watcher;
  }

  _readNewLogs(path, curr, prev) {
    if (curr < prev) { return; }

    const rstream = fs.createReadStream(path, {
      encoding: 'utf8',
      start: prev,
      end: curr,
    });
    rstream.on('error', (err) => {
      console.error(err);
    });

    rstream.on('data', (data) => {
      const lines = data.split('\n').filter((line) => line);
      return lines.map((line) => this.emit('new_log', line));
    });
  }
}

/**
 * LogHarvester creates LogStreams and opens a persistent TCP connection to the server.
 * On startup it announces itself as Node with Stream associations.
 * Log messages are sent to the server via string-delimited TCP messages
 */
class LogHarvester {
  constructor(config) {
    this.nodeName = config.nodeName;
    this.server = config.server;
    this.delim = config.delimiter || '\r\n';
    this._log = config.logging || winston;
    this._connected = false;
    this.nbLogs = 0;
    this.logStreams = Object.entries(config.logStreams)
      .map(([name, paths]) => new LogStream(name, paths, this._log));
  }

  run() {
    this._connect();

    this.logStreams.forEach((stream) => {
      stream.watch().on('new_log', (msg) => {
        if (this._connected) {
          return this._sendLog(stream, msg);
        }
      });
    });
  }

  _connect() {
    console.log(`Try to connect to server ${process.env.ENRICHER_URL}`);
  
    this.socket = new net.Socket();
  
    this.socket.on('error', (err) => {
      console.error(err);
    });
  
    this.socket.on('close', (hadError) => {
      this._connected = false;
      console.error(`Connection closed (hadError=${hadError}). Reconnecting in 2 seconds...`);
      setTimeout(() => this._connect(), 2000);
    });
  
    this.socket.connect(this.server.port, this.server.host, () => {
      console.log(`Connected to server ${process.env.ENRICHER_URL}`);
      this._connected = true;
      this._announce();
    });
  }

  _sendLog(stream, msg) {
    this.nbLogs += 1;
    if (this.nbLogs % 100 === 0) {
      console.log(`${new Date().toISOString()}: Sent ${this.nbLogs} logs`);
      this.nbLogs = 0;
    }
    return this._send('+log', stream.name, this.nodeName, 'info', msg);
  }

  _announce() {
    const snames = this.logStreams.map((l) => l.name).join(',');
    console.log(`Announcing: ${this.nodeName} (${snames})`);
    this._send('+node', this.nodeName, snames);
    return this._send('+bind', 'node', this.nodeName);
  }

  _send(mtype, ...args) {
    this.nbLogs += 1;
    if (this.nbLogs % 100 === 0) {
      console.log(`${new Date().toISOString()}: Sent ${this.nbLogs} logs`);
      this.nbLogs = 0;
    }
    return this.socket.write(`${mtype}|${args.join('|')}${this.delim}`);
  }
}

module.exports = LogHarvester;
