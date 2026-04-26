# Expandable Rows (Multi-Layer, Homogeneous Tree) — Design

**Date:** 2026-04-26
**Status:** Approved (awaiting implementation plan)
**Scope:** v1 of the expandable-rows feature for `@grid-vue/grid`.

## 1. Goal

Add support for expandable rows that form a homogeneous tree of unbounded depth: every level renders with the same columns, children are loaded lazily on expand, and the open/closed state is tracked in memory so it survives pagination, sort, and filter changes within a session.

The feature is built on a generalized **row-state primitive** that other features (mass-action selection, pinning, dirty-edited markers) can reuse. The library does not own child fetching; it emits an event, and the consumer fetches and mutates items via a new `DataProvider.updateRows()` method.

## 2. Non-Goals (Explicitly Deferred)

- Per-node child pagination.
- Caching children across collapse/expand cycles (semantics are "refetch every expand").
- Persistent expansion state in URL / localStorage / hash. The `RowStateProvider` interface admits this later as a new implementation, but v1 ships only `InMemoryRowStateProvider`.
- Heterogeneous schemas per level (different columns per level).
- A separate `isExpandable` predicate prop. v1 treats a row as expandable iff the `childrenField` accessor is defined for the grid (every row shows the toggle).

## 3. Architecture Overview

```
[User clicks chevron]
        |
        v
GridTable.onToggle(item)
        |
        v
rowStateProvider.toggle(rowKey(item), 'expanded')
        |
        v
If now expanded AND no children attached:
   Grid emits  expand(item, { depth, rowKey })
        |
        v
Consumer handler:
   const children = await api.getChildren(item.id)
   const updated  = currentItems.map(it =>
                      it === item ? { ...it, children } : it)
   provider.updateRows(updated)
        |
        v
Grid re-renders; rows recurse on item.children with depth + 1
```

The library is intentionally dumb about the data layer. It exposes:

- A toggle UI affordance (chevron + indentation) tied to a column flag.
- A reactive in-memory per-row state store, keyed by a stable row id.
- A new `DataProvider` mutation point (`updateRows`) for content swaps that bypass `load()`.
- Recursive depth-aware rendering when an item has children attached and is marked expanded in row state.

## 4. File Layout

```
src/
  types.ts                          # + RowStateProvider, + Column.expandToggle, + DataProvider.updateRows, + RowContext
  rowState/
    RowStateProvider.ts             # interface
    InMemoryRowStateProvider.ts     # default implementation (reactive Map)
    injection.ts                    # Vue InjectionKey<RowStateProvider>
    index.ts                        # barrel
  composables/
    useRowState.ts                  # injects provider, binds rowKey, item-aware API
  Grid.vue                          # provides RowStateProvider, accepts new props, emits expand/collapse
  GridTable.vue                     # consumes RowStateProvider, recursive rendering, expandToggle column rendering
__tests__/
  rowState/
    InMemoryRowStateProvider.spec.ts
  Grid.expandable.spec.ts
  Grid.selection.spec.ts            # sanity for the reused selection use case
  composables/useRowState.spec.ts
demo/
  components/
    ExpandableRowsExample.vue
    MassActionExample.vue           # demonstrates same RowStateProvider used for selection
```

The `src/rowState/` layout mirrors `src/state/` exactly so the pattern is familiar to anyone who has worked with `StateProvider` implementations.

## 5. Type Changes (`src/types.ts`)

The user has explicitly approved the following additions to `types.ts`. No existing types are modified except by additive optional fields.

```ts
export type RowKey = string | number

export interface RowStateProvider {
  get(rowKey: RowKey, flag: string): unknown
  set(rowKey: RowKey, flag: string, value: unknown): void
  toggle(rowKey: RowKey, flag: string): void
  delete(rowKey: RowKey, flag: string): void
  entries(flag: string): RowKey[]
  clear(flag: string): void
  state: Readonly<Record<RowKey, Record<string, unknown>>>
}

export interface RowContext {
  depth: number
  rowKey: RowKey
  isExpanded: boolean
  isExpandable: boolean
  toggle: () => void
  rowState: RowStateScoped // bound to this row, generic flag access
}

export interface RowStateScoped {
  get(flag: string): unknown
  set(flag: string, value: unknown): void
  toggle(flag: string): void
  delete(flag: string): void
}
```

