import Transaction from "./transaction";

export default class Store {
  private _db: IDBDatabase;
  private _storeName: string;

  constructor(db: IDBDatabase, storeName: string) {
    this._db = db;
    this._storeName = storeName;
  }

  async get(key: IDBValidKey): Promise<any> {
    const results = await this.openTransaction(this._storeName, "readonly", (t) => new Promise((res, rej) => {
      const store = t.getStore();
      const request = store.get(key);
      request.onsuccess = () => {
        res(request.result);
      };
      request.onerror = () => {
        rej("Couldn't get data from the store")
      }
    }));
    return results;
  }

  private async openTransaction<T extends "readonly" | "readwrite", U>(
    store: string,
    mode: T,
    fn: (t: Transaction<T>) => Promise<U>
  ): Promise<U> {
    const transaction = new Transaction<T>(this._db, store, mode);

    try {
      return await fn(transaction);
    } catch (e) {
      transaction.rollback();
      throw e;
    } finally {
      await transaction.commit();
    }
  }
}
