import * as assert from "assert";

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from "vscode";
import { analyzeDocument } from "../../analyzer";
import { LogColoringRule } from "../../rule";

suite("Web Extension Test Suite", () => {
  vscode.window.showInformationMessage("Start all tests.");

  function makeFakeDocument(text: string): vscode.TextDocument {
    let lines = text.split("\n");
    let textLines: vscode.TextLine[] = [];
    let nonWhitespaceRegex = RegExp("[^-s]");

    for (let line in lines) {
      let nonWhitespace = nonWhitespaceRegex.exec(line);

      let indexOfFirstNonWhitespaceline =
        nonWhitespace != null ? line.indexOf(nonWhitespace[0]) : -1;

      let textLine: vscode.TextLine = {
        lineNumber: 0,
        text: line,
        range: new vscode.Range(
          new vscode.Position(textLines.length, 0),
          new vscode.Position(textLines.length, line.length)
        ),
        rangeIncludingLineBreak: new vscode.Range(
          new vscode.Position(textLines.length, 0),
          new vscode.Position(textLines.length, line.length + 1)
        ),
        firstNonWhitespaceCharacterIndex: indexOfFirstNonWhitespaceline,
        isEmptyOrWhitespace: nonWhitespace !== null,
      };

      textLines.push(textLine);
    }

    let document: vscode.TextDocument = {
      uri: vscode.Uri.parse("file:///tmp/somefile"),
      fileName: "somefile",
      isUntitled: false,
      languageId: "logyou",
      version: 0,
      isDirty: false,
      isClosed: false,
      save: function (): Thenable<boolean> {
        return Promise.resolve(false);
      },
      eol: vscode.EndOfLine.CRLF,
      lineCount: 0,
      lineAt: function (
        lineNumberOrPosition: number | vscode.Position
      ): vscode.TextLine {
        let lineNumber =
          lineNumberOrPosition instanceof Number
            ? (lineNumberOrPosition as number)
            : (lineNumberOrPosition as vscode.Position).line;

        let line: vscode.TextLine = {
          lineNumber: lineNumber,
          text: lines[lineNumber],
          range: textLines[lineNumber].range,
          rangeIncludingLineBreak:
            textLines[lineNumber].rangeIncludingLineBreak,
          firstNonWhitespaceCharacterIndex:
            textLines[lineNumber].firstNonWhitespaceCharacterIndex,
          isEmptyOrWhitespace: textLines[lineNumber].isEmptyOrWhitespace,
        };
        return line;
      },
      offsetAt: function (position: vscode.Position): number {
        let cummulative = 0;
        for (let line in textLines.slice(0, position.line)) {
          cummulative += line.length + 1;
        }

        return position.character + cummulative;
      },
      positionAt: function (offset: number): vscode.Position {
        throw new Error("Function not implemented.");
      },
      getText: function (range?: vscode.Range): string {
        throw new Error("Function not implemented.");
      },
      getWordRangeAtPosition: function (
        position: vscode.Position,
        regex?: RegExp
      ): vscode.Range | undefined {
        throw new Error("Function not implemented.");
      },
      validateRange: function (range: vscode.Range): vscode.Range {
        throw new Error("Function not implemented.");
      },
      validatePosition: function (position: vscode.Position): vscode.Position {
        throw new Error("Function not implemented.");
      },
    };

    return document;
  }

  test("Analizes empty document", () => {
    let rules: LogColoringRule[] = [];
    let document = makeFakeDocument("aaa\naaa\nbbb\nccc");
    let analysis = analyzeDocument(document, rules);

    assert(analysis.foldingRanges.length === 1);
    assert(analysis.foldingRanges[0].start === 0);
    assert(analysis.foldingRanges[0].end === 3);
    assert(analysis.foldingRanges[0].kind === vscode.FoldingRangeKind.Region);

    assert(analysis.matchingLines[0].startLine === 0);
    assert(analysis.matchingLines[0].endLine === 3);
    assert(analysis.matchingLines[0].rule === null);
  });
});
