const EventEmitter = require('events').EventEmitter;
const Lazy = require('lazy');
const fs = require('fs');
const net = require('net');
const readline = require('readline');

class SelectedLogsReader extends EventEmitter {
    constructor(options) {
        super();
        this.options = options;
        this.options.port = options?.port || 28777;
    }

    listen = async (cb) => {
        const filePath = './examples/in2p3.log';
        const streamName = 'IN2P3';

        this.server = net.createServer();

        this.emit('+node', '', streamName);

        const stream = fs.createReadStream(filePath, { encoding: 'utf-8', highWaterMark: 1024 });

        const rl = readline.createInterface({
            input: stream,
            output: process.stdout,
            terminal: false
        });

        const lineQueue = [];

        rl.on('line', (line) => {
            if (line) {
                lineQueue.push(line);
                if (lineQueue.length < 2) stream.pause();
                else stream.resume();
            }
        })

        const interval = setInterval(() => {
            if (lineQueue) this.parseLine(lineQueue.shift(), streamName);
        }, 250);

        cb();
        
    }

    /*
    *  line: [+log, streamName, node, type, log ("140.93.9.33 BKmQCaWyWCHfASb - anonymous@cnrs.fr_O_CNRS_I_DS61_OU_UMR0000 [21/Nov/2016:16:59:53 +0000] "GET http://ac.els-cdn.com:80/S0025540816301830/1-s2.0-S0025540816301830-main.pdf?_tid=eb7585fc-b00b-11e6-9bb6-00000aacb362&acdnat=1479747772_050f425fa2f4909faefe714448bd2ed6 HTTP/1.1" 206 606834 ins2i")]
    *  +log: new bubble
    */
    parseLine = (line, streamName) => {
        //console.log("emitting:", '+log', streamName, '', '', line.trim())
        this.emit('+log', streamName.toUpperCase(), 'bibliomap', 'info', line.trim());
    }

    parseLines = (lines) => {
        const lazy = new Lazy;
        lazy.lines.map(String).map(function (line) {
            this.parseLine(line);
        });
        lazy.emit('data', lines);
    }
}

module.exports = SelectedLogsReader;