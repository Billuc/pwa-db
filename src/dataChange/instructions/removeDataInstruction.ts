import type Database from "../../database";
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

  async exec(database: Database): Promise<void> {
    const store = await database.openStore(this._data.storeName);
    const id = JSON.parse(this._data.id);

    store.delete(id);
  }
}
