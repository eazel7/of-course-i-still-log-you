import * as vscode from "vscode";
import { OfCourseIStillLogYouTreeDataProvider } from "./data-provider";
import { LogColoringRule } from "./rule";
import { getTag, getTagNames } from "./tags";

export class LogYouProvider {
  dataProvider: OfCourseIStillLogYouTreeDataProvider;

  constructor(dataProvider: OfCourseIStillLogYouTreeDataProvider) {
    this.dataProvider = dataProvider;
  }

  getDocumentLinesForExport(document: vscode.TextDocument) : string {
    let rules = this.getActiveValidRules();
    let documentLines = [];

    for (let i = 0; i < document.lineCount; i++) {
      for (let rule of rules) {
        let line = document.lineAt(i);
        if (rule.regexp.test(line.text)) {
          documentLines.push(line.text);
        }
      }
    }

    return documentLines.join('\n');
  }

  private getActiveValidRules(): {
    rule: LogColoringRule;
    regexp: RegExp;
    fullLineDecorationType: vscode.TextEditorDecorationType;
    decorationType: vscode.TextEditorDecorationType;
  }[] {
    return this.dataProvider.rules
      .filter((r) => r.hasValidRegexp())
      .filter((r) => !r.disabled)
      .map((r) => ({
        rule: r,
        regexp: new RegExp(
          r.regexp,
          (!r.highlightFullLine ? "g" : "") + (r.caseInsensitive ? "i" : "")
        ),
        fullLineDecorationType: getTag(r.tag).fullLineDecoratorType,
        decorationType: getTag(r.tag).decoratorType,
      }));
  }

  getDocumentDecorationList(document: vscode.TextDocument): {
    decoratorType: vscode.TextEditorDecorationType;
    options: vscode.DecorationOptions[];
  }[] {
    let regexps = this.getActiveValidRules();
    let list: {
      decoratorType: vscode.TextEditorDecorationType;
      options: vscode.DecorationOptions[];
    }[] = [];

    for (let tagName of getTagNames()) {
      let tag = getTag(tagName);

      // if VS code doesn't receive the decorator type
      // it does nothing with it then
      // we add them all of them with no matches at least
      // so if there are no matches VS code removes the old ones
      list.push(
        {
          decoratorType: tag.decoratorType,
          options: [],
        },
        {
          decoratorType: tag.fullLineDecoratorType,
          options: [],
        }
      );
    }

    for (let i = 0; i < document.lineCount; i++) {
      for (let j = 0; j < regexps.length; j++) {
        if (regexps[j].rule.highlightFullLine) {
          let decorator = list.filter(
            // won't repeat colors, so each 'tag' has two decoration types
            // full line here
            (d) => d.decoratorType === regexps[j].fullLineDecorationType
          )[0];

          let result = regexps[j].regexp.test(document.lineAt(i).text);
          if (result) {
            decorator.options.push({
              range: document.lineAt(i).range,
            });

            break;
          }
        } else {
          let decorator = list.filter(
            // not full line
            (d) => d.decoratorType === regexps[j].decorationType
          )[0];
          let results = document.lineAt(i).text.matchAll(regexps[j].regexp);

          for (let r of results) {
            decorator.options.push({
              range: new vscode.Range(
                new vscode.Position(i, r.index as number),
                new vscode.Position(i, (r.index as number) + r[0].length)
              ),
            });
          }
        }
      }
    }

    return list;
  }
}
