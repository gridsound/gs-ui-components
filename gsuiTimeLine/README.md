# gsuiTimeLine

This component let you able to draw a precise timeline to be above (or below) a scheduled audio area (like a *PianoRoll* or a grid sample, etc.). This component handle a lot of different mouse events to let the internaute change the **currentTime** and the **loop**. The component handles all the mouse events related to the currentTime and the creation and modification of a *timeloop* inside the *timeline*. It handles also different [time signature](https://en.wikipedia.org/wiki/Time_signature).<br/>
<br/>
<p align="center">
  <a href="https://codepen.io/mr21/full/Omzyeq">
    <img src="https://gridsound.github.io/assets/screenshots/gsuiTimeLine.png"/><br/>
    <b>Demo</b> (<i>CodePen</i>)
  </a>
</p>
<br/>

## Documentation

### Methods :

* #### `.resized()`
  When the component has been resized by CSS or directly by JS, we have to call `.resized()` to let the component take its new dimensions (its new width).

* #### `.offset( beats<Number>, pxPerBeat<Number> )`
  This method is used to draw a specific part of the timeline, if we call `.offset( 16, 64 )` and if the component has a width of `512px` then we will see a timeline start at the `17`th beat and finish at the `25`th.

* #### `.currentTime( beats<Number> )`
  We can specify the current time in beats with this method, and it results by showing a little triangle at the time specified. By default the `currentTime` is set to `0`. This method is ready to be called a lot.

* #### `.timeSignature( beatsPerMeasure<Number>, stepsPerBeat<Number> )`
  This method will specify the [time signature](https://en.wikipedia.org/wiki/Time_signature) to the component, by default it's `(4, 4)`.

* #### `.loop( a<Number>, b<Number> )`
  This method let us able to specify a *timeloop* inside the *timeline*, for example if we call `.loop( 4, 8 )` a little bar above the numbers `5-6-7-8-9` will appear (keep in mind that the numbers start from `1` not `0`).

* #### `.loop( false )`
  This will make the *timeloop*'s bar disappear.

### CSS :

* #### `--cursor-color: #fdfd70;`
  This variable specify the **currentTime** cursor's `color` who is by default a bright yellow. The variable will also change the little glow yellow effect under the mouse while changing the currentTime.

* #### `--cursor-dur: 0.1s`
  This variable specify the **currentTime** cursor's `transition-duration`, when the internaute click to change the currentTime, the little triangle will move smoothly.

* #### `--loop-color: #656586;`
  This variable specify the **loop** div's `background`, by default it's a fade blue.

* #### `--loop-brd-color: #fff;`
  This variable specify the tiny **loop** border divs' `background`, by default it's white.
