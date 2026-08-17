import Redis from 'ioredis';
import config from 'config';

const { redis } = config;

/**
 * Create Redis client
 * @returns Redis client
 */
function createRedisClient() {
  const redisClient = new Redis({
    host: redis.host,
    port: redis.port,
    password: redis.password,
  });
  redisClient.on('error', (err) => console.error('[redis]: error:', err.message));
  redisClient.on('connect', () => console.log('[redis]: connected'));
  return redisClient;
}

const bibcnrsRegex = /^(\S+) (\S+) (\S+) (\S+) \[([^\]]+)\] "(\S+) (.*?) (\S+)" (\d{3}) (\S+) (\S+)/;

/**
 * Consumes EZproxy log lines pushed by Filebeat into Redis,
 * and forwards them to the ezPAARSE job (ezpaarseStream) provided by app.js.
 * @param {import('stream').Writable} ezpaarseStream Input stream of the current ezPAARSE job
 */
export default async function consumeEzproxyLogs(ezpaarseStream) {
  const redisClient = createRedisClient();
  console.log(`[redis]: listening on ${redis.key} (${redis.host}:${redis.port})`);
  while (true) {
    try {
      const result = await redisClient.brpop(redis.key, 0);
      if (!result) continue;

      const [, rawJson] = result;

      let event;
      try {
        event = JSON.parse(rawJson);
      } catch (err) {
        console.error('[redis]: invalid JSON Filebeat :', err.message);
        continue;
      }

      const line = event.message;
      console.log('[redis]: received line:', line);
      const match = line.match(bibcnrsRegex);

      if (!match) {
        console.warn('[redis]: line not matched, skipped:', line);
        continue;
      }

      // send line to ezPAARSE
      ezpaarseStream.write(`${line}\n`);
    } catch (err) {
      console.error('[redis]: error:', err.message);
    }
  }
}
