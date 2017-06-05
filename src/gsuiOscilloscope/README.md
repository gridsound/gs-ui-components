# gsuiOscilloscope

This component takes a `<canvas>` at first, and let us able to draw the result of [getByteTimeDomainData (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/getByteTimeDomainData) by calling a `.draw` method with the `Uint8Array`. The component is written in a way to let the user being able to overwrite the draw, by applying a specific color to the [CanvasRenderingContext2D (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D) directly with some specific callbacks.<br/>
<br/>
<p align="center">
  <a href="https://codepen.io/mr21/full/oZqOpg">
    <img src="https://gridsound.github.io/assets/screenshots/gsuiOscilloscope.png"/><br/>
    <b>Demo</b> (<i>CodePen</i>)
  </a>
</p>
<br/>

## Documentation

### Methods :

* #### `.setResolution( width<Number>, height<Number> )`
	This method will call `canvas.width = width; canvas.height = height;`. It will impact the quality, to have the best quality we need to keep the resolution synced with the canvas dimension with [`getBoundingClientRect`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect).  
	Calling `setResolution` will not fire another `draw`.

* #### `.setPinch( pinch<Number> )`
	`pinch` is a Number between `0` and `1`. It will pinch the extremities of the curve to add a nice round effect.  
	By default the value is `0` (disabled).

* #### `.draw( data<Uint8Array> )`
	Draw on the canvas a curve representing the current waveform of the audio.
	`data` has to be created with [`getByteTimeDomainData`](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/getByteTimeDomainData).

* #### `.drawBegin( fn<Function> )`
	This method let us able to overwrite the begin of the `draw` method. We can choose the color of the curve etc.  
	We have to pass a function who will receive 4 arguments : the `CanvasRenderingContext2D`, the `max` dB recorded on the **previous** frame and the canvas' `width`, `height`.  
	Note that if we want to overwrite this function, we will need to `clearRect` our canvas ourself.  
	By default it's set to :
	``` javascript
	this.drawBegin( function( ctx, max, w, h ) {
		ctx.clearRect( 0, 0, w, h );
		ctx.lineWidth = 2;
		ctx.strokeStyle = "#fff";
	} );
	```

* #### `.drawEnd( fn<Function> )`
	This method is the symmetry of `drawBegin`. The function will be called just before the `stroke` call for drawing the curve.  
	The function will receive the same arguments than `drawBegin` except the `max` dB will concern the current frame.  
	There is no default function.

* #### `.clear()`
	Clear the canvas by calling `clearRect`.
