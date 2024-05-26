import type BaseInstruction from "./instructions/baseInstruction";
import CreateStoreInstruction from "./instructions/createStoreInstruction";

export default class MigrationInstructionFactory {
  private readonly INSTRUCTION_TYPES: (typeof BaseInstruction<any>)[] = [
    CreateStoreInstruction
  ]

  create(instruction: string): BaseInstruction<any> | null {
    for (let type of this.INSTRUCTION_TYPES) {
      const parsedInstruction = type.parse(instruction);

      if (!!parsedInstruction) return parsedInstruction;
    }

    return null
  }
}

// interface CreateIndexInstructionData {
//   type: InstructionType.CREATE_INDEX,
//   storeName: string;
//   keyPath: string;
//   indexName: string;
//   unique: boolean;
// }
//
