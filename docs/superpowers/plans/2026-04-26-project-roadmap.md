# Public Project Roadmap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish `ROADMAP.md` at the repository root with the content defined in §4 of the design spec, and add a single linking line to `README.md` so users can find it.

**Architecture:** Two text files. `ROADMAP.md` is the source of truth at the repo root. `README.md` gains one paragraph linking to it, placed between `## Browser support` and `## Contributing`. No code, no build changes, no tests in the unit sense — verification is "file exists with the right content and links that resolve."

**Tech Stack:** Markdown only. No tooling beyond `git` and basic shell.

**Spec:** `docs/superpowers/specs/2026-04-26-project-roadmap-design.md`

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `ROADMAP.md` | **Create** at repo root | Public Now/Next/Later roadmap, exactly the content in §4 of the spec |
| `README.md` | **Modify** (insert one paragraph) | Add a "Where this is headed" link to `ROADMAP.md` between the existing `## Browser support` and `## Contributing` sections |

No other files are touched. The design doc itself (`docs/superpowers/specs/2026-04-26-project-roadmap-design.md`) is the spec — it stays as-is and is not edited by this plan.

---

### Task 1: Create `ROADMAP.md` at the repo root

**Files:**
- Create: `ROADMAP.md`

The content below is taken verbatim from §4 of the spec. The link to the expand spec uses a path relative to the repo root (`docs/superpowers/specs/2026-04-26-expandable-rows-design.md`) so it resolves when GitHub renders `ROADMAP.md`.

- [ ] **Step 1: Verify the file does not yet exist**

Run: `test ! -e ROADMAP.md && echo "ok: not present" || echo "FAIL: already exists"`
Expected output: `ok: not present`

If the file already exists, stop and ask the user whether to overwrite — do not proceed silently.

- [ ] **Step 2: Create `ROADMAP.md` with the published content**

Write the following exact content to `ROADMAP.md` at the repository root. The spec §4 mandates that section ordering, section headings, and prose are produced verbatim — only the heading level shifts (the spec used `###` because the content was nested under `## 4. Content`; promoted to top-level here as `##`). A minimal `# Roadmap` H1 is added so the file has a title when rendered standalone.

````markdown
# Roadmap

## Now *(in flight — landing in 0.4)*

The work currently on the `add-expand` branch, plus the things the expand spec named as immediate dependencies.

- **Expandable rows v1** — recursive homogeneous tree, lazy children via `expand` event + `provider.updateRows()`, in-memory expansion that survives pagination, sort, and filter. Spec: [`docs/superpowers/specs/2026-04-26-expandable-rows-design.md`](docs/superpowers/specs/2026-04-26-expandable-rows-design.md).
- **`RowStateProvider` primitive** — generalized per-row flag store; the foundation expansion is built on, and the foundation selection, pinning, and dirty-edited markers will reuse.
- **Selection / mass-action (demo + docs)** — the `MassActionExample` is staged on the same branch; ships alongside expand to demonstrate the primitive's second consumer.
- **`ScrollPagination` height-shift fix** — re-observe the sentinel after row-state changes that affect height, so expanding near the bottom does not trigger a spurious `loadMore`. Named risk in the expand spec.

## Next *(queued — 0.5–0.6 era)*

Items committed to and roughly ordered by priority. No dates.

1. **Persistent `RowStateProvider` variants** — URL and localStorage implementations of the same interface, mirroring how `StateProvider` already has four backends. Natural sequel to the primitive landing in 0.4.
2. **Accessibility and keyboard navigation pass** — ARIA roles on the table, focus management, keyboard shortcuts (arrows, Enter, Space for selection, Esc to collapse). Foundational for 1.0.
3. **TypeScript inference polish** — `Column<T>` infers `key` and `sort` from `keyof T`; generics flow through `Grid`, providers, and slots. Small scope, big DX win.
4. **Inline cell editing** — edit-in-place, dirty markers via `RowStateProvider` (`'dirty'` flag), commit and revert flow, `updateRows`-friendly. Larger feature — gets its own design doc.
5. **CSV and JSON export** — works against current items or the full dataset (via a `DataProvider.exportAll()` extension); column-aware, respects visibility.
6. **Row context menu** — right-click handler with consumer-defined items, ag-Grid-style. Accessible alternative (long-press, dedicated button) for keyboard and touch.

## Later *(directional — confirmed yes, not yet sequenced)*

On the roadmap but not queued. Each gets its own design when it surfaces.

- **Grouped rows** — collapse-by-field rendering (e.g. group users by department), distinct from tree-expand. Reuses `RowStateProvider` for collapse state.
- **GraphQL `DataProvider`** — first-class GraphQL provider alongside `Callback`, `Array`, and `Elastic`.
- **1.0 / API stability commitment** — once the row-interaction surface stops moving, pin the public API and adopt strict semver for breaking changes. Criteria, not a date.

## Out of scope *(intentionally — please do not ask)*

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

## Stability signals

So users know what they can depend on.

