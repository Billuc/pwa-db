import BaseInstruction from "./baseInstruction"

interface CreateStoreInstructionData {
  storeName: string;
  keyPath: string | "autoIncrement";
}

export default class CreateStoreInstruction extends BaseInstruction<CreateStoreInstructionData> {
  private static readonly REGEX: RegExp = new RegExp("^CREATE STORE ([a-zA-Z]*) WITH KEY ([a-zA-Z]*)$");

  static override parse(instruction: string): CreateStoreInstruction | null {
    const parsedResults = CreateStoreInstruction.REGEX.exec(instruction);

    if (!parsedResults || parsedResults.length < 3) return null;

    return new CreateStoreInstruction({
      storeName: parsedResults[1],
      keyPath: parsedResults[2],
    })
  }

  async exec(db: IDBDatabase, transaction: IDBTransaction): Promise<void> {
    if (db.objectStoreNames.contains(this._data.storeName)) return;

    db.createObjectStore(this._data.storeName, {
      keyPath: this._data.keyPath == "autoIncrement" ? undefined : this._data.keyPath,
      autoIncrement: this._data.keyPath == "autoIncrement"
    })
  }
}
