# gsuiPopup

`alert`, `confirm` and `prompt` can be useful but the format can annoy the internaute, so we rewrote them. These alert are now asynchrone and use [Promise (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise). They can be stylized now and are silent.<br/>
<br/>
<p align="center">
  <a href="https://codepen.io/mr21/full/aJMEev">
    <img src="https://gridsound.github.io/assets/screenshots/gsuiPopup.png"/><br/>
    <b>Demo</b> (<i>CodePen</i>)
  </a>
</p>
<br/>

## Documentation

### `.open( type, title, msg [, value] )`
This method will show a popup on front of everything. All the 4 arguments are `String` :
* `type` can be equal to `"alert"`, `"confirm"` or `"prompt"`.
* `title` is the text inside the popup's title.
* `msg` is what you want to say to your user (the popup's body).
* `value` is optional and used only if `type` equal `"prompt"`, it's the value inside the input.

### `.open( ... ).then( function( value ) { ... } )`
The `value` will be the exact same thing that you should receive with `alert()`, `confirm()` and `prompt()`. A Boolean for `confirm` and a String for `prompt` (or null if the `prompt` is canceled), and `undefined` for `alert`.

### `.close()`
Force close the dialog. It will trigger the `then` returned by `.open( ... )` like if the *cancel* button was pressed.