Additions to existing interfaces:

```ts
export interface Column<T> {
  // ...existing fields...
  expandToggle?: boolean
  // existing component signature gains a third optional arg (backward compatible):
  component?: (model: T, index: number, rowContext?: RowContext) => ComponentOptions
}

export interface DataProvider<T> {
  // ...existing methods...
  updateRows(newRows: T[]): void
}
```

`updateRows` is a content swap. It does not touch pagination state, sort state, filter state, or the loading flag. It replaces the items array reactively so the grid re-renders. Existing provider methods are unchanged.

## 6. `RowStateProvider` Interface

Flag-agnostic. The provider does not know about `'expanded'`, `'selected'`, or any other domain concept. Those are string keys agreed on between the library and consumers.

- `get(rowKey, flag)` — reads a single flag for one row.
- `set(rowKey, flag, value)` — writes a single flag for one row. Reactive.
- `toggle(rowKey, flag)` — boolean toggle convenience.
- `delete(rowKey, flag)` — removes the flag for that row (different from `set(_, _, false)` — `delete` removes the entry).
- `entries(flag)` — returns the row keys where the flag is truthy. Used by selection-style consumers ("which rows are selected?"). Returns `RowKey[]` not `T[]`; consumers can resolve to items via the current items list if needed.
- `clear(flag)` — removes the flag from every row. Used to clear a selection in one call.
- `state` — readonly reactive surface for templates.

The library uses `'expanded'` internally for expansion. The flag namespace is open; consumers can pick any string for their own features.

### Default implementation: `InMemoryRowStateProvider`

Backed by a Vue `reactive()` `Record<RowKey, Record<string, unknown>>`. Keys with no flags are pruned (so an empty record never lingers). State lives only in the component's lifetime — page reload clears it.

## 7. `useRowState` Composable

Thin item-aware wrapper:

```ts
const rowState = useRowState() // injects RowStateProvider, reads rowKey from Grid context

rowState.isExpanded(item)             // sugar: provider.get(rowKey(item), 'expanded') === true
rowState.toggleExpanded(item)         // sugar: provider.toggle(rowKey(item), 'expanded')
rowState.get(item, 'selected')        // generic passthrough, item-aware
rowState.set(item, 'selected', true)
rowState.toggle(item, 'selected')
rowState.entries('selected')          // returns RowKey[] (consumer can resolve to T[])
rowState.clear('selected')
```

`useRowState` is the public API surface. The underlying `RowStateProvider` is the extension point.

## 8. Grid Props, Events, and Provided Context

### New props on `<Grid>`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `rowKey` | `(item: T) => RowKey` | `(item) => item.id` | Required in practice; default works only if items have an `id` field |
| `childrenField` | `string \| ((item: T) => T[] \| undefined)` | `'children'` | Where the renderer looks for nested rows. A string is normalized internally to `(item) => item[field]`; an accessor is used as-is. |
| `rowStateProvider` | `RowStateProvider` | new `InMemoryRowStateProvider()` | Injected via the new InjectionKey so descendants and `useRowState` can access it |

### New events emitted by `<Grid>`

```ts
emit('expand',   item: T, ctx: { depth: number, rowKey: RowKey })
emit('collapse', item: T, ctx: { depth: number, rowKey: RowKey })
```

`expand` fires on first click that opens a row, AND when an already-open row reappears without children (auto re-emit; see §10).

### Vue InjectionKey

A new `rowStateInjectionKey: InjectionKey<RowStateProvider>` is exported from `src/rowState/injection.ts`. `Grid.vue` calls `provide(rowStateInjectionKey, props.rowStateProvider ?? new InMemoryRowStateProvider())`. `useRowState` calls `inject(rowStateInjectionKey)`.

### `RowContext` (third arg to `column.component`)

Backward-compatible signature change. Existing two-arg `column.component(model, index)` calls continue to work; the third arg is optional. Consumers who want to drive expansion or any other flag from a custom cell button read `rowContext`:

