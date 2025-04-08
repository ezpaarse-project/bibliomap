const fs = require('fs');
const path = require('path');

module.exports = class LogGenerator {
  constructor (config = {}) {
    this.logFiles = [];
    this.logLines = {};
    this.sourceDir = config.source;
    this.destinationDir = config.destination;
    this.frequency = 1000 / (parseFloat(config.speed) || 5);
  }

  async run () {
    this.logFiles = await this.loadLogFiles();
    this.write();
  }

  write () {
    const randomFile = this.logFiles[Math.floor(Math.random() * this.logFiles.length)];
    this.writeInFile(randomFile);
    setTimeout(() => this.write(), this.frequency);
  }

  loadLogFiles () {
    return new Promise((resolve, reject) => {
      fs.readdir(this.sourceDir, (err, files) => {
        if (err) {
          return reject(err);
        }

        files.forEach(filename => {
          const sourceFile = path.resolve(this.sourceDir, filename);
          const destFile = path.resolve(this.destinationDir, filename);

          const fileContent = fs.readFileSync(sourceFile, 'utf-8');
          this.logLines[filename] = fileContent.split(/\r?\n/).map(line => line.trim()).filter(line => line);

          if (!fs.existsSync(destFile)) {
            fs.writeFileSync(destFile, '');
          }
        });

        return resolve(files);
      });
    });
  }

  writeInFile (file) {
    const lines = this.logLines[file];
    const line = lines[Math.floor(Math.random() * lines.length)];

    fs.appendFile(path.resolve(this.destinationDir, file), `${line}\r\n`, (err) => {
      if (err) {
        console.error(err);
        return process.exit(1);
      }
    });
  }
}
