import Database from "./database";
import IncomingMessageHandler from "./incomingMessageHandler";
import ServerConnection from "./serverConnection";
import type DatabaseConfiguration from "./configuration"
import MessageService from "./messageService";
import Store from "./store";

export default class PwaDb {
  private readonly _config: DatabaseConfiguration;
  private _messageService: MessageService;
  private _database: Database;
  private _incomingMessageHandler?: IncomingMessageHandler;
  private _serverConnection?: ServerConnection;

  constructor(config: DatabaseConfiguration) {
    this._config = config;
    this._messageService = new MessageService();
    this._database = new Database(config);
  }

  async init() {
    await this._database.init();

    if (this._config.serverUri) {
      this._incomingMessageHandler = new IncomingMessageHandler(this._database, this._messageService);
      this._serverConnection = new ServerConnection(this._config.serverUri, this._messageService);

      await this._serverConnection.init();
    }
  }

  getStore(storeName: string) {
    return new Store(this._database, storeName, this._messageService);
  }
}
