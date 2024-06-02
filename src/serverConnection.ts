import type MessageService from "./messageService";
import Topics from "./topics"

export default class ServerConnection {
  private _serverUrl: string;
  private _messageService: MessageService;
  private _serverSocket?: WebSocket;

  constructor(serverUrl: string, messageService: MessageService) {
    this._serverUrl = serverUrl;
    this._messageService = messageService;
  }

  async init(): Promise<void> {
    await new Promise<void>((res, rej) => {
      if (!!this._serverSocket) {
        res();
        return;
      }

      this._serverSocket = new WebSocket(this._serverUrl);

      if (this._serverSocket.readyState !== WebSocket.CONNECTING) {
        res();
        return;
      }

      this._serverSocket.onopen = () => res();
    });

    this._serverSocket!.onmessage = async (messageEvent) => {
      const data = await (messageEvent.data as Blob).text();
      this._messageService.publish(Topics.INCOMING_DATA, data);
    }
    this._messageService.subscribe(Topics.OUTGOING_DATA, this.send);
  }

  async send(message: string) {
    if (!this._serverSocket) throw new Error("Server connection not initialized ! Call init() first !")
    this._serverSocket.send(message);
  }

  close(): Promise<void> {
    return new Promise((res, rej) => {
      if (!this._serverSocket) {
        rej("Server connection not initialized ! Call init() first !")
        return;
      }

      this._serverSocket.close();
      this._serverSocket.onclose = () => res();
    })
  }
}
