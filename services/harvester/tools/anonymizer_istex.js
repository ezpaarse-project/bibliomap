/*
*  Tool to anonymize logs file
*  It reads line by line the file and remove unwanted values
*
*/

var fs = require("fs");
var inputLogName;
var outputLogName;

if (process.argv[2] != null) {
  inputLogName = process.argv[2];
} else {
  console.log("You need to pass in 1rst parameter, a valid path to the log file");
  process.exit();
}

if (process.argv[3] != null) {
  outputLogName = process.argv[3];
} else {
  console.log("You need to pass in 2nd parameter, a valid destination path to the anonimized log file");
  process.exit();
}

var lineReader = require("readline").createInterface({
  input: fs.createReadStream(inputLogName)
});

lineReader.on("line", function(line) {
  if ((match = /^([0-9\.]+)\s([a-z0-9\"]+[^X])\s([0-9a-zÀ-ÿ\s\"\-\']+)\s-/gi.exec(line)) !== null) {
    //185.61.163.0 "ABESCWN7PF5JA" "Université d'Aix-Marseille"
    var new_line = line;
    new_line = new_line.replace(match[2], "XXX");
    new_line = new_line.replace(match[3], "XXX");
    fs.appendFileSync(outputLogName, new_line + "\n");
  } else {
    fs.appendFileSync(outputLogName, line + "\n");
  }
});
