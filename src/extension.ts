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
  context.subscriptions.push(
    vscode.commands.registerCommand("logyouview.openjson", async () => {
      let settingsUri = await provider.dataProvider.getSettingsUri();
      try {
        await vscode.workspace.fs.stat(settingsUri);
      } catch {
        await provider.dataProvider.saveToDisk();
      }

      await vscode.commands.executeCommand("vscode.open", settingsUri);
    })
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

  const logyouScheme = "logyou";
  const refreshDocument = new vscode.EventEmitter<vscode.Uri>();

  const logyouReadonlyProvider = new (class
    implements vscode.TextDocumentContentProvider
  {
    // emitter and its event
    onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
    onDidChange = this.onDidChangeEmitter.event;

    constructor() {
      refreshDocument.event((e) => {
        this.onDidChangeEmitter.fire(e);
      });
    }

    provideTextDocumentContent(
      uri: vscode.Uri,
      token: vscode.CancellationToken
    ): vscode.ProviderResult<string> {
      return new Promise((resolve, reject) => {
        vscode.workspace
          .openTextDocument(uri.with({ scheme: uri.fragment, fragment: "" }))
          .then(
            (doc) => {
              let lines = provider.getDocumentLinesForExport(doc);

              resolve(lines);
            },
            () => reject()
          );
      });
    }
  })();

  context.subscriptions.push(
    vscode.workspace.registerTextDocumentContentProvider(
      logyouScheme,
      logyouReadonlyProvider
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("logyouview.exportLines", async () => {
      const editor = vscode.window.activeTextEditor;

      if (editor === undefined) {
        return;
      }

      const uri = editor.document.uri.with({
        scheme: logyouScheme,
        fragment: editor.document.uri.scheme,
      });
      let visibleEditor = vscode.window.visibleTextEditors.filter(e => e.document.uri.toString() === uri.toString())[0];

      if (visibleEditor !== undefined) {
        refreshDocument.fire(uri);
        return;
      }

      const doc = await vscode.workspace.openTextDocument(uri); // calls back into the provider
      await vscode.window.showTextDocument(doc, {
        preview: false,
      });
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "logyouview.moveUp",
      (rule: LogColoringRule) => {
        let previousIndex = dataProvider.rules.indexOf(rule) - 1;
        if (previousIndex === -1) {
          return;
        }

        let previous = dataProvider.rules[previousIndex];

        dataProvider.rules.splice(previousIndex, 1, rule, previous);
        dataProvider.rules.splice(dataProvider.rules.lastIndexOf(rule), 1);
        dataProvider.saveToDisk().then(() => updateDecorations());
      }
    )
  );
  vscode.window.onDidChangeVisibleTextEditors(
    () => {
      updateDecorations();
    },
    null,
    context.subscriptions
  );

  vscode.workspace.onDidChangeTextDocument(
    (event) => {
      let editor = vscode.window.visibleTextEditors.filter(
        (e) => e.document === event.document
      )[0];
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
