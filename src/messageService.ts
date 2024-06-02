import Subscription from "./subscription";

export default class MessageService {
  private _subscriptions: Subscription[];
  private _nextSubscriptionIndex: number;
  private _messageStack: Map<string, string[]>;

  constructor() {
    this._subscriptions = [];
    this._nextSubscriptionIndex = 1;
    this._messageStack = new Map<string, string[]>();
  }

  subscribe(topic: string, callback: (msg: string) => any): number {
    const subscriptionIndex = this._nextSubscriptionIndex;

    this._subscriptions.push({
      id: subscriptionIndex,
      topic: topic,
      handler: callback,
    })
    this._nextSubscriptionIndex++;

    if (this._messageStack.get(topic).length > 0) {
      for (let msg of this._messageStack.get(topic)) {
        this.publish(topic, msg);
      }
    }

    return subscriptionIndex;
  }

  unsubscribe(id: number): boolean {
    const beforeLength = this._subscriptions.length;
    this._subscriptions = this._subscriptions.filter(s => s.id !== id);
    const afterLength = this._subscriptions.length;

    return beforeLength < afterLength;
  }

  publish(topic: string, message: string) {
    const topicSubscriptions = this._subscriptions.filter(s => s.topic == topic);

    if (topicSubscriptions.length == 0) {
      if (!this._messageStack.has(topic)) this._messageStack.set(topic, []);

      this._messageStack.get(topic).push(message)
      return;
    }

    const promises = topicSubscriptions.map(async (s) => {
      await s.handler(message);
    })

    Promise.all(promises);
  }
}
