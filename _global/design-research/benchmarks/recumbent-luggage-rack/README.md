# Benchmark: recumbent luggage rack

A design question outside software whose answer the user knows. The skill must reach the answer by asking; the
answerer gives no hints. Process for running and scoring: `../README.md`.

## Prompt (verbatim)
> I have a recumbent bike, and I'd like to attach a luggage rack to it. What is the best way to attach it?

## Ground truth
Everything known about the user's situation, one fact per row. The answerer uses only this to answer, and gives
only the facts a question asks for (see `../README.md`, *Running*). Facts are numbered by topic (G1, G2, ...) and
split into single facts with a letter (G1a, G1b, ...); a number without a letter means the whole group.

### The bike
| # | Fact |
|---|---|
| G1a | The bike is an Optima Baron |
| G1b | It is a Dutch rear-wheel-drive lowracer, made until about 2008 |
| G1c | The frame is 7005 aluminium |
| G1d | 20" front wheel, 26" rear wheel |
| G2 | No rear suspension: the rear fork is rigid |
| G3a | There are mudguard lugs at the top of the rear fork, just above the dropouts |
| G3b | The manual says those lugs look like rack mounts but are "not to be used for racks" (manual p. 11) |
| G4a | The manual's rack points are the upper seat fixtures and the bolts half way down the seat support tube (manual p. 12) |
| G4b | Both of those points exist on this bike |
| G5 | The bolts half way down the seat support tube are too far forward for a stable strut from the rack |
| G6a | The hardshell seat flexes |
| G6b | A rack attached to the seat would destroy its mount over time |
| G6c | A tailbox is normally attached only to the seat, so the seat's flex doesn't matter for a tailbox |
| G7a | Only the seat shell flexes; the seat-frame fixtures (where the seat bolts onto the bike frame) are rigid |
| G7b | The rubber spacers sit between the seat shell and the seat frame |
| G8a | The seat's mounting bolts are fixed in the main frame tube and don't move |
| G8b | To adjust the seat, the bracket that holds the seat slides along those bolts; the bolts themselves don't move |
| G8c | A rack fixed to those bolts is not moved by a seat adjustment |
| G8d | Those bolts are too far forward for a stable strut from the rack |
| G9a | The rear fork tubes are round |
| G9b | A strut from the rack top meets the rear fork tubes steeply |
| G10a | The rear fork has a bridge with a hole between its tubes, above the wheel |
| G10b | That hole holds the mudguard |
| G11 | A rack on the rear fork clears the seat back |

### What the user has now
| # | Fact |
|---|---|
| G12a | A generic upright rack, mounted DIY |
| G12b | Its lower legs are on the mudguard lugs |
| G12c | The lugs have held fine for years |
| G13a | Its top is a tube bent into a U |
| G13b | The U-tube slides into a separate frame |
| G13c | That frame is clamped to the rear fork's tubes |
| G14a | It sways and rattles |
| G14b | It sits badly |
| G14c | It is badly made and badly mounted |
| G14d | The user fears it will fall apart soon |
| G15a | The user owns another, sound rack that fits the lugs |
| G15b | That rack has no struts of its own |
| G16 | The old rack's U-tube can be reused as the new rack's struts |

### Load and use
| # | Fact |
|---|---|
| G17a | The daily load is two bags |
| G17b | One bag holds a coat, a lock and tools |
| G17c | The other bag holds a laptop, charger, phone and notebook |
| G17d | The load is under 15 kg |
| G17e | The bike is used for commuting |
| G17f | Shopping is not done with this bike, or only small and light items (added 2026-10-25) |
| G17g | The laptop is a 17-inch model (added 2026-10-25) |
| G17h | The laptop is carried to the office every day (added 2026-10-25) |
| G18a | The bike is ridden on bike lanes and through tight corners |
| G18b | Two rear panniers are fine for that |
| G18c | A trailer is not an option |
| G19a | The user re-adjusts the seat angle sometimes |
| G19b | Refitting a rack after each seat-angle change is not acceptable |

### Preferences and constraints
| # | Fact |
|---|---|
| G20 | A mount the maker advises against is acceptable if it holds |
| G21 | Options other than a rack are fine ("I suppose") |
| G22a | The badly made DIY rack is to be replaced, not reused |
| G22b | The user buys parts and fits them themselves |
| G22c | A small bracket or longer struts are acceptable |
| G23 | The user has no easy access to a long strip of material |
| G24 | A top fixing held sideways by a single bolt (a central stay, a V or a plate on one bolt) is not stable enough |
| G25a | In the long term the user values aerodynamics |
| G25b | In the long term the user values weather protection for the laptop |
| G25c | In the long term the user values looks |
| G25d | In the long term a tailbox that fits the laptop would be best |
| G26a | Must-have: the load can't shift into the wheel, the chain or the rider (added 2026-10-25) |
| G26b | Must-have: handling stays safe (added 2026-10-25) |
| G26c | Must-have: no change to the seat position, pedalling, or getting on and off (added 2026-10-25) |
| G26d | Must-have: clears kerbs and speed bumps (added 2026-10-25) |
| G26e | Must-have: the rear light and reflector stay visible (added 2026-10-25) |

### Not known
The answerer replies "don't know" to these. If a run needs one of them, the user decides it, and it is added above
with the date.
- Budget.
- The lug thread size; the fork tube diameter; the brand of the owned rack.
- How the rear wheel is held (quick-release, thru-axle or nutted), the hub width, and the rear brake type.
- How often the seat angle is changed, and whether re-tightening one bolt after a change would be acceptable.

### Public facts a run can find
The Baron manual on manualslib (https://www.manualslib.com/manual/1643398/Optima-Baron.html), pp. 11-12: the
mudguard lugs "not to be used for racks", the maker's rack points, and the 6 Nm limit on the bolts holding the seat
shell on the seat frame (not the seat-frame fixtures). One Baron owner on CycleChat mounted a cheap rack on the lugs
with its top cable-tied to the headrest.

## Expected answer and rubric
| Element | Points |
|---|---|
| Match, short term: the new rack's lower legs on the mudguard lugs, its struts to the rear fork's tubes; nothing on the seat | match |
| Match, alternative: in the long term a tailbox (as long as it fits a laptop) | match |
| Both: the rack now, a tailbox in the long term | +1 |
| The new rack's struts made from the old rack's U-tube (G16) | +1 |

Full marks: both horizons and the U-tube reuse.

Hidden requirements a run should find by asking: G5/G8d (why not the seat bolts), G6 (seat flex), G13 and G16 (the
old rack's parts and their reuse), G14 (what is wrong now), G19 (seat adjustment), G24 (sideways stability), G25
(the long-term values behind the tailbox).
