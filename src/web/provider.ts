import * as vscode from "vscode";
import { OfCourseIStillLogYouTreeDataProvider } from "./data-provider";
import { getTag, getTagNames } from "./tags";

export class LogYouProvider {
  dataProvider: OfCourseIStillLogYouTreeDataProvider;

  constructor(dataProvider: OfCourseIStillLogYouTreeDataProvider) {
    this.dataProvider = dataProvider;
  }

  getDocumentDecorationList(document: vscode.TextDocument): {
    decoratorType: vscode.TextEditorDecorationType;
    options: vscode.DecorationOptions[];
  }[] {
    let regexps = this.dataProvider.rules
      .filter((r) => !!r.regexp)
      .filter((r) => !r.disabled)
      .map((r) => ({
        rule: r,
        regexp: RegExp(r.regexp),
        decorationType: getTag(r.tag).decoratorType
      }));
    let list: {
      decoratorType: vscode.TextEditorDecorationType;
      options: vscode.DecorationOptions[];
    }[] = [];

    for (let tagName of getTagNames()) {
      let tag = getTag(tagName);
      list.push({
        decoratorType: tag.decoratorType,
        options: []
      });
    }

    for (let i = 0; i < document.lineCount; i++) {
      for (let j = 0; j < regexps.length; j++) {
        if (regexps[j].regexp.test(document.lineAt(i).text)) {
          let decorator = list.filter(d => d.decoratorType === regexps[j].decorationType)[0];

          decorator.options.push({
            range: document.lineAt(i).range,
          });
          break;
        }
      }
    }

    return list;
  }
}
