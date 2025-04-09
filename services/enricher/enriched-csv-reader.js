const EventEmitter = require('events').EventEmitter;
const Lazy = require('lazy');
var net = require('net');

class EnrichedCsvReader extends EventEmitter {
    constructor(options) {
        super();
        this.options = options;
        this.options.port = options?.port || 28777;
    }

    listen = (cb) => {
        var self = this;
        
          self.server = net.createServer(function (c) {
            self.connection = c;
            
            c.on('end', function() {
              console.log('server disconnected');
            });
        
            // read the data stream
            Lazy(c)
                .lines
                .map(String)
                .map(function (line) {
                  self.parseLine(line);
                });
        
          });
          self.server.listen(self.options.port, function () {
            if (cb) return cb();
          });
    }

    /*
    *  line: [+log, streamName, node, type, log ("140.93.9.33 BKmQCaWyWCHfASb - anonymous@cnrs.fr_O_CNRS_I_DS61_OU_UMR0000 [21/Nov/2016:16:59:53 +0000] "GET http://ac.els-cdn.com:80/S0025540816301830/1-s2.0-S0025540816301830-main.pdf?_tid=eb7585fc-b00b-11e6-9bb6-00000aacb362&acdnat=1479747772_050f425fa2f4909faefe714448bd2ed6 HTTP/1.1" 206 606834 ins2i")]
    *  +log: new bubble
    */
    parseLine = (line) => {
        line = line.trim();
        this.emit('raw', line);
        console.log("line:", line);
        line = line.split('|');
        switch (line[0]) {
            case '+node':
                this.emit('+node', line[1], line[2] ? line[2].split(',') : []);
                break;
            case '-node':
                this.emit('-node', line[1]);
                break;
            case '+log':
                this.emit('+log', line[1], line[2], line[3], line[4]);
                break;
            default:
                this.emit('unknown', line);
        }
    }

    parseLines = (lines) => {
        const lazy = new Lazy;
        lazy.lines.map(String).map(function (line) {
            this.parseLine(line);
        });
        lazy.emit('data', lines);
    }
}

module.exports = EnrichedCsvReader;