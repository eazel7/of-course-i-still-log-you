# Of course I still log you

This extension allows users to colorize text editor lines based on different regular expressions. There are plans for more, for helping in general with the more-than-daily task that is analyzing, extracting, filtering a log file.

## Features

1. Colorize based on regular expressions
     - Use the `logyou` document language
2. Fold lines by consecutive matching (and non-matching) rules

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
It comes with two themes, one Dark and another one Light, based upon Dark and Light VS code default themes.

## Known Issues

So far, that it's absolutely basic! So it's much more now about missing features

## Missing features

- To test regular expressions
- To extract named information from a line (capture groups?)
- To make it easy to import/export rulesets or profiles and share them somehow
- To export the extracted information (like the captured groups) in a machine format (JSON)

## Release Notes

### 0.0.7

- Code folding

### 0.0.6

- A little bit of refactor here and there
- Bugfix: sync enable/disable status with active edit view

### 0.0.5

- Toggle rules on and off from the panel

### 0.0.4

- More colors 
- Invisible color (like the background color)

### 0.0.3

- Updated this README.md

### 0.0.2

- Can delete rules
- Loads and save the rules for a workspace
- Have two themes: dark and light
- Tweaked the colors a little bit

### 0.0.1

Initial release of *Of course I still log you*

**Enjoy!**
