# gsuiBeatlines

This component takes a `<svg>` at first, and let us able to draw each step, beat and measure lines at once. The component handle multiple [time signature](https://en.wikipedia.org/wiki/Time_signature) with the `stepsPerBeat`, `beatsPerMeasure` attributes.<br/>
This component is a lot inspired of *FL Studio* (obviously).
<br/>
<p align="center">
  <a href="https://cdpn.io/yKrLOO">
    <img src="https://gridsound.github.io/assets/screenshots/gsuiBeatlines.png"/><br/>
    <b>Demo</b> (<i>CodePen</i>)
  </a>
</p>
<br/>

## Documentation

### Methods :

* #### `.pxPerBeat( pxBeat<Number> `
  This method is used to zoom on the SVG by modifying the background-size, if we call .pxPerBeat( 64 ) each viewBox's beats has a width of 64px.

* #### `.timeSignature( beatsPerMeasure<Number>, stepsPerBeat<Number> )`
  This method will specify the [time signature](https://en.wikipedia.org/wiki/Time_signature) to the SVG, by default it's `(4, 4)`. The measures are represented by a strong line on our canvas, the beats by a normal line and the steps (who are the *beat*'s subparts) by a smaller line.

* #### `.render()`
  Generate a SVG URL. This URL is set as the background of the component sent in parameters to `gsuiBeatlines`.

### CSS :

* #### `fill: #000;`
  Changing the `fill` property to choose your own color for the measures/beats/steps bars.
