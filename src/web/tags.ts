import * as vscode from "vscode";

export interface LogYouTag {
  tagName: string;
  fullLineDecoratorType: vscode.TextEditorDecorationType;
  decoratorType: vscode.TextEditorDecorationType;
  friendlyName: string;
}
function makeDecorator(
  key: string,
  overviewRulerColor: string,
  borderColor: string,
  darkBackgroundColor: string,
  lightBackgroundColor: string,
  friendlyName: string
): TagDecoration {
  return {
    key: key,
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
      overviewRulerLane:
        vscode.OverviewRulerLane.Center | vscode.OverviewRulerLane.Right,
      dark: {
        backgroundColor: darkBackgroundColor,
      },
      light: {
        backgroundColor: lightBackgroundColor,
      },
    }),
    friendlyName: friendlyName,
  };
}

interface TagDecoration {
  selected?: boolean,
  key: string,
  fullLineDecoratorType: vscode.TextEditorDecorationType;
  decoratorType: vscode.TextEditorDecorationType;
  friendlyName: string;
}

const tags: {
  [key: string]: TagDecoration;
} = tagDecorationsToObject([
  makeDecorator("yellow", "#ffee0090", "#ffd900", "#1f1a0a90", "#fafce390", "Yellow"),
  makeDecorator("orange", "#ff7b0090", "#ff6600", "#1f120a90", "#fce3e990", "Orange"),
  makeDecorator("aqua", "#00ff8890", "#00ff88", "#0a1f1990", "#e3fcf890", "Acqua"),
  makeDecorator("red", "#ff000090", "#ff0000", "#1f0a0f90", "#fce3e990", "Red"),
  makeDecorator("green", "#00ff0090", "#00ff00", "#112c1990", "#d5fbe090", "Green"),
  makeDecorator("blue", "#0000ff90", "#0000ff", "#181f3590", "#d2d9ef90", "Blue"),
  makeDecorator("violet", "#ff00ff90", "#ff00ff", "#26183590", "#e9d2ef90", "Violet")
]);

export function getTagNames() {
  return Object.keys(tags);
}

export function getTags() {
  return Object.keys(tags).map(key => tags[key]);
}

export function getTag(tagName: string): LogYouTag {
  return {
    tagName: tagName,
    decoratorType: tags[tagName].decoratorType,
    fullLineDecoratorType: tags[tagName].fullLineDecoratorType,
    friendlyName: tags[tagName].friendlyName,
  };
}
function tagDecorationsToObject(decorations: TagDecoration[]): { [key: string]: TagDecoration; } {
  const dict: { [key: string]: TagDecoration } = {};

  for (let tag of decorations) {
    dict[tag.key] = tag;
  }

  return dict;
}