```ts
{
  is: 'button',
  events: { click: () => rowContext.toggle() }
}
```

## 9. Toggle UX

Two modes, per the user's "B + C" choice.

**B — Default chevron in a flagged column.** A `Column<T>` with `expandToggle: true` gets a chevron prepended to its cell content, plus left-padding proportional to depth. Library renders the chevron as a small built-in component; CSS variable `--grid-depth-indent` controls indent step. Click toggles expansion via `RowStateProvider.toggle(rowKey, 'expanded')`.

**C — Custom button.** Any `column.component` can receive `rowContext` (third arg) and render any UI it wants. Calling `rowContext.toggle()` is equivalent to clicking the default chevron. This is also the integration point for selection checkboxes — they call `rowContext.rowState.toggle('selected')` on click.

The two modes coexist. A grid can have an `expandToggle: true` column AND additional columns whose components read `rowContext` for selection or other flags.

## 10. Data Flow Semantics

### Expand (cold)

1. User clicks chevron on a row whose state is not "expanded" and which has no `children` attached.
2. Library: `rowStateProvider.toggle(rowKey, 'expanded')` → state is now `expanded: true`.
3. Library: emits `expand(item, ctx)` because the row is now expanded but has no children.
4. Consumer: fetches children, mutates the item to attach them, calls `provider.updateRows(updated)`.
5. Grid re-renders. Row is open, children render at depth + 1.

### Expand (warm — children already attached)

1. User clicks chevron on a row that has `children` already attached and is currently collapsed.
2. Library: `rowStateProvider.toggle(rowKey, 'expanded')` → state is now `expanded: true`.
3. Library: does NOT emit `expand` (children already present).
4. Grid re-renders.

This case effectively does not occur during normal use because of the next case (collapse always discards), but is documented for completeness.

### Collapse

1. User clicks chevron on an open row.
2. Library: `rowStateProvider.toggle(rowKey, 'expanded')` → state is now `expanded: false`.
3. Library: emits `collapse(item, ctx)`.
4. Convention: consumer's collapse handler discards the children on the item via `provider.updateRows(...)`. The library does not enforce this. The user has chosen "refetch every expand" semantics (no caching), so consumers should drop children on collapse to keep memory bounded.
5. Grid re-renders. Children rows disappear.

### Refresh / pagination / sort / filter

1. Provider's `load()` returns a new items list (different page, different filter, etc.).
2. `RowStateProvider` is **not** cleared. Expansion flags persist by row id.
3. For each new item, the library checks: if `rowState.get(rowKey(item), 'expanded') === true` AND the item has no children attached (per `childrenField`), the library auto-emits `expand(item, ctx)`.
4. Consumer's existing `expand` handler runs naturally and re-fetches children.
5. Net effect: pagination "remembers" what was open without consumer effort.

### Auto re-emit guarantees

Auto re-emit is triggered by a watcher on the items array reference (not deep). When the items array reference changes (new page, refresh, sort, filter), the library walks the new top-level items once and emits `expand` for any that satisfy: `rowState.get(rowKey(item), 'expanded') === true` AND `childrenField(item)` is empty/undefined. Reactive re-renders that do not change the items reference do NOT re-trigger auto re-emit. Once the consumer attaches children via `updateRows`, the items reference changes, the walk re-runs, and the guard fails (children present), so no further emits fire for that item.

## 11. Rendering (`GridTable.vue`)

Recursive `<tr>` rendering. Pseudocode:

```
function renderRows(items, depth = 0) {
  for (const item of items) {
    <tr data-depth={depth} data-row-key={rowKey(item)}>
      for (const column of columns) {
        if (column.expandToggle) {
          render <ChevronIndent
            depth={depth}
            expanded={rowState.isExpanded(item)}
            onClick={() => rowState.toggleExpanded(item)} />
        }
        render cell (existing logic, passing rowContext to column.component)
      }
    </tr>
    if (rowState.isExpanded(item) && childrenField(item)?.length) {
      renderRows(childrenField(item), depth + 1)
    }
  }
}
```

