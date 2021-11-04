import * as vscode from "vscode";
import { OfCourseIStillLogYouTreeDataProvider } from "./data-provider";

export class LogYouSemanticTokensProvider
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

  private _onDidChangeSemanticTokens: vscode.EventEmitter<void> =
    new vscode.EventEmitter<void>();
  onDidChangeSemanticTokens: vscode.Event<void> =
    this._onDidChangeSemanticTokens.event;

  provideDocumentSemanticTokens(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.SemanticTokens> {
    const builder = new vscode.SemanticTokensBuilder(this.legend);

    let regexps = this.dataProvider.rules
      .filter((r) => !!r.regexp)
      .filter((r) => !r.disabled)
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
    this._onDidChangeSemanticTokens.fire();
  }
}

