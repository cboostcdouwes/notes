# Generator C: organisations, people and process

## Reformulations

- **Postal sorting ("address encoding" / "video coding")**: machine reads what it can; the rest goes as an image to
  remote human keyers in a Remote Encoding Center, so the line never waits on a person on the floor.
- **Airport hold-baggage screening ("multi-level screening", "remote multiplexed screening")**: Level 1 machine
  clears most bags at 800-1800 bags/h, uncleared images go to a remote operator (Level 2), and only the rest go to a
  slower stage (Level 3). The judgement is split into stages with different speeds and costs.
- **Egg grading ("candling")**: the machine grades the stream; trained operators handle rejects, borderline cases and
  spot checks; human candlers miss ~50 % of cracks at 45,000 eggs/h, so people are used where the rate is low.
- **Lumber grading ("certified grader")**: a person with a rule book and a certificate, audited by an association;
  accuracy drifts over a shift.
- **Pallet pooling ("service-centre inspection", "quality classification for exchange")**: CHEP, EPAL, Euro Pool
  System: the owner of the pool judges condition centrally, the asset carries its identity, and the classes are a
  contract between trading partners.
- **Car rental ("check-in damage inspection")**: drive-through scanner plus human review before billing (Sixt) or
  only on dispute (Hertz).
- **Wider**: every returnable asset must have a known identity and a fitness-for-reuse status before it re-enters
  circulation; who in the chain establishes that, and when?
- **Narrower**: only the pallets the automatic judgement can't decide with confidence need a judgement at the
  classification point; the rest is already decided.
- **Inverted (need goes away)**: the type is known before the pallet arrives (it carries or is declared with its
  identity), and condition is judged where it is acted on (repair bench, the next user) or by the party that bears the
  cost of a wrong call, so the classification point only routes.

## Worked-out options

