import "dotenv/config";
import { createClient } from "redis";

const rClient = createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOSTNAME,
    port: Number(process.env.REDIS_PORT),
  },
});

async function initRedis() {
  await rClient.connect();
  await rClient.flushDb();
}
initRedis();

rClient.on("error", (err) => console.log("Redis Client Error", err));

export default rClient;
