import { createClient } from "redis";
const rClient = createClient();

async function initRedis() {
  await rClient.connect();
  await rClient.flushDb();
}
initRedis();

rClient.on("error", (err) => console.log("Redis Client Error", err));

export default rClient;
