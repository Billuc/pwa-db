export default interface Subscription {
  id: number;
  topic: string;
  handler: (msg: string) => any;
}
