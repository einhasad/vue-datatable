# Changelog

All notable changes to `@einhasad-vue/datatable-vue` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
Before 1.0, a behaviour change bumps the minor version and a fix bumps the patch version.

## [0.5.1] - 2026-11-27

### Fixed
- `ScrollPagination` checks the sentinel again when `loading` turns false, so it keeps loading when the sentinel is still in view after a load; before, scrolling stopped until the user scrolled away and back.
- The column filter input shows one focus ring (on `.grid-search-input-wrap`) even when the page has its own global `:focus-visible` outline.

### Demo site
- Infinite Scroll example keeps the visible rows in place when its 100-row window slides forward, so reaching the bottom loads one page instead of jumping.
- Filter inputs show a single focus ring in the demo theme.

## [0.5.0] - 2026-11-27

### Security
- Cell values, `value()` results, column footers and `ComponentOptions.content` are rendered as plain text instead of HTML, so row data can no longer inject markup or script. To render HTML on purpose, return a native element with `props: { innerHTML }` from `column.component` and sanitize the string yourself (see "Changed").

### Changed
- Cells and footers no longer interpret HTML; columns whose `value()`/`footer()` return markup now show it literally. Move such columns to `component: () => ({ is: 'span', props: { innerHTML: trustedHtml } })`.
- `ComponentOptions.content` renders as plain text. To render trusted HTML, pass `props: { innerHTML: html }` on a native element (e.g. `{ is: 'span', props: { innerHTML: html } }`) and sanitize it yourself; `content` and `children` are ignored when `innerHTML` is set.
- `PagePagination` renders `<nav aria-label="Pagination">` with `<button type="button">` controls (`aria-current="page"`, disabled prev/next at the edges, aria-labels "Previous page"/"Next page"). The sort control is `<button type="button" class="grid-sort-link">` instead of `<a href="">`. Class names are unchanged and the default CSS selectors are element-agnostic: custom CSS targeting `a.grid-pagination-*` or `a.grid-sort-link` must drop the `a`.
- The column footer row is rendered inside `<tfoot>` instead of `<tbody>` (class names unchanged). Selectors like `tbody .grid-footer-row` must use `tfoot .grid-footer-row` or `.grid-footer-row`.
- Rows with `onRowClick` and cells with `column.action` get `tabindex="0"` and activate on Enter/Space; rows and cells without handlers are unchanged. Remove any `tabindex` or key handlers you added yourself for the same purpose.
- The default filter row (`GridSearch`) renders one cell per visible column, empty where the column has no filter, so filters sit under their headers. Custom CSS or tests that counted `.grid-search-cell` elements must expect one per visible column.
- `--grid-focus-shadow-color` is now a solid colour used for visible focus outlines (default `#1677ff`; classic/material themes updated). Override it if you relied on the faint 10% glow.
- `--grid-empty-color` default darkened to `#767676` (classic/material themes updated) for 4.5:1 text contrast. Override the variable to keep the old colour.
- `ArrayDataProvider` defaults to an `InMemoryStateProvider` when no `stateProvider` is given, so columns with `filter` show the filter row and filter the data. Pass your own `stateProvider` to persist state elsewhere, or remove `filter` from columns that should not be filterable.
- `ArrayDataProvider.setRows()` replaces only the currently displayed rows inside the dataset and keeps rows on other pages (previously it replaced the whole dataset). Use `setAllItems()` to replace everything.
- `CallbackDataProvider.getStateProvider()` returns a state provider (default `InMemoryStateProvider`) instead of `null`, and `loadFn` now receives `searchParams` from it. If you filtered outside the grid, remove the duplicate filter handling or pass your own `stateProvider`.
- `InMemoryRowStateProvider.entries()` returns row keys with the type they were set with (`'7'` stays a string, `7` stays a number); previously numeric-looking string keys came back as numbers. Remove any workaround that converted `entries()` keys back to strings or relied on numbers for string ids.
- `RouterLike`/`RouteLocation` query values are widened to `string | null | (string | null)[] | undefined`, so a vue-router `Router` is assignable without a cast. Custom `RouterLike` implementations whose `replace()` parameter type is narrower than `RouteLocation` must accept `null` query values.
- `package.json` `exports` lists `types` first, exposes `./package.json`, and declares `sideEffects` for CSS files only so bundlers can tree-shake the JS. Keep importing the CSS files you use.
- Removed the stray optional `vue-router` peer dependency metadata; the library never imports vue-router. No action needed.

### Deprecated
- The `./themes` JS entry (it re-exports the main bundle). Import from the package root instead. Removal planned for 1.0.

