# Proposal for cdr (nl-cboost-ros-tools)

Status 2026-10-29: item 1 (`--missing-only`) withdrawn: the machine starter's bootstrap no longer runs cdr on open
(S9b). Item 4 (`--verify`) was accepted, then withdrawn by us: it only sees checkouts next to `release.sh`, so it
doesn't protect `devbox:volume` or other copies, and wasn't worth its cost. Items 2 and 3 remain optional.

Draft for the colleague who owns cdr; from machine-starter-template.md (round 2, S3/S7).

A dev box runs its bootstrap on every window open. A full `cdr` there moves a checkout on a feature branch back to
its pin without a word, refuses whenever a checkout has an untracked file, and fails offline (spike 2026-10-29).

1. `cdr --missing-only`: resolve as now, clone the repositories that are missing at their resolved commit, and leave
   every existing checkout as it is. Report each existing checkout that is off its pin (another branch, behind),
   with the command to bring it in line. A failed fetch is a warning, not an error, so an offline open still works.
2. Local changes: count only tracked changes (`git status --porcelain --untracked-files=no`, `vcs.py:105`). An
   untracked scratch file doesn't block a checkout from moving.

The full `cdr` stays the explicit update (`bootstrap.sh --update`). Until (1) exists, the machine starter's
bootstrap resolves into a temporary folder and moves in only the missing checkouts (S2b).

4. `cdr --verify <lock> --src <dir>`: for every entry of a lock that is checked out under `<dir>`, refuse unless the
   checkout has no changes and its HEAD is the locked commit; name each one that differs and how (changes, ahead,
   behind, another commit). Entries not checked out pass. A machine's `release.sh` runs it next to the dev box's
   checkouts, so a release never silently leaves out a local fix (machine-starter-template.md, W13).

3. Optional, `cdr --lock lock.repos`: write the lock from the resolution itself (full commit hashes, plus a digest of
   every `dependencies.repos` read, transitive ones too). It replaces the machine's temp-folder resolve, its sha line
   and `vcs export`, and lets a release refuse a lock whose transitive pins changed too.

Note for the machine starter: cdr must be in the base image (nl-cboost-docker-ros2) before the starter's
bootstrap.sh and the app's standalone build can run; today `cboost-ros2-jazzy:0.2.0` has neither cdr nor vcs2l.
