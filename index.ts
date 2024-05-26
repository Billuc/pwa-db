import Database from "./src/database";
import type DatabaseConfiguration from "./src/configuration"

async function getDatabase(config: DatabaseConfiguration): Promise<Database> {
  if (!window.indexedDB) throw new Error("IndexedDB not found ! The database will not work")

  const db = new Database(config);
  await db.init();
  return db;
}

export default getDatabase;
