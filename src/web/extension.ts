import * as vscode from "vscode";
import { OfCourseIStillLogYouTreeDataProvider } from "./data-provider";
import { buildEditCommand } from "./edit-command";
import { LogColoringRule } from "./rule";
import { LogYouSemanticTokensProvider } from "./semantic-provider";
import { getTagNames } from "./tag-names";

export function activate(context: vscode.ExtensionContext) {
  let dataProvider = new OfCourseIStillLogYouTreeDataProvider(context);
  let editViewsByRule: { [id: string]: vscode.WebviewPanel } = {};

  context.subscriptions.push(
    vscode.window.registerTreeDataProvider("logyouview", dataProvider)
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "logyouview.edit",
      buildEditCommand(editViewsByRule, dataProvider)
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

  let legend = new vscode.SemanticTokensLegend(getTagNames(), []);
  let semanticProvider = new LogYouSemanticTokensProvider(legend, dataProvider);

  context.subscriptions.push(
    vscode.languages.registerDocumentSemanticTokensProvider(
      "logyou",
      semanticProvider,
      legend
    )
  );

  dataProvider.onRefresh = () => {
    semanticProvider.refresh();
  };

  dataProvider.loadFromDisk().then(() => {
    semanticProvider.refresh();
  });
}

export function deactivate() {}
