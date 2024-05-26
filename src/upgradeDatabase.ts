export default interface UpgradeDatabase {
  db: IDBDatabase;
  oldVersion: number;
  newVersion: number | null;
  transaction: IDBTransaction;
}

