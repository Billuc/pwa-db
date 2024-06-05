import InsertDataInstruction from "./dataChange/instructions/insertDataInstruction";
import RemoveDataInstruction from "./dataChange/instructions/removeDataInstruction";
import type Database from "./database";
import type MessageService from "./messageService";
import Topics from "./topics";
import Transaction from "./transaction";

export default class Store {
  private _database: Database;
  private _storeName: string;
  private _messageService: MessageService;

  constructor(database: Database, storeName: string, messageService: MessageService) {
    this._database = database;
    this._storeName = storeName;
    this._messageService = messageService;
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

    const data = InsertDataInstruction.format({ storeName: this._storeName, value: value });
    this._messageService.publish(Topics.OUTGOING_DATA, data);

    return results;
  }

  async delete(key: IDBValidKey): Promise<void> {
    await this.openTransaction(this._storeName, "readwrite", (t) => new Promise<void>((res, rej) => {
      const store = t.getStore();
      const request = store.delete(key);

      request.onsuccess = () => res();
      request.onerror = () => rej(request.error);
    }))

    const data = RemoveDataInstruction.format({ storeName: this._storeName, id: key });
    this._messageService.publish(Topics.OUTGOING_DATA, data);
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
    const db = await this._database.getDB();
    const transaction = new Transaction<T>(db, store, mode);

    try {
      return await fn(transaction);
    } catch (e) {
      transaction.rollback();
      throw e;
    }
  }
}
