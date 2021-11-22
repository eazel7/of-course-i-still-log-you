import * as vscode from "vscode";
import { OfCourseIStillLogYouTreeDataProvider } from "./data-provider";
import { LogColoringRule } from "./rule";

export class LogYouProvider
  implements vscode.DocumentSemanticTokensProvider, vscode.FoldingRangeProvider
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

  private _onDidChangeFoldingRanges = new vscode.EventEmitter<void>();
  onDidChangeFoldingRanges = this._onDidChangeFoldingRanges.event;

  provideFoldingRanges(
    document: vscode.TextDocument,
    context: vscode.FoldingContext,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.FoldingRange[]> {
    let foldingRanges: vscode.FoldingRange[] = [];
    let rulesByLine: (LogColoringRule | null)[] = [];

    let regexps = this.dataProvider.rules
      .filter((r) => !!r.regexp)
      .filter((r) => !r.disabled)
      .map((r) => ({
        rule: r,
        regexp: RegExp(r.regexp),
      }));

    for (let i = 0; i < document.lineCount; i++) {
      let matched: LogColoringRule | null = null;

      for (let j = 0; j < regexps.length; j++) {
        if (regexps[j].regexp.test(document.lineAt(i).text)) {
          matched = regexps[j].rule;
          break;
        }
      }

      rulesByLine.push(matched);
    }
    rulesByLine.push(null);

    let firstLine = 0;

    for (let i = 1; i < rulesByLine.length; i++) {
      if (rulesByLine[i - 1] !== rulesByLine[i]) {
        if (i - firstLine > 0) {
          foldingRanges.push(
            new vscode.FoldingRange(
              firstLine,
              i - 1,
              vscode.FoldingRangeKind.Region
            )
          );
        }

        firstLine = i;
      }
    }

    return foldingRanges;
  }

  private _onDidChangeSemanticTokens: vscode.EventEmitter<void> =
    new vscode.EventEmitter<void>();
  onDidChangeSemanticTokens = this._onDidChangeSemanticTokens.event;

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
    this._onDidChangeFoldingRanges.fire();
  }
}
