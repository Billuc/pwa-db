import MessageHandler from "./messageHandler"

export default class ServerConnection {
  private _serverUrl: string;
  private _messageHandler: MessageHandler;
  private _serverSocket?: WebSocket;

  constructor(serverUrl: string, messageHandler: MessageHandler) {
    this._serverUrl = serverUrl;
    this._messageHandler = messageHandler;
  }

  async init(): Promise<void> {
    return new Promise((res, rej) => {
      if (!!this._serverSocket) {
        res();
        return;
      }

      this._serverSocket = new WebSocket(this._serverUrl);
      this._serverSocket.onmessage = (messageEvent) => this._messageHandler.handle(messageEvent.data);

      if (this._serverSocket.readyState !== WebSocket.CONNECTING) {
        res();
        return;
      }

      this._serverSocket.onopen = () => res();
    });
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
