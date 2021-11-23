import { LogColoringRule } from "./rule";
import { getTagNames, getTag } from "./tags";

export function buildHtml(rule: LogColoringRule, codiconCss: string) {
  let tagNames = getTagNames();

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Of course I still log you</title>
    <link rel="stylesheet" type="text/css" href="${codiconCss}" />
    <style>
    label {
        display: block;
        margin-bottom: 1em;
    }

    input[type=text], select {
      display: block;
      margin-top: 0.3em;
      width: 100%;
      border: 1px solid;
      padding: 4px;
    }

    input[type=checkbox] {
      float: left;
      height: 0.8em;
    }
    </style>
</head>
<body>
      <div><label>Rule name: <input type="text" id="rulelabel" value="${
        rule.label
      }" /></label></div>
      <div><label>Regexp: <input type="text" id="ruleregexp" value="${
        rule.regexp
      }" /></label></div>
      <div><label>Disable: <input type="checkbox" id="ruledisabled" ${
        rule.disabled ? "checked" : ""
      } /></label></div>
      <div><label>Full line: <input type="checkbox" id="rulefullline" ${
        rule.highlightFullLine ? "checked" : ""
      } /></label></div>
      <div><label>Tag:
<select id="selectedtag" value="${rule.tag}">
${tagNames
  .map(
    (t) =>
      `<option ${rule.tag === t ? "selected " : ""} value=\"${t}\">${
        getTag(t).friendlyName
      }</option>`
  )
  .join("\n")}
</select></label></div>
<div><a href="javascript:" id="savebutton" style="
border: 1px solid;
padding: 4px;
display: block;
text-decoration: none;
line-height: 2.2em;
vertical-align: top;
"><div class='codicon codicon-save' style="
display: inline;
vertical-align: text-bottom;
margin: 0.3em;"></div>Save</a></div>
<div><a href="javascript:" id="deletebutton" style="
border: 1px solid;
padding: 4px;
display: block;
text-decoration: none;
line-height: 2.2em;
vertical-align: top;
"><div class='codicon codicon-remove' style="
display: inline;
vertical-align: text-bottom;
margin: 0.3em;"></div>Remove</a></div>
    <script>
    (function() {
        const vscode = acquireVsCodeApi();

        window.addEventListener('message', function (e) { 
            if (!e && !e.data) return;
            if (e.data.command === "disabledchanged") {
                document.getElementById('ruledisabled').checked = e.data.newValue;
            }
        });

        document.getElementById('deletebutton').addEventListener('click', function () {
            vscode.postMessage({
                command: 'delete'
            });
});
        
        document.getElementById('savebutton').addEventListener('click', function () {
          let label = document.getElementById('rulelabel').value;
          let regexp = document.getElementById('ruleregexp').value;
          let ruledisabled = document.getElementById('ruledisabled').checked;
          let rulefullline = document.getElementById('rulefullline').checked;
          let selectedtag = document.getElementById('selectedtag').value;
            vscode.postMessage({
                command: 'save',
                label: label,
                regexp: regexp,
                highlightFullLine: rulefullline,
                selectedtag: selectedtag,
  disabled: ruledisabled
            });
          });
    })();
    </script>
</body>
</html>`;
}
