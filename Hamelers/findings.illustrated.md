Double-sided linescan concept

![Simulated rig: two conveyor sections with a gap, light bars above and below, four line-scan cameras at the corners](findings.images/rig.png)
*Simulated rig: pallets cross a gap between two conveyor sections, scanned from above and below.*

## Learned
- speeding up the middle conveyor section naturally spaces pallets out
- EPAL pallet damage criteria
- the gap in the conveyor is mostly limited by the geometry of the light bar's light and camera plane

  ![Light fan from the bottom light bar passing between the rollers at the gap](findings.images/schematic-light.png)
  *Bottom light bar at −250 mm: its light fan, not the camera planes, sets how close the rollers can be (92 mm narrowest gap).*

  ![Narrowest gap versus light bar depth below the belt](findings.images/gap-vs-bar-depth.png)
  *Narrowest gap vs. how far the bar sits below the belt. The camera views alone would fit through a much smaller gap.*

- four cameras at the corners seems best for detecting errors (tested by comparing the number of pixels changed between damaged/clean)

  ![Top view: four cameras at the corners, scan lines crossing the belt](findings.images/schematic-top.png)
  *Top view: two top and two bottom cameras at opposite corners, each covering the full 1300 mm width.*

## Considerations
### Pros
- complete vision of top and bottom

  ![Line-scan bottom views of a pallet with a broken outer bottom board](findings.images/line-scan-bottom-broken-outer-bottom-board.png)
  ![Five-camera views of the same pallet with a broken outer bottom board](findings.images/five-sides-broken-outer-bottom-board.png)
  *Broken outer bottom board: line-scan bottom views (±25°) vs. the five-camera setup.*

  ![Line-scan bottom views of a pallet with a broken middle bottom board](findings.images/line-scan-bottom-broken-middle-bottom-board.png)
  ![Five-camera views of the same pallet with a broken middle bottom board](findings.images/five-sides-broken-middle-bottom-board.png)
  *Broken middle bottom board: line-scan bottom views vs. the five-camera setup.*

- top and bottom images match for AI model

  ![Upright pallet seen from below next to flipped pallet seen from above](findings.images/line-scan-flipped-vs-upright.png)
  *The same pallet upright from below and flipped from above produce near-identical images.*

- needs no stitching or far camera for long pallets
- can be made compact
- semi-ortho perspective
- can be made without a large cover; cleaning under the gap is easy (broom)
- no limits on pallet rotation

### Cons
- conveyor gap
- cameras at an upwards angle (dust)

  ![Side view: top cameras looking down and bottom cameras looking up through the gap at 25°](findings.images/schematic-side.png)
  *Side view: the bottom cameras look up through the gap at 25°, so their lenses face where dust falls.*

- more complex than 5 cameras
