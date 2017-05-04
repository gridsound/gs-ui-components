# gsuiBeatLines

This component takes a `<svg>` at first, and let us able to draw each step, beat and measure lines at once. The component handle multiple [time signature](https://en.wikipedia.org/wiki/Time_signature) with the `stepsPerBeat`, `beatsPerMeasure` attributes.<br/>
This component is a lot inspired of *FL Studio* (obviously).
<br/>
<p align="center">
  <a href="https://codepen.io/mr21/full/MmJVZx">
    <img src="https://gridsound.github.io/assets/screenshots/gsuiBeatLines.png"/><br/>
    <b>Demo</b> (<i>CodePen</i>)
  </a>
</p>
<br/>

## Documentation

### `.setResolution( width<Number> )`
This method will call `.setAttribute( "viewBox", "0 0 " + w + " 1" )`. It will impact the quality, to have the best quality we need to keep the resolution synced with the SVG width on screen. There is no need to specify another dimension so its height will always be only `1`. Calling `setResolution` will not fire another `draw`.

### `.offset = beats<Number>`
This attribute specify where to start the draw in the timeline. The value is in Beat, and is useful for the component to recognize which lines are beatlines or measurelines. `offset` is at `0` by default.

### `.beatsPerMeasure = n<Number>`
The measures are represented by a strong line on our canvas. `beatsPerMeasure` is the equivalent of the up number of the [time signature](https://en.wikipedia.org/wiki/Time_signature) fraction. The most famous Time signature is **4/4**, by default this number is at `4`.

### `.stepsPerBeat = n<Number>`
A *step* is the subpart of a *beat*, if our *time signature* is 4/**4**, the bottom number means a [quarter note](https://en.wikipedia.org/wiki/Quarter_note) so there will be 4 step in a beat, and 3 separations between two beatlines. By default this number is at `4`.

### `.draw()`
Draw on the canvas (with multiple black `fillRect`) each step/beat/measure (vertical) lines.

## CSS

### `font-size`
Applying a `font-size` property on `.gsuiBeatLines` element will have a zoom effect. Increase the value to zoom in, decrease to zoom out. 

### `fill`
Changing the `fill` property to choose your own color. By default it's `#000`.
