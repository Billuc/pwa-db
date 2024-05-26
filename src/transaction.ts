export default class Transaction<T extends "readonly" | "readwrite"> {
  _database: IDBDatabase;
  _storeName: string;
  _transaction: IDBTransaction;

  constructor(database: IDBDatabase, storeName: string, mode: T) {
    this._database = database;
    this._storeName = storeName;
    this._transaction = this._database.transaction(this._storeName, mode);
  }

  getStore(): IDBObjectStore {
    return this._transaction.objectStore(this._storeName);
  }

  getIndex(indexName: string): IDBIndex {
    return this.getStore().index(indexName);
  }

  async commit(): Promise<void> {
    return new Promise((res, rej) => {
      this._transaction.oncomplete = (_ev) => res();
      this._transaction.onerror = (_ev) => rej("Error during transaction")

      this._transaction.commit();
    })
  }

  rollback(): void {
    this._transaction.abort()
  }
}