### Added
- `#toolbar` slot (props `{ loading }`) renders above the search slot and table; it was declared in the typings but never rendered.
- `CallbackDataProvider` accepts an optional `stateProvider` (default: `new InMemoryStateProvider()`), so Grid shows the filter row.
- Sortable header cells expose `aria-sort` (ascending/descending/none); the default loader has `role="status"`.
- Type exports `ArrayDataProviderConfig`, `SortOrder`, `RouterLike`, `RouteLocation`.
- Releases are published from GitHub Actions with npm provenance (Trusted Publishing).

### Fixed
- `column.value(model, index)` and `column.component(model, index)` receive the real row index instead of always 0.
- A function `label` (`(items) => string`) is rendered (called with the current items) instead of an empty header; `GridColumnHeader` accepts an optional `items` prop.
- Date field values render as an ISO string (`2026-01-02T00:00:00.000Z`) instead of a JSON-quoted string; invalid Dates render empty.
- `<ResetButton>` placed inside `<Grid>` works: Grid provides its data provider and state provider (`useGridDataProvider()` / `useGridState()` return them inside Grid slots).
- A sort stored in the state provider (restored from URL/localStorage or set via `stateProvider.setSort()`/`clearSort()`) is applied to the data provider, reloads the grid (back to page 1) and shows in the header.
- The header sort indicator follows `dataProvider.setSort()` called outside the Grid.
- `ArrayDataProvider` applies the sort stored in its StateProvider on first load, and `getSort()` is reactive so the header indicator follows sorts set outside the Grid.
- `ArrayDataProvider` with a StateProvider no longer empties the grid after a page change (the Grid's stored `page` value is no longer treated as a filter).
- `ArrayDataProvider` pagination totals count only rows matching the active filters, update reactively after `setAllItems()`/`setRows()`, and an out-of-range page is clamped to 1..last page.
- `CallbackDataProvider.load()`/`refresh()` pass the current sort (`sortField`/`sortOrder`) and non-empty state-provider filters (`searchParams`, excluding `page`) to `loadFn`; previously it always received `{ sortOrder: null }`.
- `CallbackDataProvider` uses the `pagination` returned by `loadFn` (`currentPage`, `pageSize`, `totalItems`, `totalPages`) to update the offset pagination state, so the page pager renders. Requires `offsetPaginationFn` to be configured.
- `CallbackDataProvider` ignores responses of superseded requests; only the latest `load()` updates items, pagination and the loading flag.
- `DefaultElasticResponseAdapter` is exported as a value, so `new DefaultElasticResponseAdapter()` works.
- `QueryParamsStateProvider` and `HashStateProvider` follow route changes (initial navigation after construction, back/forward, `router.push`) and re-sync filters and sort.
- Two state writes in the same tick (e.g. sort + page reset, or two grids sharing a router) no longer drop the first one.
- `HashStateProvider` reads hash URLs written by 0.4.x correctly after reload when values contain `&`, `=` or `%` (hash format unchanged); a malformed `%` sequence no longer throws.
- `QueryParamsStateProvider` ignores valueless query params (`?search-name`) and keeps unrelated valueless params on write.
- URL state providers no longer cause an unhandled promise rejection when `router.replace()` rejects (e.g. an aborted or duplicated navigation).
- `LocalStorageStateProvider` no longer throws when the stored entry is invalid JSON or has an unexpected shape; it starts with empty state and overwrites the entry on the next change. No action needed.
- `LocalStorageStateProvider` is SSR-safe and works in memory when `localStorage` is unavailable or access throws (private mode, blocked storage, quota exceeded). No action needed.
- `useFilterField({ lazy: false })` commits every `localValue` edit to the state provider (blank clears the filter); `lazy` was ignored before. Default (lazy) behaviour is unchanged.
- Column `filter.placeholder` (string) is used as the filter input placeholder; falls back to the column label as before.
- Filter inputs and selects in the default filter row have an accessible name ("Filter by &lt;column label&gt;") and no longer carry `size="1"`.
- Filter inputs show a visible focus ring and keep a usable minimum width (6rem) on narrow screens.
- Clickable rows (`onRowClick`) and action cells show a visible keyboard focus ring.
- `--grid-loader-color` sets the loading indicator colour (default unchanged: follows `--grid-empty-color`).
- Sort control and row chevron are at least 24x24px; the pagination summary and scroll-pagination loading text are announced via a polite live region (`role="status"`).
- The pagination summary never shows an inverted or negative range ("Showing 81-47", "-9-0") when the page is out of range or there are no items.
- The undefined-row-key development warning reaches consumers' dev builds (guarded by `process.env.NODE_ENV !== 'production'`) instead of being compiled out of the published bundle.
- Published type declarations are complete again: Grid and the other components keep their typed props, emits and slots instead of collapsing to `any` (vite-plugin-dts upgraded; dangling `__VLS_*` references removed). Projects with `skipLibCheck: false` no longer get errors from this package.

### Demo site
- Version and Vue range are read from `package.json`; brand and Docs links go to the docs root; the API reference lists every Grid prop, slot and event plus a Column table; no dead Discussions link.
- Menu drawer below 960px, visible keyboard focus rings, readable contrast, scrollable API tables and example tabs on mobile, reduced-motion support.
- Meta description, Open Graph and Twitter card tags with a social preview image.
- QueryParams state is restored from the URL on load (router uses the `/vue-datatable/` base and waits for the initial navigation before mounting).
- "HTTP Provider" example uses `CallbackDataProvider` with an async `loadFn` (works on the static site without MSW) and no longer links to non-existent GitHub repositories.
- Infinite-scroll example: search returns results, "Sort by" ascending options work, and sort applies to all 10,000 rows and agrees with the column headers.
- Mass Action "Delete selected" removes exactly the selected rows across pages; Expandable Rows keeps all departments after expand + page change; Customizing "Loading…" shows the `#loader`; the Cursor example uses the keyset API (`CallbackDataProvider` + `setKeysetPagination`).
- InMemory, LocalStorage and MultiState examples have page pagination; form controls have linked labels; status badges meet 4.5:1 contrast; rows in Row Actions are selectable from the keyboard.

## [0.4.4] - 2026-05-21

### Fixed
- Offset pagination state is reactive in `CallbackDataProvider`, `ArrayDataProvider` and `ElasticSearchDataProvider`, so the pagination text updates when the provider changes state during `loadFn` or an external `refresh()`.
- Changing a non-page filter resets the grid to page 1.

## [0.4.3] - 2026-05-15

### Fixed
- `useFilterField` no longer reapplies `defaultValue` after the filter is cleared; `defaultValue` is only the initial value.

## [0.4.2] - 2026-04-27

### Added
- `#headerCell` slot on `<Grid>` (previously only rendered on `<GridTable>`).

### Changed
- The `#searchRow` slot and the default filter row render inside `<thead>` instead of `<tbody>`. Code that walks `tbody` rows sees one fewer row.

## [0.4.1] - 2026-04-26

### Fixed
- The npm tarball no longer ships MSW mocks (`dist/mocks/*`, `dist/mockServiceWorker.js`).

## [0.4.0] - 2026-04-26

### Added
- Expandable rows: mark a column with `expandToggle: true`, handle `@expand` on `<Grid>` and attach children via `DataProvider.setRows()`.
- `RowStateProvider` interface, `InMemoryRowStateProvider` and the `useRowState()` composable for per-row reactive flags (expanded, selected, ...).
- `DataProvider.setRows(rows)` on `ArrayDataProvider`, `CallbackDataProvider` and `ElasticSearchDataProvider`.
- `column.component` receives an optional third `RowContext` argument (`depth`, `rowKey`, `isExpanded`, `isExpandable`, `toggle`, `rowState`).
- Rows carry `data-depth` and `data-row-key` attributes; dev-mode warning when `rowKey` resolves to `undefined`.

## [0.3.0] - 2026-04-26

### Removed
- `<Grid>` no longer exposes `refresh`, `items` or `loading`. Call `dataProvider.refresh()` on the provider you own.
- The `theme` prop and built-in dark-mode default styles. Import a theme file or override the `--grid-*` custom properties.

### Changed
- Text filters commit on Enter or blur instead of on every keystroke.

### Fixed
- Grid state and infinite scroll sync on first paint; scroll pagination loads in both directions and compensates the scroll offset.

## [0.2.0] - 2026-04-22

### Changed
- First release as `@einhasad-vue/datatable-vue` (previously `@grid-vue/grid`), with a rewritten API: explicit `KeysetPaginationState` / `OffsetPaginationState` / `PaginationInfo`, `DataProvider.setKeysetPagination` / `setOffsetPagination` / `getStateProvider`, generic `ComponentOptions<T>` with an `events` map, and nullable `SortState.order`.

### Added
- `CallbackDataProvider`, `ElasticSearchDataProvider`, `ResetButton`, `GridColumnHeader`, `GridSearch`, `useFilterField`, `useGridState` and `useGridDataProvider`.

### Removed
- `HttpDataProvider`, `GridPagination`, `LoadModePagination`, response adapters and the `loadMore` / `hasMore` / `getCurrentPagination` / `setPage` provider methods.
