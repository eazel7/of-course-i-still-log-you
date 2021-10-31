# Of course I still log you

This extension allows users to colorize text editor lines based on different regular expressions. There are plans for more, for helping in general with the more-than-daily task that is analyzing, extracting, filtering a log file.

## Features

1. Colorize based on regular expressions
     - Use the `logyou` document language

## Requirements

None

## Extension Settings

None so far, but you may want to customize a theme. In that case, this need to be present in the theme for this extension to work:

```json
{
  ///...
  "semanticHighlighting": true,
  "semanticTokenColors": {
    "tag1:logyou": "#ff0011",
    "tag2:logyou": "#4a0095",
    "tag3:logyou": "#a53700"
}
```



## Known Issues

So far, that it's absolutely basic! So it's much more now about missing features

## Missing features

- To delete an existing rule
- To have a dark theme
- Add more colors
- Have prettier colors. Pretty colors. The current ones are ugly.
- To save and load the rules across restarts
- To test regular expressions
- To hide/fold uninteresting lines
- To extract named information from a line (capture groups?)
- To make it easy to import/export rulesets or profiles and share them somehow
- To export the extracted information (like the captured groups) in a machine format (JSON)

## Release Notes

### 1.0.0

Initial release of *Of course I still log you*

**Enjoy!**
