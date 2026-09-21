import { db } from "./src/lib/db";
async function main() {
  console.log("Keys on db:", Object.keys(db).filter(k => !k.startsWith('_')));
  if (db.collection) {
    console.log("Collection exists!");
  } else {
    console.log("Collection is undefined!");
  }
}
main();