- All rows are sibling `<tr>`s. There is no nested `<table>`.
- `data-depth` attribute drives `padding-left: calc(var(--grid-depth-indent) * var(--depth))` via CSS for the `expandToggle` column's cell.
- The chevron is a small built-in component, sized via existing CSS variables.
- The existing `row` slot continues to override the entire row loop for power users; default rendering uses the recursive logic above.

## 12. Warnings (Dev Mode)

In `import.meta.env.DEV`, if `rowKey(item)` returns `undefined` for any item the grid encounters during render, the library logs once (deduplicated):

> `[grid] rowKey returned undefined for an item — row-state features (expansion, selection, etc.) won't persist across pagination/filter. Provide :row-key="(item) => item.someId".`

When `rowKey` returns `undefined`, all `RowStateProvider` operations on that item are no-ops. The grid still renders. This prevents undefined-keyed entries from polluting the state map.

The default `(item) => item.id` is intentionally permissive: it works without configuration on items that have an `id` field, and surfaces a clear, actionable warning when it doesn't.

## 13. Interaction With Existing Features

- **Existing `row` slot.** Power users override the entire row loop and forfeit recursive rendering, depth-indent, and chevron — they own everything. The slot signature is unchanged.
- **`column.component` two-arg form.** Backward compatible. Existing call sites continue to work; the optional third arg is new.
- **`column.action`.** Unchanged. Still fires on cell click.
- **`onRowClick`.** Unchanged. Still fires on row click. Chevron click stops propagation so it does not also trigger row click.
- **`ScrollPagination`.** Known-risk: expanding a row near the bottom of the visible region can shift the sentinel into view and fire a spurious `loadMore`. Mitigation in v1: re-observe sentinel after row-state changes that affect height. Detailed mitigation belongs in the implementation plan, not this spec.
- **`StateProvider`.** Unchanged. Expansion state lives in `RowStateProvider`, deliberately separate. The two providers are independent.
- **`DataProvider.refresh()`.** Unchanged. Auto re-emit semantics make it work correctly with persistent expansion state.

## 14. Testing

- `__tests__/rowState/InMemoryRowStateProvider.spec.ts` — get/set/toggle/delete/entries/clear, reactivity, pruning of empty entries.
- `__tests__/Grid.expandable.spec.ts` —
  - chevron renders for `expandToggle` columns
  - click toggles state and emits `expand`/`collapse`
  - depth-indent applied via `data-depth`
  - recursive rendering of children at depth + 1
  - refresh preserves state
  - auto re-emit fires when an expanded row reappears without children
  - pagination preserves state
  - `rowKey` returning `undefined` triggers dev warning + state ops are no-ops
- `__tests__/Grid.selection.spec.ts` — sanity check that the same `RowStateProvider` instance handles a `'selected'` flag across rows for the mass-action use case.
- `__tests__/composables/useRowState.spec.ts` — bound API correctness, generic flag passthrough, item-aware ergonomics.
- Demos: `ExpandableRowsExample.vue` (lazy homogeneous tree) and `MassActionExample.vue` (selection checkboxes reusing the row-state primitive).

Test count target: existing 365 + ~25 new = ~390. Coverage thresholds (50%) preserved.

## 15. Open Items / Risks

- **Children-discard convention on collapse.** The library does not enforce this. If a consumer keeps children attached after collapse, expand-after-collapse is a warm expand (no re-fetch, no `expand` emit). This matches the flexibility model but should be documented in the consumer-facing README/example.
- **`ScrollPagination` height shift.** Detailed mitigation deferred to the implementation plan.
- **Performance of auto re-emit.** With many open rows after a paginated re-load, the library iterates items at render and emits per item. v1 accepts this; if it becomes a hot path, batched emit or a single `expand-many` event is a future refinement.

## 16. Out of Scope (Reaffirmed)

- Per-node child pagination
- Children caching across collapse/expand
- Persistent expansion state (URL/localStorage/hash) — left to a future `RowStateProvider` implementation
- Heterogeneous per-level columns
- Explicit `isExpandable` predicate prop
