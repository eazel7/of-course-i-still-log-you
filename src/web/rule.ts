import * as vscode from "vscode";

/**
 * Log coloring rule
 */
export class LogColoringRule extends vscode.TreeItem {
  onUpdate: () => void = () => {};
  disabled: boolean;
  highlightFullLine: boolean;
  /**
   * String representation of a regular expression
   */
  regexp: string;
  /**
   * Log coloring tag to use, see "tags.ts"
   */
  tag: string;
  caseInsensitive: boolean;

  constructor(
    id: string,
    label: string,
    regexp: string,
    disabled: boolean,
    tag: string,
    highlightFullLine: boolean,
    caseInsensitive: boolean,
    onUpdate: () => void
  ) {
    super(label, vscode.TreeItemCollapsibleState.None);

    super.id = id;
    this.regexp = regexp;
    this.disabled = disabled;
    this.tag = tag;
    this.highlightFullLine = highlightFullLine;
    this.caseInsensitive = caseInsensitive;
    this.onUpdate = onUpdate;
  }

  hasValidRegexp(): boolean {
    try {
      if (this.regexp.trim() === "") {
        return false;
      }

      new RegExp(this.regexp);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Triggers the onUpdate listener
   */
  update() {
    this.onUpdate();
  }
}