C1. **Machine first, remote human for the uncertain ones (postal REC / Level 2 screening pattern).** The automatic
system calls type and condition with a confidence; pallets above threshold pass, the uncertain ones are shown as
images to a remote operator (at Cboost, the customer's office, or a service bureau) who answers within the 3.6 s
slot or within a buffer of a few pallets; if nobody answers in time, the pallet goes to a "check" lane. Every human
answer becomes training data, so new types (R10) and the customer's rules (R11) are learned from the reviewed cases,
and the share sent to people shrinks over time. Stops (R5) are cut because an uncertain pallet never stops the line.
Sources: https://en.wikipedia.org/wiki/Remote_Bar_Coding_System ; https://www.beumergroup.com/app/uploads/2024/07/ECAC-Standard-3.pdf ;
https://uploads-ssl.webflow.com/62992f497b7940e88b2b200d/63fd21aacde0c69735053d06_PlusOneRobotics-Human-Centered-Pick-And-Place%20Automation.pdf .
Cost: the automatic stage plus a review UI and network link (small software project); operator time scales with the
uncertain share (at 5 % of 1000/h, 50 reviews/h, a fraction of one person); a buffer or side lane of a few pallets.

C2. **Split the judgement into stages along the line (tiered screening).** Stage 1, fast and cheap, at full rate:
type and an obvious-good / obvious-bad call. Stage 2, slower, only for the doubtful share: a closer look (more views,
turning the pallet, a person). Each stage is sized for the share that reaches it, not for 1000/h, and a failing stage 2
only slows the doubtful share. Source: ECAC Standard 3 multi-level screening, https://www.beumergroup.com/app/uploads/2024/07/ECAC-Standard-3.pdf ;
Rapiscan NEXlink tiered image viewing, https://www.rapiscansystems.com/en/products/rapiscan-nexlink . Cost: a second
station or side loop in the layout (handled outside per R4, so needs the customer's flow to allow a re-entry or side
exit); stage 2 equipment or staff sized for maybe 5-20 % of the feed.

C3. **People at the line, machine as assistant (candling booth / sorter with A-B stackers).** One or two trained
sorters judge each pallet with a screen that shows the machine's proposal (type, flagged defects); they confirm or
override with one button. Pallet recyclers run manual A/B sort lines at 300-600 pallets/h per station, so 1000/h needs
two or three stations in parallel or a pre-split of the feed. Maintenance is mostly the people's (R8), and the
machinery is simple, so few stops (R5); accuracy drifts with fatigue, so add audit samples.
Sources: https://palletenterprise.com/straight-line-pallet-repair-system-lets-builders-make-the-decisions ;
https://palletenterprise.com/?p=4127 ; https://www.moba.net/page/en/Nieuws/Detail/89/history-and-future-of-crack-detection .
Cost: 2-3 operators per shift, a simple assist screen; trade a low-tech, robust installation for running labour cost.

C4. **Grading as a service: Cboost runs the judgement, the customer buys classified pallets (RaaS, pay per pallet).**
Cboost owns and remotely monitors the installation, staffs the remote review (C1) and adds types centrally (R10);
the customer pays per classified pallet with a guaranteed uptime and error rate. The incentive to meet R5 and R7 then
sits with the party that can fix them, and the customer no longer needs maintenance skills (R8 shrinks to "call
Cboost"). Sources: https://businessmodels.compound.vc/model/raas ;
https://www.robotics247.com/article/robotics_service_model_spreads_beyond_mobile_robot_suppliers_other_systems/Berkshire_Grey .
Cost: Cboost carries capital, service staff and the risk; contract work on SLAs (how a wrong call is counted, who
pays for a stop).

C5. **Identity travels with the pallet, so type is read rather than judged (GRAI tag / pool marking).** If the
pallets come from a known set of owners or pools, each pallet type gets a GS1 GRAI (asset type field) in a barcode,
QR or RFID tag, or the existing pool stamp (EPAL, CHEP colour, LPR) is read; the classification point reads the code
and only judges condition. Untagged or unreadable pallets fall back to visual typing. Removes R6 (same-size types) for
tagged pallets and makes R10 a table entry. Sources: https://www.gs1uk.org/knowledge-hub/standards/what-is-a-grai ;
https://igps.net/rfid-implementation-in-the-warehouse-increases-accuracy-and-throughput/ ;
https://www.freshplaza.com/north-america/article/2198628/euro-pool-system-launches-smart-return-logistics .
Cost: only works if the customer's suppliers or pools tag pallets (needs asking: where do these pallets come from?);
a reader is cheap (low hundreds to a few thousand euro); tagging a pool is the chain's cost, not the machine's.

C6. **Move the condition judgement to the sender or the receiving dock (exchange-class model).** As in EPAL exchange,
where driver and recipient settle the class on handover, or with photo-at-receipt apps, the party that hands the
pallet in declares or photographs its condition, and the price or credit depends on it; the classification point
then only checks a sample and the declared class. Pushes the error cost to the party with the information. Sources:
https://news.epal-pallets.org/PDF/EPAL_Quality_and_Exchange_GB.pdf ; https://www.timocom.co.uk/blog/pallet-exchange-pallet-debt-568492 ;
https://www.blimp-app.com/blog/how-to-document-pallet-damage-inbound-receiving . Cost: a change in the customer's
commercial terms with its suppliers; disputes; still needs a check, but at a sample rate rather than 1000/h.

C7. **Judge condition where it is acted on: classify type only, and let the repair bench decide (CHEP repair-recipe
model reversed).** The classification point sorts by type and a coarse "looks fine / needs a look"; the
usable/repair/discard decision is made by the repair worker who handles the pallet anyway, at the pace of the repair
line. The fast point no longer has to resolve the hard cases. Sources: https://mhwmagazine.co.uk/material-handling-specialist-excel-automation-complete-pallet-inspection-and-repair-system-for-chep.html ;
https://palletenterprise.com/?p=3899 . Cost: needs the customer to accept R3 being answered partly downstream
(conflicts with R3 as stated; worth asking what R3 is used for); more pallets reach the repair area.

C8. **Hand the whole pallet stream to a pallet-management company (outsource the need).** Retailers and DCs contract
a pallet management firm (48forty, on-site recycler crews) that collects, sorts and grades all pallets, often on the
customer's site, paid per pallet or by netting the pallets' value. The customer's classification point disappears or
becomes the contractor's problem. Sources: https://palletenterprise.com/?p=5426 ; https://palletenterprise.com/?p=7702 .
Cost: Cboost would lose the machine sale unless it becomes the contractor's supplier; fits only if the customer is a
pallet user rather than a pallet recycler (unknown).

## Other titles

- Crowd labelling on demand (Mechanical Turk style): median ~37 s per label, too slow for the 3.6 s slot except as an
  offline audit or for training new types (https://arxiv.org/pdf/1602.07641).
- Certified graders with a rule book and periodic audit, as in lumber grading (NHLA / NELMA certification).
- Audit sampling: a person re-judges 1 in N pallets to measure R7 and correct the machine, not to classify.
- Review only on dispute (Hertz model): the machine decides, a person looks only when downstream complains.
- Two-person rule for "discard" calls only, since a wrong discard destroys value.
- Shift the rules: agree a simpler customer rule set (class A/B/C as EPAL does) so fewer cases are borderline.
- Pallet-type catalogue maintained by Cboost centrally, pushed to all sites (fleet learning across customers).
- Buffer and batch: accumulate pallets and judge them off-line at the average rate rather than the peak.
- Reduce type variety upstream: the customer standardises or refuses rare pallet types.
- Pre-sort by source: pallets from one supplier arrive as one type, so type follows the delivery note.
- Customer staff as the "human sensor", with an incentive per correct classification.
- Lease the pallets (pooling) so the customer never owns or judges them.
- Remote operator team shared across several Cboost customers (multiplexing as in remote baggage screening).
