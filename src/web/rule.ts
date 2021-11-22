import * as vscode from "vscode";

export class LogColoringRule extends vscode.TreeItem {
    onUpdate: () => void;
    disabled: boolean;
    update() {
      this.onUpdate();
    }
    regexp: string;
    tag: string;
  
    constructor(
      id: string,
      label: string,
      regexp: string,
      disabled: boolean,
      tag: string,
      onUpdate: () => void
    ) {
      super(label, vscode.TreeItemCollapsibleState.None);
  
      this.id = id;
      this.regexp = regexp;
      this.onUpdate = onUpdate;
      this.tag = tag;
      this.disabled = disabled;
    }
  
    id: string;
  }