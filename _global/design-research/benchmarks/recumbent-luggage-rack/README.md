# Benchmark: recumbent luggage rack

A design question outside software whose answer the user knows. The skill must reach the answer by asking; the
answerer gives no hints. Process for running and scoring: `../README.md`.

## Prompt (verbatim)
> I have a recumbent bike, and I'd like to attach a luggage rack to it. What is the best way to attach it?

## Ground truth
Everything known about the user's situation. The answerer uses only this to answer, and gives only what a question
asks for.

### The bike
| # | Fact |
|---|---|
| G1 | Optima Baron: a Dutch rear-wheel-drive lowracer (made until ~2008), 7005 aluminium, 20" front and 26" rear wheel |
| G2 | No rear suspension: the rear fork is rigid |
| G3 | Mudguard lugs at the top of the rear fork just above the dropouts; the manual says they look like rack mounts but are "not to be used for racks" (manual p. 11) |
| G4 | The maker's rack points: the upper seat fixtures and bolts half way down the seat support tube (manual p. 12); both exist on this bike |
| G5 | The bolts half way down the seat support tube are too far forward for a stable strut from the rack |
| G6 | The hardshell seat flexes; a rack attached to the seat would destroy the mount over time. A tailbox is normally attached only to the seat, so the flex doesn't matter for a tailbox |
| G7 | Only the seat shell flexes; the seat-frame fixtures (where the seat bolts onto the bike frame) are rigid. The rubber spacers sit between the shell and the seat frame |
| G8 | The seat's mounting bolts are fixed in the main frame tube and don't move; the bracket that holds the seat slides along them to adjust it. A rack fixed to those bolts is not moved by a seat adjustment, but they are too far forward for a stable strut (G5) |
| G9 | The rear fork tubes are round; a strut from the rack top meets them steeply |
| G10 | The rear fork has a bridge with a hole between its tubes above the wheel; the hole holds the mudguard |
| G11 | A rack on the rear fork clears the seat back |

### What the user has now
| # | Fact |
|---|---|
| G12 | A DIY-mounted generic upright rack: lower legs on the mudguard lugs, which have held fine for years |
| G13 | Its top is a tube bent into a U, sliding into a separate frame clamped to the rear fork's tubes |
| G14 | It sways, rattles and sits badly; it is badly made and badly mounted; the user fears it will fall apart soon |
| G15 | The user owns another, sound rack that fits the lugs; it has no struts of its own |
| G16 | The old rack's U-tube can be reused as the struts of the new rack |

### Load and use
| # | Fact |
|---|---|
| G17 | Daily load: two bags, one with coat, lock and tools, one with laptop, charger, phone and notebook; under 15 kg; commute and shopping |
| G18 | Ridden on bike lanes and through tight corners: two rear panniers are fine, a trailer is not |
| G19 | The user re-adjusts the seat angle sometimes; refitting a rack after each change is not acceptable |

### Preferences and constraints
| # | Fact |
|---|---|
| G20 | A mount the maker advises against is acceptable if it holds |
| G21 | Options other than a rack are fine ("I suppose") |
| G22 | The badly made DIY rack is to be replaced, not reused; the user buys parts and fits them, and accepts a small bracket or longer struts |
| G23 | No easy access to a long strip of material |
| G24 | A top fixing held sideways by a single bolt (central stay, V or plate on the bridge bolt) is not stable enough |
| G25 | In the long term the user values aerodynamics, weather protection for the laptop and looks: a tailbox that fits a laptop would be best |

### Not known
Budget; exact volume of a shopping load in litres; the lug thread size; the fork tube diameter; the brand of the
owned rack. The answerer replies "don't know". If a new run needs one of these, the user decides it, and it is
added here with the date.

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

Hidden requirements a run should find by asking: G5/G8 (why not the seat bolts), G6 (seat flex), G13 and G16 (the old
rack's parts and their reuse), G14 (what is wrong now), G19 (seat adjustment), G24 (sideways stability), G25 (the
long-term values behind the tailbox).
