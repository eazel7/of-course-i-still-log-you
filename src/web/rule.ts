import * as vscode from "vscode";

export class LogColoringRule extends vscode.TreeItem {
  id: string;
  onUpdate: () => void;
  disabled: boolean;
  highlightFullLine: boolean;
  regexp: string;
  tag: string;

  constructor(
    id: string,
    label: string,
    regexp: string,
    disabled: boolean,
    tag: string,
    highlightFullLine: boolean,
    onUpdate: () => void
  ) {
    super(label, vscode.TreeItemCollapsibleState.None);

    this.id = id;
    this.regexp = regexp;
    this.onUpdate = onUpdate;
    this.tag = tag;
    this.highlightFullLine = highlightFullLine;
    this.disabled = disabled;
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
  update() {
    this.onUpdate();
  }
}
