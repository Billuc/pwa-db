import BaseInstruction from "./baseInstruction"

interface RemoveStoreInstructionData {
  storeName: string;
}

export default class RemoveStoreInstruction extends BaseInstruction<RemoveStoreInstructionData> {
  private static readonly REGEX: RegExp = new RegExp("^REMOVE STORE ([a-zA-Z]+)$");

  static override parse(instruction: string): RemoveStoreInstruction | null {
    const parsedResults = RemoveStoreInstruction.REGEX.exec(instruction);

    if (!parsedResults || parsedResults.length < 2) return null;

    return new RemoveStoreInstruction({
      storeName: parsedResults[1],
    })
  }

  async exec(db: IDBDatabase, transaction: IDBTransaction): Promise<void> {
    if (!db.objectStoreNames.contains(this._data.storeName)) {
      throw new Error(`Store ${this._data.storeName} does not exist`)
    }

    db.deleteObjectStore(this._data.storeName)
  }
}
