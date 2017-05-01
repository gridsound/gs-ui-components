# gsuiSpanEditable

This component lets the user to fast rename something by double clicking on the current string value.<br/>
<br/>
<p align="center">
  <a href="https://codepen.io/mr21/full/XRRVGm">
    <img src="https://gridsound.github.io/assets/screenshots/gsuiSpanEditable.png"/><br/>
    <b>Demo</b> (<i>CodePen</i>)
  </a>
</p>
<br/>

## Documentation

### `.value<String>`
The `value` attribute is readonly, to change it we have to use `setValue`.

### `.onchange = function( val<String> ) {}`
To listen the change of the value, we have to set a function on the `onchange` attribute, and the new value will be the only argument.

### `.setValue( val<String> )`
This is the equivalent of `inputElem.value = val;`, setting the value in JS will not fired the `onchange` callback.

### `.setPlaceholder( val<String> )`
We have to pass by this method to set a specific placeholder.
