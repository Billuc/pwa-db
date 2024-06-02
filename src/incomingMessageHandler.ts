import DataChangeInstructionFactory from "./dataChange/dataChangeInstructionFactory";
import type Database from "./database";
import type MessageService from "./messageService";
import Topics from "./topics";

export default class IncomingMessageHandler {
  private _dataChangeInstructionFactory: DataChangeInstructionFactory;
  private _database: Database;
  private _messageService: MessageService;

  constructor(database: Database, messageService: MessageService) {
    this._database = database;
    this._dataChangeInstructionFactory = new DataChangeInstructionFactory();
    this._messageService = messageService;

    this._messageService.subscribe(Topics.INCOMING_DATA, this.handle);
  }

  async handle(message: string) {
    const instruction = this._dataChangeInstructionFactory.create(message);

    if (!instruction) throw new Error("Instruction could not be parsed : " + message);

    const db = await this._database.getDB();
    instruction.exec(db);
  }
}
