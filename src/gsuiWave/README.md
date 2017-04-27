# gsuiWave

This component let you able to easely draw a vectorial [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG) sinewave (or triangle, sawtooth, square). There are several parameters who gives us many possibilities : `frequency`, `amplitude`, `attack`. This is the perfect UI component for an [LFO](https://en.wikipedia.org/wiki/Low-frequency_oscillation?oldformat=true) for example.<br/>
<br/>
<p align="center">
  <a href="https://codepen.io/mr21/full/xdGWNN">
    <img width="600" src="https://gridsound.github.io/assets/screenshots/gsuiWave.png"/><br/>
    <b>Demo</b> (<i>CodePen</i>)
  </a>
</p>
<br/>

## Documentation

### `.setResolution( width<Number>, height<Number> )`
This method will call `.setAttribute( "viewBox", "0 0 " + width + " " + height );`.  
Calling `setResolution` will not fire another `draw`.

### `.frequency/amplitude/attack = x<Number>`
These attributes can be changed at any moment. Setting one of these attributes will not call a `draw`, we have to call it ourself.

### `.draw()`
This will draw the curve by editing the `points` attribute of the [`<polyline/>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/polyline) element.

### `gsuiWave.sine/square/sawtooth/triangle( x<Number> )`
The function to calculate the different type of curve are static :
``` javascript
gsuiWave.sine     = x => { return Math.sin( x ); };
gsuiWave.square   = x => { return Math.sin( x ) > 0 ? 1 : -1; };
gsuiWave.sawtooth = x => { return x /= Math.PI * 2, 2 * ( x - Math.floor( x + .5 ) ); };
gsuiWave.triangle = x => { return 2 * Math.abs( gsuiWave.sawtooth( x + Math.PI / 2 ) ) - 1; };
```
