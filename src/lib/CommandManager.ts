/**
 * Command interface representing an executable action which can be undone.
 */
export interface Command {
  execute: () => void;
  undo: () => void;
}

/**
 * A centralized manager for executing commands and handling undo/redo operations.
 */
class CommandManager {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];

  /**
   * Execute a command and add it to the undo stack.
   * Clears the redo stack.
   */
  executeCommand(command: Command): void {
    command.execute();
    this.undoStack.push(command);
    this.redoStack = [];
  }

  /**
   * Undo the last executed command.
   */
  undo(): void {
    const command = this.undoStack.pop();
    if (command) {
      command.undo();
      this.redoStack.push(command);
    }
  }

  /**
   * Redo the last undone command.
   */
  redo(): void {
    const command = this.redoStack.pop();
    if (command) {
      command.execute();
      this.undoStack.push(command);
    }
  }

  /**
   * Clear the command history.
   */
  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }
}

// Export a singleton instance of CommandManager
const commandManager = new CommandManager();
export default commandManager; 