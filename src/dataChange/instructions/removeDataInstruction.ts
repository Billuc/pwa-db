import BaseInstruction from "./baseInstruction"

interface RemoveDataInstructionData {
  storeName: string;
  id: any;
}

export default class RemoveDataInstruction extends BaseInstruction<RemoveDataInstructionData> {
  private static readonly REGEX: RegExp = new RegExp("^REMOVE DATA IN STORE ([a-zA-Z]+) WITH ID (.*)$")

  static override parse(instruction: string): RemoveDataInstruction | null {
    const parsedInstruction = RemoveDataInstruction.REGEX.exec(instruction);

    if (!parsedInstruction || parsedInstruction.length < 2) return null;

    return new RemoveDataInstruction({
      storeName: parsedInstruction[1],
      id: parsedInstruction[2],
    })
  }

  async exec(db: IDBDatabase): Promise<void> {
    const transaction = db.transaction(this._data.storeName, "readwrite")

    if (!db.objectStoreNames.contains(this._data.storeName)) {
      throw new Error(`Store ${this._data.storeName} does not exist`);
    }

    const store = transaction.objectStore(this._data.storeName);
    store.delete(this._data.id);
  }
}
