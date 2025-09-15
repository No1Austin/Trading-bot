import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);
let connected = false;

export async function db() {
  if (!connected) {
    await client.connect();
    connected = true;
  }
  return client.db();
}
