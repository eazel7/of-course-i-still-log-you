import * as vscode from "vscode";

export interface LogYouTag {
  tagName: string;
  fullLineDecoratorType: vscode.TextEditorDecorationType;
  decoratorType: vscode.TextEditorDecorationType;
  friendlyName: string;
}
function makeDecorator(
  overviewRulerColor: string,
  borderColor: string,
  darkBackgroundColor: string,
  lightBackgroundColor: string,
  friendlyName: string
): {
  decoratorType: vscode.TextEditorDecorationType;
  fullLineDecoratorType: vscode.TextEditorDecorationType;
  friendlyName: string;
} {
  return {
    decoratorType: vscode.window.createTextEditorDecorationType({
      isWholeLine: false,
      rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
      overviewRulerColor: overviewRulerColor,
      overviewRulerLane: vscode.OverviewRulerLane.Left,
      dark: {
        backgroundColor: darkBackgroundColor,
      },
      light: {
        backgroundColor: lightBackgroundColor,
      },
      borderColor: borderColor,
      borderWidth: "1px",
      borderStyle: "solid",
    }),
    fullLineDecoratorType: vscode.window.createTextEditorDecorationType({
      isWholeLine: true,
      rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
      overviewRulerColor: overviewRulerColor,
      overviewRulerLane: vscode.OverviewRulerLane.Center | vscode.OverviewRulerLane.Right,
      dark: {
        backgroundColor: darkBackgroundColor,
      },
      light: {
        backgroundColor: lightBackgroundColor,
      }
    }),
    friendlyName: friendlyName,
  };
}

const tags: {
  [key: string]: {
    fullLineDecoratorType: vscode.TextEditorDecorationType;
    decoratorType: vscode.TextEditorDecorationType;
    friendlyName: string;
  };
} = {
  red: makeDecorator("#ff000090", "#ff0000", "#1f0a0f90", "#fce3e990", "Red"),
  green: makeDecorator(
    "#00ff0090",
    "#00ff00",
    "#112c1990",
    "#d5fbe090",
    "Green"
  ),
  blue: makeDecorator("#0000ff90", "#0000ff", "#181f3590", "#d2d9ef90", "Blue"),
  violet: makeDecorator(
    "#ff00ff90",
    "#ff00ff",
    "#26183590",
    "#e9d2ef90",
    "Violet"
  ),
};

export function getTagNames() {
  return Object.keys(tags);
}

export function getTag(tagName: string): LogYouTag {
  return {
    tagName: tagName,
    decoratorType: tags[tagName].decoratorType,
    fullLineDecoratorType: tags[tagName].fullLineDecoratorType,
    friendlyName: tags[tagName].friendlyName,
  };
}
