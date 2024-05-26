import type BaseInstruction from "./instructions/baseInstruction";
import CreateStoreInstruction from "./instructions/createStoreInstruction";
import CreateIndexInstruction from "./instructions/createIndexInstruction";
import RemoveStoreInstruction from "./instructions/removeStoreInstruction";
import RemoveIndexInstruction from "./instructions/removeIndexInstruction";

export default class MigrationInstructionFactory {
  private readonly INSTRUCTION_TYPES: (typeof BaseInstruction<any>)[] = [
    CreateStoreInstruction,
    CreateIndexInstruction,
    RemoveStoreInstruction,
    RemoveIndexInstruction,
  ]

  create(instruction: string): BaseInstruction<any> | null {
    for (let type of this.INSTRUCTION_TYPES) {
      const parsedInstruction = type.parse(instruction);

      if (!!parsedInstruction) return parsedInstruction;
    }

    return null
  }
}

