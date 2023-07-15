import "dotenv/config";
import { createClient } from "redis";

const rClient = createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOSTNAME,
    port: Number(process.env.REDIS_PORT)
  }
});

export default rClient;
