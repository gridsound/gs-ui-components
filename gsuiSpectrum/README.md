# gsuiSpectrum

This component takes a `<canvas>` at first, and let us able to draw the result of [getByteFrequencyData (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/getByteFrequencyData) by calling a `.draw` method with the `Uint8Array`. The component use colors instead of bars' height to render the frequencies which leads to need only 1 dimension, so the Canvas' resolution can be really small for the same quality.<br/>
<br/>
<p align="center">
  <a href="https://codepen.io/mr21/full/Rpyxwb">
    <img src="https://gridsound.github.io/assets/screenshots/gsuiSpectrum.png"/><br/>
    <b>Demo</b> (<i>CodePen</i>)
  </a>
</p>
<br/>

## Documentation

### Methods :

* #### `.setResolution( width<Number> )`
  This method will call `canvas.width = width;`. It will impact the quality, to have the best quality we need to keep the resolution synced with the `Uint8Array.length`. There is no need to specify another dimension because our spectrum visualization use different colors instead of different heights.  
Calling `setResolution` will not fire another `draw`.

* #### `.draw( data<Uint8Array> )`
  Draw on the canvas (with multiple different color `fillRect`) the audio frequencies given by the `data` array who has to be created with [`getByteFrequencyData`](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/getByteFrequencyData).

* #### `.clear()`
  Clear the canvas by calling `clearRect`.
