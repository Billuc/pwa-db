import type DatabaseConfiguration from "./src/configuration";
import PwaDb from "./src/pwadb";

export async function getDatabase(config: DatabaseConfiguration): Promise<PwaDb> {
  if (!window.indexedDB) throw new Error("IndexedDB not found ! The database will not work")

  const pwaDb = new PwaDb(config);
  await pwaDb.init();

  return pwaDb;
}

