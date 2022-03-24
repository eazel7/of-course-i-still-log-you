module.exports = "<!DOCTYPE html>\n<html lang=\"en\">\n\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>Of course I still log you</title>\n    <link rel=\"stylesheet\" type=\"text/css\" href=\"{{codiconCss}}\" />\n    <style>\n        label {\n            display: block;\n            margin-bottom: 1em;\n        }\n\n        input[type=text],\n        select {\n            display: block;\n            margin-top: 0.3em;\n            width: 100%;\n            border: 1px solid;\n            padding: 4px;\n        }\n\n        input[type=checkbox] {\n            height: 3em;\n        }\n\n        div {\n            clear: both;\n        }\n\n        .flipswitch {\n            position: relative;\n            background: white;\n            width: 60px;\n            height: 3em;\n            -webkit-appearance: initial;\n            border-radius: 3px;\n            -webkit-tap-highlight-color: rgba(0, 0, 0, 0);\n            outline: none;\n            font-size: 1em;\n            font-family: Trebuchet, Arial, sans-serif;\n            font-weight: bold;\n            cursor: pointer;\n            border: 1px solid #ddd;\n            vertical-align: middle;\n        }\n\n        .flipswitch:after {\n            position: absolute;\n            top: 5%;\n            display: block;\n            line-height: 32px;\n            width: 45%;\n            height: 90%;\n            background: #fff;\n            box-sizing: border-box;\n            text-align: center;\n            transition: all 0.3s ease-in 0s;\n            color: black;\n            border: #888 1px solid;\n            border-radius: 3px;\n        }\n\n        .flipswitch:after {\n            left: 2%;\n            content: \"OFF\";\n        }\n\n        .flipswitch:checked:after {\n            left: 53%;\n            content: \"ON\";\n        }\n    </style>\n</head>\n\n<body>\n    <pre>{{asString}}</pre>\n    <div><label>Rule name: <input type=\"text\" id=\"rulelabel\" value=\"{{rule.label}}\" /></label></div>\n    <div><label>Regexp: <input type=\"text\" id=\"ruleregexp\" value=\"{{rule.regexp}}\" /></label></div>\n    <div><label>Enabled: <input class=\"flipswitch\" type=\"checkbox\" id=\"ruledisabled\" {{^rule.disabled}} checked {{/rule.disabled}}></label></div>\n    <div><label>Full line: <input class=\"flipswitch\" type=\"checkbox\" id=\"rulefullline\"\n                {{#rule.highlightFullLine}} checked {{/rule.highlightFullLine}} /></label></div>\n    <div><label>Case insensitive: <input class=\"flipswitch\" type=\"checkbox\" id=\"rulecaseinsensitive\"\n                {{#rule.caseInsensitive}} checked {{/rule.caseInsensitive}} /></label></div>\n    <div><label>Tag:\n            <select id=\"selectedtag\" value=\"{{rule.tag}}\">\n                {{#tags}}\n                <option {{#selected}} \"selected\" {{/selected}} value=\"{{key}}\">{{friendlyName}}</option>\n                {{/tags}}\n            </select></label></div>\n    <div><a href=\"javascript:\" id=\"savebutton\" style=\"\nborder: 1px solid;\npadding: 4px;\ndisplay: block;\ntext-decoration: none;\nline-height: 2.2em;\nvertical-align: top;\n\">\n            <div class='codicon codicon-save' style=\"\ndisplay: inline;\nvertical-align: text-bottom;\nmargin: 0.3em;\"></div>Save\n        </a></div>\n    <div><a href=\"javascript:\" id=\"deletebutton\" style=\"\nborder: 1px solid;\npadding: 4px;\ndisplay: block;\ntext-decoration: none;\nline-height: 2.2em;\nvertical-align: top;\n\">\n            <div class='codicon codicon-remove' style=\"\ndisplay: inline;\nvertical-align: text-bottom;\nmargin: 0.3em;\"></div>Remove\n        </a></div>\n    <script>\n        (function () {\n            const vscode = acquireVsCodeApi();\n\n            window.addEventListener('message', function (e) {\n                if (!e && !e.data) return;\n                if (e.data.command === \"disabledchanged\") {\n                    document.getElementById('ruledisabled').checked = e.data.newValue;\n                }\n            });\n\n            document.getElementById('deletebutton').addEventListener('click', function () {\n                vscode.postMessage({\n                    command: 'delete'\n                });\n            });\n\n            document.getElementById('savebutton').addEventListener('click', function () {\n                let label = document.getElementById('rulelabel').value;\n                let regexp = document.getElementById('ruleregexp').value;\n                let ruledisabled = !document.getElementById('ruledisabled').checked;\n                let rulefullline = document.getElementById('rulefullline').checked;\n                let rulecaseinsensitive = document.getElementById('rulecaseinsensitive').checked;\n                let selectedtag = document.getElementById('selectedtag').value;\n                vscode.postMessage({\n                    command: 'save',\n                    label: label,\n                    regexp: regexp,\n                    highlightFullLine: rulefullline,\n                    caseInsensitive: rulecaseinsensitive,\n                    selectedtag: selectedtag,\n                    disabled: ruledisabled\n                });\n            });\n        })();\n    </script>\n</body>\n\n</html>";