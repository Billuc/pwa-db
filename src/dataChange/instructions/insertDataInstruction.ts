import BaseInstruction from "./baseInstruction"

interface InsertDataInstructionData {
  storeName: string;
  value: string;
}

export default class InsertDataInstruction extends BaseInstruction<InsertDataInstructionData> {
  private static readonly REGEX: RegExp = new RegExp("^INSERT DATA IN STORE ([a-zA-Z]+) WITH VALUE ({(?:.*)})$")

  static override parse(instruction: string): InsertDataInstruction | null {
    const parsedInstruction = InsertDataInstruction.REGEX.exec(instruction);

    if (!parsedInstruction || parsedInstruction.length < 2) return null;

    return new InsertDataInstruction({
      storeName: parsedInstruction[1],
      value: parsedInstruction[2],
    })
  }

  async exec(db: IDBDatabase): Promise<void> {
    const transaction = db.transaction(this._data.storeName, "readwrite")
    const data = JSON.parse(this._data.value);

    if (!db.objectStoreNames.contains(this._data.storeName)) {
      throw new Error(`Store ${this._data.storeName} does not exist`);
    }

    const store = transaction.objectStore(this._data.storeName);
    store.add(data);
  }

  static override format(data: InsertDataInstructionData) {
    const stringifiedValue = JSON.stringify(data.value);
    return `INSERT DATA IN STORE ${data.storeName} WITH VALUE ${stringifiedValue}`
  }
}
