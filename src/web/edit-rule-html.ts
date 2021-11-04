import { LogColoringRule } from "./rule";

export function buildHtml(rule: LogColoringRule) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cat Coding</title>
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
      <div><label>Tag:
<select id="selectedtag" value="${rule.tag}">
<option value="tag1">Tag 1</option>
<option value="tag2">Tag 2</option>
<option value="tag3">Tag 3</option>
<option value="tag4">Tag 4</option>
<option value="tag5">Tag 5</option>
<option value="tag6">Tag 6</option>
<option value="tag7">Tag 7</option>
<option value="tag8">Tag 8</option>
<option value="tag9">Tag 9</option>
<option value="invisible">Invisible</option>
</select></label></div>
        <div><input type="button" id="savebutton" value="Save" /></div>
<div><input type="button" id="deletebutton" value="Delete" /></div>
    <script>
    (function() {
        const vscode = acquireVsCodeApi();

        document.getElementById('deletebutton').addEventListener('click', function () {
            vscode.postMessage({
                command: 'delete'
            });
});
        
        document.getElementById('savebutton').addEventListener('click', function () {
          let label = document.getElementById('rulelabel').value;
          let regexp = document.getElementById('ruleregexp').value;
          let ruledisabled = document.getElementById('ruledisabled').checked;
          let selectedtag = document.getElementById('selectedtag').value;
            vscode.postMessage({
                command: 'save',
                label: label,
                regexp: regexp,
                selectedtag: selectedtag,
  disabled: ruledisabled
            });
          });
    })();
    </script>
</body>
</html>`;
}
