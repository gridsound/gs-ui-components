# gsuiPopup

`alert`, `confirm` and `prompt` can be useful but the format can annoy the internaute, so we rewrote them. These alert are now asynchrone and use [Promise (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise). They can be stylized now and are silent. Also the popup has a header with an editable title.<br/>
<br/>
<p align="center">
  <a href="https://cdpn.io/NMKVBd">
    <img src="https://gridsound.github.io/assets/screenshots/gsuiPopup.png"/><br/>
    <b>Demo</b> (<i>CodePen</i>)
  </a>
</p>
<br/>

## Documentation

### Methods :

* #### `gsuiPopup.alert( title<String>, msg<String> ).then( () => ... )`
  This is the equivalent of `alert( msg );`. But now the call is asynchrone.

* #### `gsuiPopup.confirm( title<String>, msg<String> ).then( val<Boolean> => ... )`
  This is the equivalent of `var b = confirm( msg );`. But now the call is asynchrone and the return value will be the boolean argument of the `then` callback.

* #### `gsuiPopup.prompt( title<String>, msg<String> [, val<String>] ).then( val<String> => ... )`
  This is the equivalent of `var b = prompt( msg, val );`. But now the call is asynchrone and the return value will be the string argument of the `then` callback. If the user press *Cancel* the return value will be `null` (like the native behaviour).

* #### `gsuiPopup.close()`
  Force close the dialog. It will resolve the Promise returned by the previous call to `alert/confirm/prompt( ... )` like if the *Cancel* button was pressed.
