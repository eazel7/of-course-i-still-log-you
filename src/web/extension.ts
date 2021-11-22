import * as vscode from "vscode";
import { OfCourseIStillLogYouTreeDataProvider } from "./data-provider";
import { buildEditCommand } from "./edit-command";
import { LogColoringRule } from "./rule";
import { LogYouProvider } from "./provider";
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
  let provider = new LogYouProvider(legend, dataProvider);

  context.subscriptions.push(
    vscode.languages.registerDocumentSemanticTokensProvider(
      "logyou",
      provider,
      legend
    )
  );

  context.subscriptions.push(
    vscode.languages.registerFoldingRangeProvider("logyou", provider)
  );

  dataProvider.onRefresh = () => {
    provider.refresh();
  };

  dataProvider.loadFromDisk().then(() => {
    provider.refresh();
  });
}

export function deactivate() {}
