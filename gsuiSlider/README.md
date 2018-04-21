# gsuiSlider

An horizontal, vertical and circular slider who use an invisible `<input type="range"/>` inside. The standard Input Events are simulated in the exact same way. The component gives UI possibilities who are not possible in a classic way.<br/>
<br/>
<p align="center">
  <a href="https://cdpn.io/NMGqOQ">
    <img src="https://gridsound.github.io/assets/screenshots/gsuiSlider.png"/><br/>
    <b>Demo</b> (<i>CodePen</i>)
  </a>
</p>
<br/>

## Documentation

### Methods :

* #### `.setValue( val<Number> )`
  `mySlider.setValue( val );` is the equivalent of `inputElement.value = val;`. It will not fire the `onchange` or `oninput` callbacks.

* #### `.resize( width<Number>, height<Number> )`
  This method has to be used when the slider has to be resized dynamically in JS. The method will **set** the new dimensions (`width` and `height`) in pixels and perform a redraw.

* #### `.resized()`
  This method has to be used when the slider has been resized dynamically by CSS or whatever. The method will calculate the new dimension by using [`getBoundingClientRect`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect) and perform a redraw. This action will not change the current dimensions.

* #### `.options( opt<Object> )`
  By sending an object here, we can specify many options:
  * **type**: can be `"circular"`, `"linear-x"` or `"linear-y"`.
  * **value**: act like the native `value` attribute.
  * **min**: act like the native `min` attribute
  * **max**: act like the native `max` attribute
  * **step**: act like the native `step` attribute
  * **scrollStep**: this attribute concerns the scroll's steps.
  * **startFrom**: the 0 point for the color line.

  If `step` is not specified, it will be equal to `(max-min)/10`.  
  If `scrollStep` is not specified, it will be equal to `step`.  
  If `startFrom` is not specified, it will be equal to `0`.  
  If `startFrom` is outside `min/max` values, it will be set to the closest bound.

### Attributes :

* #### `.value<Number>`
  This is the readonly value of the slider, if we want to change it, we will have to use `.setValue()`.

### Callbacks :

* #### `.oninput = function( val<Number> ) { ... }`
  We can assign a Function to the `oninput` attribute, the behaviour is the same than the standard [`oninput`](https://developer.mozilla.org/en-US/docs/Web/Events/input) event. It will be fired after each mousemove modulo the `step`.

* #### `.onchange = function( val<Number> ) { ... }`
  We can assign a Function to the `onchange` attribute, the behaviour is the same than the standard [`onchange`](https://developer.mozilla.org/en-US/docs/Web/Events/change), It will be fired when the user release the track button and if the value is different than before.
