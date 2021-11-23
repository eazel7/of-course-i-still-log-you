import * as vscode from "vscode";
import { OfCourseIStillLogYouTreeDataProvider } from "./data-provider";
import { buildEditCommand } from "./edit-command";
import { LogColoringRule } from "./rule";
import { LogYouProvider } from "./provider";

export function activate(context: vscode.ExtensionContext) {
  let dataProvider = new OfCourseIStillLogYouTreeDataProvider(context);
  let editViewsByRule: { [id: string]: vscode.WebviewPanel } = {};

  context.subscriptions.push(
    vscode.window.registerTreeDataProvider("logyouview", dataProvider)
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "logyouview.edit",
      buildEditCommand(editViewsByRule, dataProvider, context)
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("logyouview.add", () => {
      let rule = dataProvider.addNewEntry();
      vscode.commands.executeCommand("logyouview.edit", rule);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "logyouview.toggleDisabled",
      (rule: LogColoringRule) => {
        dataProvider.toggleDisabled(rule);
        if (editViewsByRule[rule.id]) {
          editViewsByRule[rule.id].webview.postMessage({
            command: "disabledchanged",
            newValue: rule.disabled,
          });
        }
      }
    )
  );

  let provider = new LogYouProvider(dataProvider);

  function updateDecorations() {
    for (let editor of vscode.window.visibleTextEditors) {
      let decorators = provider.getDocumentDecorationList(editor.document);

      for (let decorator of decorators) {
        editor.setDecorations(decorator.decoratorType, decorator.options);
      }
    }
  }
  vscode.window.onDidChangeVisibleTextEditors(() => {
        updateDecorations();
      }, null, context.subscriptions);

  vscode.workspace.onDidChangeTextDocument(
    (event) => {
      let editor = vscode.window.visibleTextEditors.filter(e => e.document === event.document)[0];
      if (!editor) {
        return;
      }
      
      let decorators = provider.getDocumentDecorationList(event.document);
      
      for (let decorator of decorators) {
        editor.setDecorations(decorator.decoratorType, decorator.options);
      }
    },
    null,
    context.subscriptions
  );

  dataProvider.onRefresh = () => {
    updateDecorations();
  };

  dataProvider.loadFromDisk().then(() => {
    updateDecorations();
  });
}

export function deactivate() {}
