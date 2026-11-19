double-sided linescan concept

## Learned
- speeding up the middle conveyor section naturally spaces pallets out
- EPAL pallet damage criteria
- the gap in the conveyor is mostly limited by the geometry of the light bar's light and camera plane
- four cameras at the corners seems best for detecting errors (tested by comparing the number of pixels changed between damaged/clean)

## Considerations
### Pros
- complete vision of top and bottom
- top and bottom images match for AI model
- needs no stitching or far camera for long pallets
- can be made compact
- semi-ortho perspective
- can be made without a large cover; cleaning under the gap is easy (broom)
- no limits on pallet rotation

### Cons
- conveyor gap
- cameras at an upwards angle (dust)
- more complex than 5 cameras
