# gsuiSlider

An horizontal, vertical and circular slider who use an invisible `<input type="range"/>` inside. The standard Input Events are simulated in the exact same way. The component gives UI possibilities who are not possible in a classic way.<br/>
<br/>
<p align="center">
  <a href="https://codepen.io/mr21/full/Rpqmdb">
    <img src="https://gridsound.github.io/assets/screenshots/gsuiSlider.png"/><br/>
    <b>Demo</b> (<i>CodePen</i>)
  </a>
</p>
<br/>

## Documentation

### `.setValue( val<Number> )`
`mySlider.setValue( val );` is the equivalent of `inputElement.value = val;`. It will not fire the `onchange` or `oninput` callbacks.

### `.circular()`
A call to `circular` will specify that the slider has to be circular instead of linear. By default the slider is not circular.

### `.linear( axe<String> )`
A call to `linear` will specify that the slider has to be linear instead of circular, `axe` can be `"x"` or `"y"`. It will change the axe of the linear slider, `"y"` for vertical and `"x"` for horizontal.  
By default it's horizontal.

### `.resize( width<Number>, height<Number> )`
This method has to be used when the slider has to be resized dynamically in JS. The method will **set** the new dimensions (`width` and `height`) in pixels and perform a redraw.

### `.resized()`
This method has to be used when the slider has been resized dynamically by CSS or whatever. The method will calculate the new dimension by using [`getBoundingClientRect`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect) and perform a redraw. This action will not change the current dimensions.

### `.options( opt<Object> )`
By sending an object here, we can specify the `min`, `max`, `step` and `value` attributes of the InputElement.  
Specify a `value` will not fire the `onchange` or `oninput` callbacks.  
We can also specify another **non-standard** attribute : `startFrom` who will result by drawing a color bar on the slider's track who following the slider's button (see the demo above).  
If `startFrom` is outside `min/max` values, it will be set to the closest bound.

### `.oninput = function( val ) { ... }`
We can assign a Function to the `oninput` attribute, the behaviour is the same than the standard [`oninput`](https://developer.mozilla.org/en-US/docs/Web/Events/input) event. It will be fired after each mousemove modulo the `step`.

### `.onchange = function( val ) { ... }`
We can assign a Function to the `onchange` attribute, the behaviour is the same than the standard [`onchange`](https://developer.mozilla.org/en-US/docs/Web/Events/change), It will be fired when the user release the track button and if the value is different than before.
