import * as vscode from "vscode";
import { Buffer } from "buffer";
import { Uri } from "vscode";

class LogColoringRule extends vscode.TreeItem {
  onUpdate: () => void;
  update() {
    this.onUpdate();
  }
  regexp: string = "";
  tag: string = "tag1";

  constructor(id: string, label: string, regexp: string, onUpdate: () => void) {
    super(label, vscode.TreeItemCollapsibleState.None);

    this.id = id;
    this.regexp = regexp;
    this.onUpdate = onUpdate;
  }

  id: string;
}

class OfCourseIStillLogYouTreeDataProvider
  implements vscode.TreeDataProvider<LogColoringRule>
{
  deleteRule(rule: LogColoringRule) {
    this.rules.splice(this.rules.indexOf(rule), 1);
    this.saveToDisk().then(() => {
      this.refresh();
      this.onRefresh();
    });
  }
  lastId = 1;
  onRefresh: () => void = () => {};

  addNewEntry() {
    let rule = new LogColoringRule(
      (++this.lastId).toString(),
      `Rule ${this.lastId.toString()}`,
      "",
      () => {
        this.refresh();
        this.onRefresh();
      }
    );
    this.rules.push(rule);

    this.saveToDisk();
    this.refresh();
    return rule;
  }

  loadFromDisk(): Thenable<void> {
    return (async () => {
      try {
        let baseUri = this.context.storageUri as Uri;
        await vscode.workspace.fs.createDirectory(baseUri);
        let settingsUri = baseUri.with({
          path: baseUri.path + "/settings.json",
        });

        let contents = await vscode.workspace.fs.readFile(settingsUri);
        let asJson = new TextDecoder().decode(contents);

        try {
          let rulesInSettings: {
            lastId: number;
            rules: {
              id: string;
              label: string;
              regexp: string;
            }[];
          } = JSON.parse(asJson);

          this.lastId = rulesInSettings.lastId;
          rulesInSettings.rules.forEach((r) => {
            this.rules.push(
              new LogColoringRule(r.id, r.label, r.regexp, () => {
                this.refresh();
                this.onRefresh();
              })
            );
          });
        } finally {
          this.refresh();
        }
      } catch (e) {}
    })();
  }

  saveToDisk(): Thenable<void> {
    if (this.context.storageUri !== undefined) {
      return (async () => {
        let baseUri = this.context.storageUri as Uri;
        await vscode.workspace.fs.createDirectory(baseUri);
        let settingsUri = baseUri.with({
          path: baseUri.path + "/settings.json",
        });

        await vscode.workspace.fs.writeFile(
          settingsUri,
          Buffer.from(
            JSON.stringify({
              lastId: this.lastId,
              rules: this.rules.map((r) => ({
                id: r.id,
                regexp: r.regexp,
                label: r.label,
                tag: r.tag,
              })),
            }),
            "utf8"
          )
        );

        this.refresh();
      })();
    } else {
      return Promise.resolve();
    }
  }
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }
  rules: LogColoringRule[] = [];

  private _onDidChangeTreeData: vscode.EventEmitter<
    LogColoringRule | undefined | void
  > = new vscode.EventEmitter<LogColoringRule | undefined | void>();
  onDidChangeTreeData: vscode.Event<void | LogColoringRule | undefined> =
    this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(
    element: LogColoringRule
  ): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(
    element?: LogColoringRule
  ): vscode.ProviderResult<LogColoringRule[]> {
    return this.rules;
  }
}

class LogYouSemanticTokensProvider
  implements vscode.DocumentSemanticTokensProvider
{
  legend: vscode.SemanticTokensLegend;
  dataProvider: OfCourseIStillLogYouTreeDataProvider;

  constructor(
    legend: vscode.SemanticTokensLegend,
    dataProvider: OfCourseIStillLogYouTreeDataProvider
  ) {
    this.legend = legend;
    this.dataProvider = dataProvider;
  }

  private _onDidChangeFoldingRanges: vscode.EventEmitter<void> =
    new vscode.EventEmitter<void>();
  onDidChangeSemanticTokens: vscode.Event<void> =
    this._onDidChangeFoldingRanges.event;

  provideDocumentSemanticTokens(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.SemanticTokens> {
    const builder = new vscode.SemanticTokensBuilder(this.legend);

    let regexps = this.dataProvider.rules
      .filter((r) => !!r.regexp)
      .map((r) => ({
        rule: r,
        regexp: RegExp(r.regexp),
      }));

    for (let i = 0; i < document.lineCount; i++) {
      for (let j = 0; j < regexps.length; j++) {
        if (regexps[j].regexp.test(document.lineAt(i).text)) {
          builder.push(document.lineAt(i).range, regexps[j].rule.tag);

          break;
        }
      }
    }

    return builder.build();
  }

  refresh() {
    this._onDidChangeFoldingRanges.fire();
  }
}

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
              (rule.label = e.label),
                (rule.regexp = e.regexp),
                (rule.tag = e.selectedtag);
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

        view.webview.html = `<!DOCTYPE html>
			  <html lang="en">
			  <head>
				  <meta charset="UTF-8">
				  <meta name="viewport" content="width=device-width, initial-scale=1.0">
				  <title>Cat Coding</title>
			  </head>
			  <body>
					<div><label>Rule name: <input type="text" id="rulelabel" value="${rule.label}" /></label></div>
					<div><label>Regexp: <input type="text" id="ruleregexp" value="${rule.regexp}" /></label></div>
					<div><label>Tag:
            <select id="selectedtag" value="${rule.tag}">
              <option value="tag1">Tag 1</option>
              <option value="tag2">Tag 2</option>
              <option value="tag3">Tag 3</option>
            </select></label></div>
			      	<div><input type="button" id="savebutton" value="Save" /></div>
              <div><input type="button" id="deletebutton" value="Delete" /></div>
				  <script>
				  (function() {
					  const vscode = acquireVsCodeApi();

					  document.getElementById('deletebutton').addEventListener('click', function () {
						  vscode.postMessage({
							  command: 'delete'
						  });
            });
					  
					  document.getElementById('savebutton').addEventListener('click', function () {
						let label = document.getElementById('rulelabel').value;
						let regexp = document.getElementById('ruleregexp').value;
						let selectedtag = document.getElementById('selectedtag').value;
						  vscode.postMessage({
							  command: 'save',
							  label: label,
							  regexp: regexp,
							  selectedtag: selectedtag
						  });
						});
				  })();
				  </script>
			  </body>
			  </html>`;
      }
    }
  );

  let legend = new vscode.SemanticTokensLegend(["tag1", "tag2", "tag3"], []);
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
}

export function deactivate() {}
