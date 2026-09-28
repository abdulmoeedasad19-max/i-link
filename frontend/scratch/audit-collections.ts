import 'dotenv/config';
import { db } from "../src/lib/db";
import * as fs from 'fs';

async function main() {
  const collections = await db.collection.findMany();
  console.log(JSON.stringify(collections, null, 2));
}

main().catch(console.error).finally(() => db.$disconnect());

