import type UpgradeDatabase from "../upgradeDatabase";
import type MigrationData from './migrationData';
import MigrationInstructionFactory from "./migrationInstructionFactory";

export default class Migration {
  private _data: MigrationData;
  private _instructionFactory: MigrationInstructionFactory;

  constructor(data: MigrationData) {
    this._data = data;
    this._instructionFactory = new MigrationInstructionFactory();
  }

  async execMigration(
    request: UpgradeDatabase,
  ): Promise<undefined> {
    if (
      request.oldVersion >= this._data.version ||
      this._data.version > (request.newVersion ?? -1)
    ) {
      console.debug(
        `[Migration] Skipping migration ${this._data.version} - ${this._data.name}`
      );
      return;
    }

    console.log(
      `[Migration] Applying migration ${this._data.version} - ${this._data.name}`
    );
    await this.migrate(request.db, request.transaction);
    console.warn(
      `[Migration] Applied migration ${this._data.version} - ${this._data.name}`
    );
  }

  private async migrate(
    db: IDBDatabase,
    transaction: IDBTransaction
  ): Promise<void> {
    for (let i of this._data.instructions) {
      const instruction = this._instructionFactory.create(i);

      if (!instruction) throw new Error("Instruction could not be parsed : " + i);

      await instruction.exec(db, transaction);
    }
  }
}
