# gsuiToggle

This is the equivalent of the `<input type="checkbox"/>`, but this time it's fully CSS customisable. The component don't use any real `<input/>` element inside (maybe this will change in the future)<br/>
<br/>
<p align="center">
  <a href="https://codepen.io/mr21/full/XRMQrw">
    <img src="https://gridsound.github.io/assets/screenshots/gsuiToggle.png"/><br/>
    <b>Demo</b> (<i>CodePen</i>)
  </a>
</p>
<br/>

## Documentation

### Methods :

* #### `.check()`
  This component will check the toggle. After that the `gsuiToggle.checked` attribute will be `true`.

* #### `.uncheck()`
  This component will uncheck the toggle. After that the `toggle.checked` attribute will be `false`.

* #### `.toggle( [ checked<Boolean> ] )`
  `toggle.toggle( checked )` is a shortcut to `checked ? toggle.check() : toggle.uncheck()`, and  
  `toggle.toggle()` is a shortcut to `toggle.checked ? toggle.uncheck() : toggle.check()`

### Attributes :

* #### `.checked<Boolean>`
  The `checked` attribute is a readonly value, to change its state we have to use `un/check` or `toggle` methods described below.

### Callbacks :

* #### `.onchange = function( checked<Boolean> ) {}`
  To detect the change of the `checked` attribute, we have to bind the `onchange` callback and the `checked` boolean will be its only argument.
