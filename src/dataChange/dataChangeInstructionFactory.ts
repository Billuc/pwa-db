import type BaseInstruction from "./instructions/baseInstruction";
import RemoveDataInstruction from "./instructions/removeDataInstruction";
import InsertDataInstruction from "./instructions/insertDataInstruction";

export default class DataChangeInstructionFactory {
  private readonly INSTRUCTION_TYPES: (typeof BaseInstruction<any>)[] = [
    RemoveDataInstruction,
    InsertDataInstruction
  ]

  create(instruction: string): BaseInstruction<any> | null {
    for (let type of this.INSTRUCTION_TYPES) {
      const parsedInstruction = type.parse(instruction);

      if (!!parsedInstruction) return parsedInstruction;
    }

    return null
  }
}

