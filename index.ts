import Database from "./src/database";
import MessageHandler from "./src/messageHandler";
import ServerConnection from "./src/serverConnection";
import type DatabaseConfiguration from "./src/configuration"

export async function getDatabase(config: DatabaseConfiguration): Promise<Database> {
  if (!window.indexedDB) throw new Error("IndexedDB not found ! The database will not work")

  const db = new Database(config);
  await db.init();

  const messageHandler = new MessageHandler(db);
  const serverConnection = new ServerConnection(config.serverUri, messageHandler);
  await serverConnection.init();

  return db;
}

