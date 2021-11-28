import * as vscode from "vscode";
import * as common from "../extension";
import * as child_process from "child_process";

export function activate(context: vscode.ExtensionContext) {
  common.activate(context);

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "logyouview.parseOutput",
      async () => {
        const command = await vscode.window.showInputBox(
          {title: 'What command to run?'}
        );
        if (command !== undefined) {
          const cp = child_process.spawn(command, { stdio: 'pipe'});

          cp.once("close", () => {

          });
        };
      },
      null
    )
  );
}

export function deactivate() {
  common.deactivate();
}