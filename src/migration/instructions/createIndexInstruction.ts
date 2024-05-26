import BaseInstruction from "./baseInstruction"

interface CreateIndexInstructionData {
  storeName: string;
  keyPath: string;
  indexName: string;
  unique: boolean;
}

export default class CreateIndexInstruction extends BaseInstruction<CreateIndexInstructionData> {
  private static readonly REGEX: RegExp = new RegExp("^CREATE INDEX ([a-zA-Z]+) ON STORE ([a-zA-Z]+) WITH KEY ([a-zA-Z]+)( UNIQUE)?$")

  static override parse(instruction: string): CreateIndexInstruction | null {
    const parsedInstruction = CreateIndexInstruction.REGEX.exec(instruction);

    if (!parsedInstruction || parsedInstruction.length < 4) return null;

    return new CreateIndexInstruction({
      indexName: parsedInstruction[1],
      storeName: parsedInstruction[2],
      keyPath: parsedInstruction[3],
      unique: parsedInstruction.length > 4
    })
  }

  async exec(db: IDBDatabase, transaction: IDBTransaction): Promise<void> {
    if (!db.objectStoreNames.contains(this._data.storeName)) {
      throw new Error(`Store ${this._data.storeName} does not exist`);
    }

    const store = transaction.objectStore(this._data.storeName);

    if (store.indexNames.contains(this._data.indexName)) return;

    store.createIndex(this._data.indexName, this._data.keyPath, { unique: this._data.unique });
  }
}
