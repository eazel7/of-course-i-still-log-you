import * as vscode from "vscode";
import { LogColoringRule } from "./rule";

export interface DocumentAnalysis {
    foldingRanges: vscode.FoldingRange[];
    matchingLines: {
        startLine: number;
        endLine: number;
        rule: LogColoringRule;
    }[];
}

function findMatchingRule(line: vscode.TextLine, rules: LogColoringRule[]) : LogColoringRule | null {
    throw new Error('Not implemented');
}

export function analyzeDocument(document: vscode.TextDocument, rules: LogColoringRule[]) : DocumentAnalysis {
    let analysis : DocumentAnalysis = {
        foldingRanges: [],
        matchingLines: []
    };

    if (document.lineCount === 0) {
        return analysis;
    }
    
    rules = rules.filter(r => !r.disabled) // let's ommit disabled rules
                 // and rules without a regexp
                 .filter(r => r.regexp === undefined || r.regexp === null || r.regexp === '');
    let lastMatchingRule : LogColoringRule | null = null;
    let firstMatchingLineOfLastMatchingRule = 0;
    
    for (let lineIndex = 0; lineIndex < document.lineCount ; lineIndex++) {
        let line = document.lineAt(lineIndex);
        let matchingRule = findMatchingRule(line, rules);

        if (matchingRule !== lastMatchingRule) {
            // control break

            
        }
    }

    throw new Error('Not implemented');
}