# gsuiBeatlines

This component takes a `<svg>` at first, and let us able to draw each step, beat and measure lines at once. The component handle multiple [time signature](https://en.wikipedia.org/wiki/Time_signature) with the `stepsPerBeat`, `beatsPerMeasure` attributes.<br/>
This component is a lot inspired of *FL Studio* (obviously).
<br/>
<p align="center">
  <a href="https://codepen.io/mr21/full/MmJVZx">
    <img src="https://gridsound.github.io/assets/screenshots/gsuiBeatlines.png"/><br/>
    <b>Demo</b> (<i>CodePen</i>)
  </a>
</p>
<br/>

## Documentation

### Methods :

* #### `.resized()`
  This method will find the current width of the component to calculate the accurate SVG's viewport. This method has to be called after the component has seen its width changed.

* #### `.offset( beats<Number>, pxPerBeat<Number> )`
  This method is used to draw a specific part of the timeline, if we call .offset( 16, 64 ) and if the component has a width of 512px then we will see a timeline start at the 17th beat and finish at the 25th.

* #### `.timeSignature( beatsPerMeasure<Number>, stepsPerBeat<Number> )`
  This method will specify the [time signature](https://en.wikipedia.org/wiki/Time_signature) to the component, by default it's `(4, 4)`. The measures are represented by a strong line on our canvas, the beats by a normal line and the steps (who are the *beat*'s subparts) by a smaller line.

* #### `.loop( a<Number>, b<Number> )`
  This method let us able to specify a *timeloop*, for example if we call `.loop( 4, 8 )` the 1, 2, 3, 4 and the 9, 10, 11, ... measures will be darken to let the 5, 6, 7, 8 measures highlighted (keep in mind that the numbers start from 1 not 0).

* #### `.loop( false )`
  This will make the dark areas disappear.

* #### `.render()`
  Draw on the canvas (with multiple black `fillRect`) each step/beat/measure (vertical) lines.

### CSS :

* #### `color: #ff5;`
  Change the `color` property to change the *currentTime*'s color.

* #### `fill: #000;`
  Changing the `fill` property to choose your own color for the measures/beats/steps bars.
