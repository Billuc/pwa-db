import DataChangeInstructionFactory from "./dataChange/dataChangeInstructionFactory";
import type Database from "./database";

export default class MessageHandler {
  private _dataChangeInstructionFactory: DataChangeInstructionFactory;
  private _database: Database;

  constructor(database: Database) {
    this._database = database;
    this._dataChangeInstructionFactory = new DataChangeInstructionFactory();
  }

  async handle(message: Blob) {
    const instructionData = await message.text()
    const instruction = this._dataChangeInstructionFactory.create(instructionData);

    if (!instruction) throw new Error("Instruction could not be parsed : " + instructionData);

    instruction.exec(this._database);
  }
}
