import BaseInstruction from "./baseInstruction"

interface RemoveIndexInstructionData {
  storeName: string;
  indexName: string;
}

export default class RemoveIndexInstruction extends BaseInstruction<RemoveIndexInstructionData> {
  private static readonly REGEX: RegExp = new RegExp("^REMOVE INDEX ([a-zA-Z]+) ON STORE ([a-zA-Z]+)$")

  static override parse(instruction: string): RemoveIndexInstruction | null {
    const parsedInstruction = RemoveIndexInstruction.REGEX.exec(instruction);

    if (!parsedInstruction || parsedInstruction.length < 3) return null;

    return new RemoveIndexInstruction({
      indexName: parsedInstruction[1],
      storeName: parsedInstruction[2],
    })
  }

  async exec(db: IDBDatabase, transaction: IDBTransaction): Promise<void> {
    if (!db.objectStoreNames.contains(this._data.storeName)) {
      throw new Error(`Store ${this._data.storeName} does not exist`);
    }

    const store = transaction.objectStore(this._data.storeName);

    if (!store.indexNames.contains(this._data.indexName)) {
      throw new Error(`Index ${this._data.indexName} does not exist on store ${this._data.storeName}`)
    }

    store.deleteIndex(this._data.indexName);
  }
}
