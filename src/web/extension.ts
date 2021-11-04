import * as vscode from "vscode";
import { OfCourseIStillLogYouTreeDataProvider } from "./data-provider";
import { buildHtml } from "./edit-rule-html";
import { LogColoringRule } from "./rule";
import { LogYouSemanticTokensProvider } from "./semantic-provider";

export function activate(context: vscode.ExtensionContext) {
  let dataProvider = new OfCourseIStillLogYouTreeDataProvider(context);

  let dataProviderDisposable = vscode.window.registerTreeDataProvider(
    "logyouview",
    dataProvider
  );

  let addCommand = vscode.commands.registerCommand("logyouview.add", () => {
    let rule = dataProvider.addNewEntry();
    vscode.commands.executeCommand("logyouview.edit", rule);
  });
  let toggleDisabledCommand = vscode.commands.registerCommand(
    "logyouview.toggleDisabled",
    (rule: LogColoringRule) => {
      dataProvider.toggleDisabled(rule);
    }
  );

  let editViewsByRule: { [id: string]: vscode.WebviewPanel } = {};
  let editCommand = vscode.commands.registerCommand(
    "logyouview.edit",
    (rule: LogColoringRule) => {
      let existingView = editViewsByRule[rule.id];
      if (existingView !== undefined) {
        existingView.reveal(existingView.viewColumn);
      } else {
        let view = (editViewsByRule[rule.id] = vscode.window.createWebviewPanel(
          "logyoueditruleview",
          "Edit rule",
          vscode.ViewColumn.Two,
          {
            enableScripts: true,
            retainContextWhenHidden: true,
          }
        ));

        view.webview.onDidReceiveMessage((e) => {
          if (!e) {
            return;
          }

          switch (e.command) {
            case "save":
              rule.label = e.label;
              rule.regexp = e.regexp;
              rule.tag = e.selectedtag;
              rule.disabled = e.disabled;
              rule.update();
              break;
            case "delete":
              dataProvider.deleteRule(rule);
              view.dispose();
              break;
          }
        });

        view.onDidDispose(() => {
          delete editViewsByRule[rule.id];
        });

        view.webview.html = buildHtml(rule);
      }
    }
  );

  let legend = new vscode.SemanticTokensLegend(
    [
      "tag1",
      "tag2",
      "tag3",
      "tag4",
      "tag5",
      "tag6",
      "tag7",
      "tag8",
      "tag9",
      "invisible",
    ],
    []
  );
  let semanticProvider = new LogYouSemanticTokensProvider(legend, dataProvider);
  let semanticProviderDisposable =
    vscode.languages.registerDocumentSemanticTokensProvider(
      "logyou",
      semanticProvider,
      legend
    );

  dataProvider.onRefresh = () => {
    semanticProvider.refresh();
  };

  dataProvider.loadFromDisk().then(() => {
    semanticProvider.refresh();
  });

  context.subscriptions.push(semanticProviderDisposable);
  context.subscriptions.push(dataProviderDisposable);
  context.subscriptions.push(editCommand);
  context.subscriptions.push(addCommand);
  context.subscriptions.push(toggleDisabledCommand);
}

export function deactivate() {}
