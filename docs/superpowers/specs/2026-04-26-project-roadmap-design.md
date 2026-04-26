# Public Project Roadmap — Design

**Date:** 2026-04-26
**Status:** Approved (awaiting implementation plan)
**Scope:** A public-facing roadmap for `@einhasad-vue/datatable-vue`, published to the repository so users and contributors can see where the library is headed.

## 1. Goal

Publish a `ROADMAP.md` at the repository root that:

- Tells users what is shipping next, what is queued, and what is directionally agreed but not yet started.
- States plainly what the maintainers will **not** drive, so requests for those features can be closed quickly without ambiguity.
- Signals which parts of the public API are stable and which are still experimental, so consumers can plan around breaking changes.

The roadmap is a public commitment surface. Anything listed in **Now** or **Next** is something the maintainers intend to ship. Anything in **Later** is directionally agreed but not yet sequenced.

## 2. Audience and shape

- **Audience:** users and contributors of the library, via the GitHub repo.
- **Tone:** committed-but-soft. Only items the maintainers are willing to be held to. No internal speculation, no "maybe never" items.
- **Shape:** **Now / Next / Later**, with no dates. Three buckets keep the roadmap honest at the project's current 0.x stage and allow re-ordering inside a bucket without breaking promises.
- **Out of scope is part of the artifact.** A roadmap that only lists positives invites endless feature requests for everything not mentioned. Listing intentional declines reduces that load.

## 3. Artifact location

- **Public file:** `ROADMAP.md` at the repository root. Linked from `README.md` (a single line under "Why this lib" or near the bottom).
- **Source of truth for changes:** edits to `ROADMAP.md` are made via PR with a short rationale in the description. No separate internal copy.
- **Update cadence:** updated at every release boundary (when a version is cut) and ad-hoc when a Now/Next item is added or moved. Items completed and shipped are removed from Now and noted in `CHANGELOG`/release notes — not preserved in the roadmap as historical record.

## 4. Content

The full content of the published `ROADMAP.md` follows. Section ordering and section headings are part of the design — the implementation plan must produce them verbatim.

---

### Now *(in flight — landing in 0.4)*

The work currently on the `add-expand` branch, plus the things the expand spec named as immediate dependencies.

- **Expandable rows v1** — recursive homogeneous tree, lazy children via `expand` event + `provider.updateRows()`, in-memory expansion that survives pagination, sort, and filter. Spec: [`docs/superpowers/specs/2026-04-26-expandable-rows-design.md`](docs/superpowers/specs/2026-04-26-expandable-rows-design.md).
- **`RowStateProvider` primitive** — generalized per-row flag store; the foundation expansion is built on, and the foundation selection, pinning, and dirty-edited markers will reuse.
- **Selection / mass-action (demo + docs)** — the `MassActionExample` is staged on the same branch; ships alongside expand to demonstrate the primitive's second consumer.
- **`ScrollPagination` height-shift fix** — re-observe the sentinel after row-state changes that affect height, so expanding near the bottom does not trigger a spurious `loadMore`. Named risk in the expand spec.

### Next *(queued — 0.5–0.6 era)*

Items committed to and roughly ordered by priority. No dates.

1. **Persistent `RowStateProvider` variants** — URL and localStorage implementations of the same interface, mirroring how `StateProvider` already has four backends. Natural sequel to the primitive landing in 0.4.
2. **Accessibility and keyboard navigation pass** — ARIA roles on the table, focus management, keyboard shortcuts (arrows, Enter, Space for selection, Esc to collapse). Foundational for 1.0.
3. **TypeScript inference polish** — `Column<T>` infers `key` and `sort` from `keyof T`; generics flow through `Grid`, providers, and slots. Small scope, big DX win.
4. **Inline cell editing** — edit-in-place, dirty markers via `RowStateProvider` (`'dirty'` flag), commit and revert flow, `updateRows`-friendly. Larger feature — gets its own design doc.
5. **CSV and JSON export** — works against current items or the full dataset (via a `DataProvider.exportAll()` extension); column-aware, respects visibility.
6. **Row context menu** — right-click handler with consumer-defined items, ag-Grid-style. Accessible alternative (long-press, dedicated button) for keyboard and touch.

### Later *(directional — confirmed yes, not yet sequenced)*

On the roadmap but not queued. Each gets its own design when it surfaces.

- **Grouped rows** — collapse-by-field rendering (e.g. group users by department), distinct from tree-expand. Reuses `RowStateProvider` for collapse state.
- **GraphQL `DataProvider`** — first-class GraphQL provider alongside `Callback`, `Array`, and `Elastic`.
- **1.0 / API stability commitment** — once the row-interaction surface stops moving, pin the public API and adopt strict semver for breaking changes. Criteria, not a date.

### Out of scope *(intentionally — please do not ask)*

Saying no in public is half the value of a roadmap.

- Virtualized scrolling
- Column resize, reorder, pin, show/hide
- Row drag-and-drop
- Multi-column sort
- Saved views / preset filter+sort+columns
- Detail row / per-row drawer
- Bundled design-system theme adapters (Ant Design, Vuetify, shadcn-vue)
- Per-node child pagination, children caching across collapse/expand, heterogeneous per-level columns *(carried over from the expandable-rows spec)*

A contributor PR for any of these would be considered, but the maintainers will not drive them.

### Stability signals

So users know what they can depend on.

| Surface | Status |
|---|---|
| `DataProvider` interface | **Stable** since 0.3 (additive changes only) |
| `StateProvider` interface | **Stable** since 0.3 |
| Slot API (`#row`, `#table`, `#searchRow`, `#empty`, `#loader`, `#pagination`, `#search`) | **Stable** since 0.3 |
| Pagination modes (cursor, page) | **Stable** since 0.3 |
| `RowStateProvider`, `useRowState`, `RowContext`, `Column.expandToggle`, `DataProvider.updateRows` | **Experimental** in 0.4 — public API may change before 1.0 |

---

## 5. Maintenance rules

These rules guard the roadmap from rotting into a wishlist:

- **Now contains only what is in flight.** When a Now item ships, remove it. Do not promote it to a "Done" section — release notes own that.
- **Next is ordered.** Items in Next are listed in rough priority order. Re-ordering inside Next is fine and does not require deprecating anything.
- **Later is unordered.** Items in Later are confirmed in direction but not sequenced. Promotions to Next happen via PR.
- **Out of scope is sticky.** Removing an item from Out of Scope is a deliberate signal — it means the maintainers have changed their position. Do this only when actively planning to ship the item.
- **No dates.** The 0.x release cadence does not justify date commitments. Versions named in section headers ("0.4", "0.5–0.6") are directional, not dated.
- **Stability table is authoritative.** When a feature graduates from experimental to stable, update the table and announce in release notes. Do not let the table drift from reality.

## 6. README integration

A single line is added to `README.md`, not a full mirror of the roadmap:

```markdown
**Where this is headed:** see [ROADMAP.md](./ROADMAP.md) — published Now / Next / Later, plus what is intentionally out of scope.
```

Placed near the bottom, before "Contributing".

## 7. Out of scope (for this design)

- A separate internal/private planning doc. The maintainer chose a public-only roadmap; an internal doc would duplicate maintenance and drift.
- A GitHub Projects board mirror. The roadmap is the source of truth; mirroring into Projects creates a second update target.
- Per-item issue links. Roadmap items map to issues organically; the roadmap itself stays narrative-style without dense link tables that rot.
- Item-level "% complete" or "ETA" annotations. The Now / Next / Later split already encodes commitment level; finer-grained signals overcommit at this stage.
