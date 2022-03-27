import { Uri } from "vscode";
import { Buffer } from "buffer";
import * as vscode from "vscode";
import { LogColoringRule } from "./rule";

/**
 * data provider for the rules tree view
 */
export class OfCourseIStillLogYouTreeDataProvider
  implements vscode.TreeDataProvider<LogColoringRule>
{
  /**
   * Turns a rule on or off, then informs the update
   * @param rule Rule to toggle
   */
  toggleDisabled(rule: LogColoringRule) {
    // toggle the disabled value
    rule.disabled = !rule.disabled;

    // save to disk
    this.saveToDisk().then(() => {
      // then notify the provider that a refresh is necessary
      this.refresh();
      // and trigger the events that comes after
      this.onRefresh();
    });
    
    // notify that the rule has been updated
    rule.update();
  }

  /**
   * Removes a rule, then informs the update
   * @param rule Rule to toggle
   */
  deleteRule(rule: LogColoringRule) {
    // remove the rule from the rules array
    this.rules.splice(this.rules.indexOf(rule), 1);
    
    // then save to disk
    this.saveToDisk().then(() => {
      // then notify the provider that a refresh is necessary
      this.refresh();
      // and trigger the events that comes after
      this.onRefresh();
    });
  }

  // start with Id 1
  lastId = 1;
  // the default onRefresh handler does nothing
  onRefresh: () => void = () => {};

  /**
   * creates a new rule, adds it to the list and saves the list to disk
   * 
   * @returns the newly created rule
   */
  addNewEntry() {
    let rule = new LogColoringRule(
      // yeah, we're using an ID
      (++this.lastId).toString(),
      `Rule ${this.lastId.toString()}`,
      "",
      false,
      "red",
      true,
      false,
      () => {
        this.saveToDisk();
        this.refresh();
        this.onRefresh();
      }
    );
    this.rules.push(rule);

    this.saveToDisk();
    this.refresh();
    return rule;
  }

  /**
   * instructs the data provider to load the rules that were saved
   * 
   * @returns a promise that completes when the rules finishes loading
   */
  loadFromDisk(): Thenable<void> {
    return (async () => {
      try {
        let settingsUri = await this.getSettingsUri();

        let contents = await vscode.workspace.fs.readFile(settingsUri);
        let asJson = new TextDecoder().decode(contents);

        try {
          let rulesInSettings: {
            lastId: number;
            rules: {
              id: string;
              label: string;
              regexp: string;
              disabled?: boolean;
              tag: string;
              highlightFullLine: boolean;
              caseInsensitive: boolean;
            }[];
          } = JSON.parse(asJson);

          this.lastId = rulesInSettings.lastId;
          rulesInSettings.rules.forEach((r) => {
            this.rules.push(
              new LogColoringRule(
                r.id,
                r.label,
                r.regexp,
                r.disabled || false,
                r.tag,
                r.highlightFullLine,
                r.caseInsensitive,
                () => {
                  this.saveToDisk();
                  this.refresh();
                  this.onRefresh();
                }
              )
            );
          });
        } finally {
          this.refresh();
        }
      } catch (e) {}
    })();
  }

  /**
   * saves the changes
   * 
   * @returns a promise that succeeds when the saving operation completes, fails otherwise
   */
  saveToDisk(): Thenable<void> {
    if (this.context.storageUri !== undefined) {
      return (async () => {
        let settingsUri = await this.getSettingsUri();

        await vscode.workspace.fs.writeFile(
          settingsUri,
          Buffer.from(
            JSON.stringify(
              {
                lastId: this.lastId,
                rules: this.rules.map((r) => ({
                  id: r.id,
                  regexp: r.regexp,
                  label: r.label,
                  tag: r.tag,
                  disabled: r.disabled,
                  highlightFullLine: r.highlightFullLine,
                  caseInsensitive: r.caseInsensitive
                })),
              },
              // let's use a pretty JSON format
              // so it's easier to copy/paste/edit
              null,
              2
            ),
            "utf8"
          )
        );

        this.refresh();
      })();
    } else {
      return Promise.resolve();
    }
  }

  async getSettingsUri(): Promise<Uri> {
    let baseUri = this.context.storageUri as Uri;
    await vscode.workspace.fs.createDirectory(baseUri);
    return baseUri.with({
      path: baseUri.path + "/settings.json",
    });
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

  /** return a specific element,
   * the element itself inherits from TreeItem
   */
  getTreeItem(
    element: LogColoringRule
  ): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  /** return the rules */
  getChildren(
    element?: LogColoringRule
  ): vscode.ProviderResult<LogColoringRule[]> {
    return this.rules;
  }
}