| Surface | Status |
|---|---|
| `DataProvider` interface | **Stable** since 0.3 (additive changes only) |
| `StateProvider` interface | **Stable** since 0.3 |
| Slot API (`#row`, `#table`, `#searchRow`, `#empty`, `#loader`, `#pagination`, `#search`) | **Stable** since 0.3 |
| Pagination modes (cursor, page) | **Stable** since 0.3 |
| `RowStateProvider`, `useRowState`, `RowContext`, `Column.expandToggle`, `DataProvider.updateRows` | **Experimental** in 0.4 — public API may change before 1.0 |
````

- [ ] **Step 3: Verify the file was created**

Run: `test -f ROADMAP.md && wc -l ROADMAP.md`
Expected: file exists, line count roughly 50–60.

- [ ] **Step 4: Verify the link to the expand spec resolves**

Run: `test -f docs/superpowers/specs/2026-04-26-expandable-rows-design.md && echo "ok: target exists" || echo "FAIL: link target missing"`
Expected output: `ok: target exists`

If this fails, the link in `ROADMAP.md` is broken — stop and fix before proceeding.

- [ ] **Step 5: Verify section headings exist as expected**

Run: `grep -E '^(# Roadmap|## (Now|Next|Later|Out of scope|Stability signals))' ROADMAP.md | wc -l`
Expected output: `6` (one H1 plus five H2 sections).

If the count differs, the content was truncated or altered — re-write the file with the verbatim content from Step 2.

---

### Task 2: Add a single linking line to `README.md`

**Files:**
- Modify: `README.md` (insert between `## Browser support` and `## Contributing`)

The exact insertion point is between the existing line `Modern evergreen browsers (Chrome, Firefox, Safari, Edge). Vue 3.3+. ES2020+.` and the line `## Contributing`. Per the spec §6, this is one paragraph, no extra prose.

- [ ] **Step 1: Confirm the current README structure around the insertion point**

Run: `grep -n -E '^(## Browser support|## Contributing)' README.md`
Expected output (line numbers may differ slightly):
```
225:## Browser support
229:## Contributing
```

If either heading is missing or the order has changed, stop and ask the user — the README structure assumed by this plan no longer holds.

- [ ] **Step 2: Insert the link paragraph**

Edit `README.md` to insert a new paragraph between the `## Browser support` body and the `## Contributing` heading. The result around that section must read exactly:

```markdown
## Browser support

Modern evergreen browsers (Chrome, Firefox, Safari, Edge). Vue 3.3+. ES2020+.

**Where this is headed:** see [ROADMAP.md](./ROADMAP.md) — published Now / Next / Later, plus what is intentionally out of scope.

## Contributing
```

The new paragraph is one line. Preserve the blank lines above and below exactly as shown — Markdown requires them so the bold-prefixed paragraph renders as its own block.

- [ ] **Step 3: Verify the new paragraph is present and well-formed**

Run: `grep -n 'Where this is headed' README.md`
Expected output: a single match showing the new line.

Run: `grep -n -E '^(## Browser support|## Contributing)' README.md`
Expected: both headings still present, with `## Contributing` now appearing further down (line numbers shifted by +2).

- [ ] **Step 4: Verify `ROADMAP.md` resolves from the README link**

Run: `test -f ROADMAP.md && echo "ok" || echo "FAIL"`
Expected output: `ok`

The link in the README is `./ROADMAP.md`, which resolves against the README's own location (repo root). Since `ROADMAP.md` lives at the repo root from Task 1, this resolves correctly.

- [ ] **Step 5: Run the existing lint to confirm nothing else regressed**

Run: `npm run lint`
Expected: passes (this change touches only Markdown, which ESLint does not parse, but running it confirms we have not accidentally edited a `.ts`/`.vue` file).

If lint fails on something unrelated to this change, that is a pre-existing condition — note it and proceed; do not attempt to fix unrelated lint errors as part of this task.

- [ ] **Step 6: Commit both files together**

Both files belong to the same logical change (publishing the roadmap), so they ship in one commit.

```bash
git add ROADMAP.md README.md
git commit -m "$(cat <<'EOF'
docs: publish public Now/Next/Later roadmap

Adds ROADMAP.md at the repo root with the content defined in the
roadmap design spec — Now / Next / Later buckets, Out-of-Scope
list, stability signals table, and maintenance rules. Links to
it from README.md between Browser support and Contributing.

Spec: docs/superpowers/specs/2026-04-26-project-roadmap-design.md
EOF
)"
```

- [ ] **Step 7: Verify the commit**

Run: `git log --oneline -1 && git show --stat HEAD`
Expected: one new commit, two files changed (`ROADMAP.md` created, `README.md` modified by ~+2 lines).

---

## Acceptance criteria

After both tasks complete, all of the following must be true:

1. `ROADMAP.md` exists at the repository root.
2. `ROADMAP.md` contains all six H2 sections: Now, Next, Later, Out of scope, Stability signals, How this roadmap is maintained.
3. The expand-spec link inside `ROADMAP.md` resolves to an existing file (`docs/superpowers/specs/2026-04-26-expandable-rows-design.md`).
4. `README.md` has exactly one new paragraph linking to `ROADMAP.md`, placed between the `## Browser support` and `## Contributing` sections.
5. The README link `./ROADMAP.md` resolves.
6. Both files are committed together in a single commit on the current branch.
7. `npm run lint` exits zero (or, if it does not, it fails for reasons unrelated to this change).
