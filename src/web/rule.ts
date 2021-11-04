import * as vscode from "vscode";

export class LogColoringRule extends vscode.TreeItem {
    onUpdate: () => void;
    disabled: boolean;
    update() {
      this.onUpdate();
    }
    regexp: string = "";
    tag: string = "tag1";
  
    constructor(
      id: string,
      label: string,
      regexp: string,
      disabled: boolean,
      onUpdate: () => void
    ) {
      super(label, vscode.TreeItemCollapsibleState.None);
  
      this.id = id;
      this.regexp = regexp;
      this.onUpdate = onUpdate;
      this.disabled = disabled;
    }
  
    id: string;
  }