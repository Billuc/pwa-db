import Transaction from "./transaction";

export default class Store {
  private _db: IDBDatabase;
  private _storeName: string;

  constructor(db: IDBDatabase, storeName: string) {
    this._db = db;
    this._storeName = storeName;
  }

  async get(key: IDBValidKey): Promise<any> {
    const results = await this.openTransaction(this._storeName, "readonly", (t) => new Promise<any>((res, rej) => {
      const store = t.getStore();
      const request = store.get(key);

      request.onsuccess = () => res(request.result);
      request.onerror = () => rej(request.error);
    }));
    return results;
  }

  async getAll(range?: IDBKeyRange): Promise<any[]> {
    const results = await this.openTransaction(this._storeName, "readonly", (t) => new Promise<any[]>((res, rej) => {
      const store = t.getStore();
      const request = store.getAll(range)

      request.onsuccess = () => res(request.result);
      request.onerror = () => rej(request.error);
    }))
    return results;
  }

  async getFromIndex(indexName: string, key: IDBValidKey): Promise<any> {
    const results = await this.openTransaction(this._storeName, "readonly", (t) => new Promise<any>((res, rej) => {
      const store = t.getStore();
      const index = store.index(indexName);
      const request = index.get(key);

      request.onsuccess = () => res(request.result);
      request.onerror = () => rej(request.error);
    }));
    return results;
  }

  async getAllFromIndex(indexName: string, range?: IDBKeyRange): Promise<any[]> {
    const results = await this.openTransaction(this._storeName, "readonly", (t) => new Promise<any[]>((res, rej) => {
      const store = t.getStore();
      const index = store.index(indexName);
      const request = index.getAll(range);

      request.onsuccess = () => res(request.result);
      request.onerror = () => rej(request.error);
    }))
    return results;
  }

  async add(value: any): Promise<IDBValidKey> {
    const results = await this.openTransaction(this._storeName, "readwrite", (t) => new Promise<IDBValidKey>((res, rej) => {
      const store = t.getStore();
      const request = store.add(value);

      request.onsuccess = () => res(request.result);
      request.onerror = () => rej(request.error);
    }))
    return results;
  }

  async delete(key: IDBValidKey): Promise<void> {
    await this.openTransaction(this._storeName, "readwrite", (t) => new Promise<void>((res, rej) => {
      const store = t.getStore();
      const request = store.delete(key);

      request.onsuccess = () => res();
      request.onerror = () => rej(request.error);
    }))
  }

  async deleteAll(range?: IDBKeyRange): Promise<void> {
    await this.openTransaction(this._storeName, "readwrite", (t) => new Promise<void>((res, rej) => {
      const store = t.getStore();
      const request = !!range ? store.delete(range) : store.clear();

      request.onsuccess = () => res();
      request.onerror = () => rej(request.error);
    }))
  }

  async put(value: any): Promise<IDBValidKey> {
    const results = await this.openTransaction(this._storeName, "readwrite", (t) => new Promise<IDBValidKey>((res, rej) => {
      const store = t.getStore();
      const request = store.put(value);

      request.onsuccess = () => res(request.result);
      request.onerror = () => rej(request.error)
    }))
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
