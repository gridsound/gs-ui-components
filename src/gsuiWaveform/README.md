# gsuiWaveform

This component is used to show a specific portion of an [AudioBuffer (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer). The waveform is draw with SVG (instead of Canvas) to keep the vectorial advantage.<br/>
<br/>
<p align="center">
  <a href="https://codepen.io/mr21/full/xqBYLg">
    <img src="https://gridsound.github.io/assets/screenshots/gsuiWaveform.png"/><br/>
    <b>Demo</b> (<i>CodePen</i>)
  </a>
</p>
<br/>

## Documentation

### Methods :

* #### `.setResolution( w<Number>, h<Number> )`
  This method will call `svg.setAttribute( "viewBox", "0 0 " + w + " " + h );`.   
  Calling `setResolution` will not fire another `draw`.

* #### `.draw( left<Float32Array>, right<Float32Array>, bufferDuration<Number>, offset<Number>, duration<Number> )`
  `left` and `right` are the audioData of the two different channels (left and right) extracted from an AudioBuffer with [`getChannelData`](https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer/getChannelData).  
  `bufferDuration` is the total duration (in second) of the AudioBuffer.  
  `offset` and `duration` delimite a specific portion of the buffer to draw (like the [`start`](https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode/start) method).  
  None of these 5 arguments are optional.

* #### `.render( buffer<AudioBuffer>, offset<Number>, duration<Number> )`
  This is a shortcut to the complex `.draw` previous method. Here, the method will extracts itself the data from the AudioBuffer, and will can read the `bufferDuration`. The method will take [`numberOfChannels`](https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer/numberOfChannels) into account.  
  The two last arguments are optional.

* #### `.remove()`
  Clear and remove the whole `<svg>` element.

* #### `.empty()`
  Clear the SVG by removing the `points` attribute of the `<polygon>` SVG element.
