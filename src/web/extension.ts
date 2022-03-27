import * as vscode from "vscode";
import { OfCourseIStillLogYouTreeDataProvider } from "./data-provider";
import { buildEditCommand } from "./edit-command";
import { LogColoringRule } from "./rule";
import { LogYouProvider } from "./provider";

/** activation function
 * 
 * @param context VS Code extension context
 */
export function activate(context: vscode.ExtensionContext) {
  let dataProvider = new OfCourseIStillLogYouTreeDataProvider(context);
  let editViewsByRule: { [id: string]: vscode.WebviewPanel } = {};

  /** updates the context with the new list of disabled/enabled rule ids */
  let updateDisabledRulesContext = () => {
    const disabledRules = dataProvider.rules.filter(r => r.disabled);

    // this is working but has no effect as I may be missing something in the "when" clause for the commands in package.json
    vscode.commands.executeCommand('setContext', 'ofcourseistilllogyou.disabledRules', disabledRules.map(r => r.id));
  };

  // deregister the data provider once the plugin is deactivated
  context.subscriptions.push(
    // register the data provider for the rules list
    vscode.window.registerTreeDataProvider("logyouview", dataProvider)
  );

  // deregister the edit command once the plugin is deactivated
  context.subscriptions.push(
    // register edit command
    vscode.commands.registerCommand(
      "logyouview.edit",
      buildEditCommand(editViewsByRule, dataProvider, context)
    )
  );

  // deregister the add rule command once the plugin is deactivated
  context.subscriptions.push(
    // register the add rule command
    vscode.commands.registerCommand("logyouview.add", () => {
      // create a new rule
      let rule = dataProvider.addNewEntry();

      // open the edit rule pane for that recently added rule
      vscode.commands.executeCommand("logyouview.edit", rule);
    })
  );

  // deregister the toggle disabled rule command once the plugin is deactivated
  context.subscriptions.push(
    // register the toggle disabled command
    vscode.commands.registerCommand(
      "logyouview.toggleDisabled",
      (rule: LogColoringRule) => {
        // toglle the disable state on that rule via the data provider
        dataProvider.toggleDisabled(rule);

        // is there any edit view open for that rule?
        if (editViewsByRule[rule.id!!]) {
          // notify the webview that the disabled status has changed
          editViewsByRule[rule.id!!].webview.postMessage({
            command: "disabledchanged",
            newValue: rule.disabled,
          });

          // update the disabled/enabled list of Ids in the context
          updateDisabledRulesContext();
        }
      }
    )
  );

  // deregister the Open JSON command once the extension is deactivated
  context.subscriptions.push(
    // register the Open JSON command
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
    implements vscode.TextDocumentContentProvider {
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
        dataProvider.saveToDisk().then(() => {
          updateDecorations();
          updateDisabledRulesContext();
        });
      }
    )
  );
  vscode.window.onDidChangeVisibleTextEditors(
    () => {
      updateDecorations();
      updateDisabledRulesContext();
    },
    null,
    context.subscriptions
  );

  vscode.workspace.onDidChangeTextDocument(
    (event) => {
      // look for the text editor that has changed
      let editor = vscode.window.visibleTextEditors.filter(
        (e) => e.document === event.document
      )[0];

      // if there wasn't any, we have nothing to do then
      if (!editor) {
        return;
      }

      // check the new list of highlights that should be done for the document
      let decorators = provider.getDocumentDecorationList(event.document);

      // set them all for the editor of the changed document
      for (let decorator of decorators) {
        editor.setDecorations(decorator.decoratorType, decorator.options);
      }
    },
    null,
    context.subscriptions
  );

  // if the rules changed, then we should update the highlights
  dataProvider.onRefresh = () => {
    updateDecorations();
    updateDisabledRulesContext();
  };

  // load the saved rules for the first time, then do the same as if they would have been refreshed
  dataProvider.loadFromDisk().then(() => {
    updateDecorations();
    updateDisabledRulesContext();
  });
}

export function deactivate() { }

