const http = require('http');

const PORT = process.env.PORT || 3000;
const URL = `http://localhost:${PORT}/healthcheck`;

console.log(`[healthcheck]: Checking health at: ${URL}`);

http.get(URL, (res) => {
  if (res.statusCode === 204) {
    process.exit(0);
  } else {
    console.error(`[healthcheck]: Cannot request ${URL} - failed with status code: ${res.statusCode}`);
    process.exit(1);
  }
}).on('error', (err) => {
  console.error(`[healthcheck]: Cannot request ${URL} - failed with error: ${err.message}`);
  process.exit(1);
});
