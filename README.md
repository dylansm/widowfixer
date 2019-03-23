# widowfixer

Simply add the class:

```
.wf
```

To any block of text to remove unwanted typographical widows.

The library will automatically try to increase word-spacing when a widow is found, up to 8px. If the widow cannot be fixed, it will reset to word-spacing of 0px.

## Things to watch for

1. Text within block should all have the same line height.
2. If there are superscripts or subscripts of varying heights it shouldn't be a problem as long as there are no additional spaces in those tags.
3. This hasn't really been thoroughly tested yet.

## Browser compatibility

- Latest Chrome, Firefox, Safari should work.
