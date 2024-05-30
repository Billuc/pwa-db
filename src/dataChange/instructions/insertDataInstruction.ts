import type Database from "../../database";
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

  async exec(database: Database): Promise<void> {
    const store = await database.openStore(this._data.storeName);
    const data = JSON.parse(this._data.value);

    store.add(data);
  }
}
