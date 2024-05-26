export default abstract class BaseInstruction<T> {
  protected _data: T;

  protected constructor(data: T) {
    this._data = data;
  }

  static parse(instruction: string): BaseInstruction<any> | null {
    throw new Error("parse method not implemented");
  }

  abstract exec(db: IDBDatabase, transaction: IDBTransaction): Promise<void>;
}
