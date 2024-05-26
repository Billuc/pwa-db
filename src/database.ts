import Store from "./store";

import type UpgradeDatabase from "./upgradeDatabase";
import type DatabaseConfiguration from "./configuration";
import type UpdateDatabase from "./upgradeDatabase";
import Migration from "./migration/migration";

export default class Database {
  private readonly _configuration;
  private _db?: IDBDatabase;

  constructor(configuration: DatabaseConfiguration) {
    this._configuration = configuration;
  }

  private getVersion() {
    let version = 0;

    for (const migration of this._configuration.migrations) {
      version = migration.version > version ? migration.version : version;
    }

    return version;
  }

  private async upgrade(request: UpgradeDatabase) {
    const sortedMigrations = [...this._configuration.migrations]
      .sort((migrationA, migrationB) => migrationA.version - migrationB.version)
      .map(data => new Migration(data));

    for (let migration of sortedMigrations) {
      await migration.execMigration(request)
    }
  }

  async init(): Promise<void> {
    await this.open();
  }

  private open(): Promise<IDBDatabase> {
    return new Promise((res, rej) => {
      if (!!this._db) res(this._db);

      if (this.getVersion() == 0) rej("You need at least one migration to open the database");

      const openRequest = window.indexedDB.open(this._configuration.dbName, this.getVersion())
      openRequest.onsuccess = (_ev) => {
        this._db = openRequest.result;
        res(this._db);
      }
      openRequest.onerror = (_ev) => rej("Error while opening database")
      openRequest.onblocked = (_ev) => rej("Error while opening database : An upgrade has been requested but there is an open connection to the database with a previous version")

      const upgrader = this.upgrade.bind(this);

      openRequest.onupgradeneeded = (ev) => {
        const db = (ev.target as IDBOpenDBRequest).result;
        const transaction = (ev.target as IDBOpenDBRequest).transaction;

        if (!db) {
          throw new Error("Error getting database for update");
        }
        if (!transaction) {
          throw new Error("Error getting database upgrade transaction");
        }

        const request: UpdateDatabase = {
          db,
          oldVersion: ev.oldVersion,
          newVersion: ev.newVersion,
          transaction
        }

        upgrader(request).then(() => {
          this._db = db;
          res(this._db)
        }).catch((reason) => {
          console.warn(reason);
          transaction.abort();
        })
      }
    });
  }

  async openStore(storeName: string) {
    const db = await this.open();

    if (!db.objectStoreNames.contains(storeName)) {
      throw new Error(`Store ${storeName} does not exist`);
    }

    return new Store(db, storeName);
  }
}
