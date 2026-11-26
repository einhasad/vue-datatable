<template>
  <header class="ds-header">
    <div class="ds-header__inner">
      <button
        ref="menuButton"
        type="button"
        class="ds-header__menu"
        :aria-expanded="menuOpen"
        aria-controls="ds-sidebar"
        aria-label="Sections"
        @click="menuOpen = !menuOpen"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          aria-hidden="true"
        ><path d="M3 5h14M3 10h14M3 15h14" /></svg>
      </button>
      <a
        :href="docsRoot"
        class="ds-header__brand"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          aria-hidden="true"
        >
          <rect
            width="22"
            height="22"
            rx="5"
            fill="#FFC833"
          />
          <rect
            x="5"
            y="7"
            width="12"
            height="1.5"
            rx="0.75"
            fill="#1A1505"
          />
          <rect
            x="5"
            y="10.25"
            width="12"
            height="1.5"
            rx="0.75"
            fill="#1A1505"
          />
          <rect
            x="5"
            y="13.5"
            width="7"
            height="1.5"
            rx="0.75"
            fill="#1A1505"
          />
        </svg>
        <span class="ds-header__wordmark">
          <span class="ds-header__wordmark-scope">@einhasad-vue/</span>datatable-vue
        </span>
        <span class="ds-header__version">v{{ version }}</span>
      </a>
      <nav
        class="ds-header__nav"
        aria-label="Site"
      >
        <a
          :href="docsRoot"
          class="is-active"
          aria-current="page"
        >Docs</a>
        <a
          href="https://github.com/einhasad/vue-datatable"
          target="_blank"
          rel="noopener"
        >GitHub</a>
      </nav>
      <div class="ds-header__spacer" />
      <div class="ds-header__tools">
        <a
          class="ds-icon-btn"
          href="https://github.com/einhasad/vue-datatable"
          aria-label="GitHub"
          target="_blank"
          rel="noopener"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
          ><path d="M12 2a10 10 0 00-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.1.63-1.35-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.58 9.58 0 015 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0012 2z" /></svg>
        </a>
      </div>
    </div>
  </header>

  <div class="ds-layout ds-layout--no-toc">
    <aside
      id="ds-sidebar"
      class="ds-sidebar"
      :class="{ 'is-open': menuOpen }"
      aria-label="Sections"
    >
      <div
        v-for="group in navGroups"
        :key="group.label"
        class="ds-sidebar__group"
      >
        <span class="ds-caps ds-sidebar__label">{{ group.label }}</span>
        <ul>
          <li
            v-for="link in group.links"
            :key="link.id"
          >
            <a
              :href="`#${link.id}`"
              class="ds-sidebar__link"
              :class="{ 'is-active': activeSection === link.id }"
              :aria-current="activeSection === link.id ? 'location' : undefined"
              @click.prevent="scrollTo(link.id)"
            >{{ link.title }}</a>
          </li>
        </ul>
      </div>
    </aside>

    <main class="ds-main ds-prose">
      <section class="ds-hero">
        <div class="ds-hero__grid-bg" />
        <div class="ds-hero__content">
          <div class="ds-hero__eyebrow">
            <span class="ds-hero__eyebrow-tag">v{{ version }}</span>
            <span>Pluggable providers · Vue {{ vueRange }}</span>
          </div>
          <h1 class="ds-hero__title">
            Tables that <em>scale</em>,<br>not tables that fight you.
          </h1>
          <p class="ds-hero__lede">
            A framework-agnostic DataTable for Vue 3 with pluggable data providers, dual pagination modes,
            custom state persistence, and a rendering layer you can opt into — or replace entirely.
          </p>
          <div class="ds-hero__ctas">
            <div class="ds-install">
              <span class="ds-install__dollar">$</span>
              <span class="ds-install__cmd">{{ installCommand }}</span>
              <button
                class="ds-install__copy"
                :class="{ 'is-copied': installCopied }"
                :aria-label="installCopied ? 'Copied' : 'Copy install command'"
                type="button"
                @click="copyInstallCommand"
              >
                <template v-if="installCopied">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ><path d="M4 10l4 4 8-8" /></svg>
                  <span class="ds-install__copy-label">Copied!</span>
                </template>
                <svg
                  v-else
                  width="14"
                  height="14"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ><rect
                  x="7"
                  y="7"
                  width="10"
                  height="10"
                  rx="1.5"
                /><path d="M13 7V4.5A1.5 1.5 0 0011.5 3h-7A1.5 1.5 0 003 4.5v7A1.5 1.5 0 004.5 13H7" /></svg>
              </button>
            </div>
            <a
              class="ds-btn ds-btn--primary"
              href="#basic"
            >Read the docs →</a>
            <a
              class="ds-btn ds-btn--ghost"
              href="https://github.com/einhasad/vue-datatable"
              target="_blank"
              rel="noopener"
            >GitHub ↗</a>
          </div>
        </div>
      </section>

      <h2
        id="introduction"
        class="demo-section"
      >
        Introduction
      </h2>
      <p class="ds-lede">
        <code>@einhasad-vue/datatable-vue</code> is the table layer built to handle sort, filter, paginate,
        and state persistence — so your code doesn't have to.
      </p>
      <p>
        Give it a <strong>data provider</strong> (array, callback, Elasticsearch, or your own) and a <strong>column definition</strong>,
        and it runs. Swap in a <code>StateProvider</code> to persist state to the URL, localStorage, or a hash fragment.
        Replace any part via slots. That's the whole model.
      </p>

      <div class="ds-concept-grid">
        <a
          href="#array-provider"
          class="ds-concept-card"
        >
          <span class="ds-concept-card__icon">
            <svg
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            ><ellipse
              cx="10"
              cy="5"
              rx="6"
              ry="2.5"
            /><path d="M4 5v5c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V5" /><path d="M4 10v5c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-5" /></svg>
          </span>
          <h3 class="ds-concept-card__title">Pluggable providers</h3>
          <p class="ds-concept-card__desc">Array, callback, or custom. One interface, swap without changing your template.</p>
        </a>
        <a
          href="#page-pagination"
          class="ds-concept-card"
        >
          <span class="ds-concept-card__icon">
            <svg
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            ><rect
              x="3"
              y="4"
              width="14"
              height="12"
              rx="1.5"
            /><path d="M8 4v12M13 4v12" /></svg>
          </span>
          <h3 class="ds-concept-card__title">Dual pagination</h3>
          <p class="ds-concept-card__desc">Page numbers for admin tables. Cursor / infinite scroll for feeds.</p>
        </a>
        <a
          href="#state-queryparams"
          class="ds-concept-card"
        >
          <span class="ds-concept-card__icon">
            <svg
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            ><path d="M3 10a7 7 0 0 1 12-5l2-1" /><path d="M17 10a7 7 0 0 1-12 5l-2 1" /><path d="M17 4v3h-3M3 16v-3h3" /></svg>
          </span>
          <h3 class="ds-concept-card__title">State persistence</h3>
          <p class="ds-concept-card__desc">InMemory, URL params, localStorage, or hash. Plug in or swap freely.</p>
        </a>
      </div>

      <section
        id="api"
        class="demo-section"
      >
        <h2>API Reference</h2>
        <p>
          The full surface of the <code>&lt;Grid&gt;</code> component: props you pass in, slots you can override,
          and events you can listen to. Anything that says "scope" is the v-slot scope object.
        </p>

        <h3 class="ds-api-heading">
          Props
        </h3>
        <div
          class="ds-api-table-wrap"
          tabindex="0"
          role="region"
          aria-label="Grid props"
        >
          <table class="ds-api-table">
            <thead>
              <tr>
                <th>Prop</th>
                <th>Type</th>
                <th>Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>dataProvider</code></td>
                <td><code>DataProvider&lt;T&gt;</code></td>
                <td><span class="ds-api-required">required</span></td>
                <td>Data source. Implementations include <code>ArrayDataProvider</code>, <code>CallbackDataProvider</code>, <code>ElasticSearchDataProvider</code>, and any custom class implementing the <code>DataProvider</code> interface.</td>
              </tr>
              <tr>
                <td><code>columns</code></td>
                <td><code>Column&lt;T&gt;[]</code></td>
                <td><span class="ds-api-required">required</span></td>
                <td>Column definitions. See the <a href="#api-columns">Column</a> table below.</td>
              </tr>
              <tr>
                <td><code>rowOptions</code></td>
                <td><code>(model: T) =&gt; RowOptions</code></td>
                <td>—</td>
                <td>Per-row class / style / attribute resolver. Use it to highlight selection or dim inactive rows.</td>
              </tr>
              <tr>
                <td><code>onRowClick</code></td>
                <td><code>(model: T) =&gt; void</code></td>
                <td>—</td>
                <td>Click handler attached to every <code>&lt;tr&gt;</code>. Rows become focusable and also activate with Enter or Space.</td>
              </tr>
              <tr>
                <td><code>showLoader</code></td>
                <td><code>boolean</code></td>
                <td><code>true</code></td>
                <td>Shows the built-in loader row (or the <code>#loader</code> slot) while a load is running.</td>
              </tr>
              <tr>
                <td><code>showFooter</code></td>
                <td><code>boolean</code></td>
                <td><code>true</code></td>
                <td>Renders the column footer row (<code>&lt;tfoot&gt;</code>) when at least one visible column defines <code>footer</code>. Set <code>false</code> to hide it.</td>
              </tr>
              <tr>
                <td><code>emptyText</code></td>
                <td><code>string</code></td>
                <td><code>'No results found'</code></td>
                <td>Default empty-state text. Override the whole UI with the <code>#empty</code> slot.</td>
              </tr>
              <tr>
                <td><code>autoLoad</code></td>
                <td><code>boolean</code></td>
                <td><code>true</code></td>
                <td>Loads data on mount. Set <code>false</code> to load lazily.</td>
              </tr>
              <tr>
                <td><code>rowKeyField</code></td>
                <td><code>string</code></td>
                <td><code>'id'</code></td>
                <td>Item field that identifies a row: the rows' Vue <code>:key</code> and, when <code>rowKey</code> is not set, the key for per-row state (expansion, selection).</td>
              </tr>
              <tr>
                <td><code>rowKey</code></td>
                <td><code>(item: T) =&gt; RowKey | undefined</code></td>
                <td>—</td>
                <td>Row identity resolver for per-row state. Falls back to <code>item[rowKeyField]</code>.</td>
              </tr>
              <tr>
                <td><code>childrenField</code></td>
                <td><code>string | ((item: T) =&gt; T[] | undefined)</code></td>
                <td><code>'children'</code></td>
                <td>Where a row's nested child rows live: a field name or an accessor. Used by the expandable tree.</td>
              </tr>
              <tr>
                <td><code>rowStateProvider</code></td>
                <td><code>RowStateProvider</code></td>
                <td>new <code>InMemoryRowStateProvider</code> per Grid</td>
                <td>Store for per-row flags such as <code>expanded</code> and <code>selected</code>. Pass your own to share or persist them.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 class="ds-api-heading">
          Slots
        </h3>
        <div
          class="ds-api-table-wrap"
          tabindex="0"
          role="region"
          aria-label="Grid slots"
        >
          <table class="ds-api-table">
            <thead>
              <tr>
                <th>Slot</th>
                <th>Scope</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>#toolbar</code></td>
                <td><code>{ loading }</code></td>
                <td>Renders first, above <code>#search</code> and the table. The Grid provides its data provider and state here, so <code>&lt;ResetButton&gt;</code> works inside it.</td>
              </tr>
              <tr>
                <td><code>#search</code></td>
                <td><code>{ provider, loading }</code></td>
                <td>Area above the table — drop in your global search or filters here.</td>
              </tr>
              <tr>
                <td><code>#table</code></td>
                <td><code>{ items, loading, columns, rowOptions, onRowClick, onSort, sortState }</code></td>
                <td>Replace the entire table renderer. Use this when you want to swap to <code>&lt;a-table&gt;</code>, <code>&lt;el-table&gt;</code>, or your own markup.</td>
              </tr>
              <tr>
                <td><code>#searchRow</code></td>
                <td><code>{ columns, stateProvider }</code></td>
                <td>Replace the per-column filter row inside the default table.</td>
              </tr>
              <tr>
                <td><code>#headerCell</code></td>
                <td><code>{ column, colIndex, sortState, onSort }</code></td>
                <td>Replace the content of each header cell (the <code>&lt;th&gt;</code> stays).</td>
              </tr>
              <tr>
                <td><code>#row</code></td>
                <td><code>{ items }</code></td>
                <td>Replace the row-rendering loop. Useful for grouped rows, virtual rows, or collapsible details.</td>
              </tr>
              <tr>
                <td><code>#empty</code></td>
                <td>—</td>
                <td>Empty-state UI when there are no items.</td>
              </tr>
              <tr>
                <td><code>#loader</code></td>
                <td>—</td>
                <td>Custom loader UI shown while loading when <code>showLoader</code> is on.</td>
              </tr>
              <tr>
                <td><code>#expandedRow</code></td>
                <td><code>{ item, depth, rowKey, toggle }</code></td>
                <td>Full-width row rendered under an expanded row, for content that does not share the parent's columns.</td>
              </tr>
              <tr>
                <td><code>#pagination</code></td>
                <td><code>{ pagination, setPage }</code></td>
                <td>Pagination renderer, shown when the provider has page (offset) pagination. Pair with the lib's <code>&lt;PagePagination&gt;</code> or your own.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 class="ds-api-heading">
          Events
        </h3>
        <div
          class="ds-api-table-wrap"
          tabindex="0"
          role="region"
          aria-label="Grid events"
        >
          <table class="ds-api-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Payload</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>@loaded</code></td>
                <td>—</td>
                <td>Fires after each Grid-initiated load (mount, sort, page or filter change). Not fired when you call <code>provider.refresh()</code> yourself.</td>
              </tr>
              <tr>
                <td><code>@error</code></td>
                <td><code>Error</code></td>
                <td>Fires when a Grid-initiated load rejects.</td>
              </tr>
              <tr>
                <td><code>@expand</code></td>
                <td><code>(item: T, { depth, rowKey })</code></td>
                <td>A row was expanded with the <code>expandToggle</code> chevron. Load and attach its children here.</td>
              </tr>
              <tr>
                <td><code>@collapse</code></td>
                <td><code>(item: T, { depth, rowKey })</code></td>
                <td>A row was collapsed with the <code>expandToggle</code> chevron.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3
          id="api-columns"
          class="ds-api-heading"
        >
          Column
        </h3>
        <p>
          Cell, header, footer and <code>ComponentOptions.content</code> values render as plain text, so markup in your
          data is shown, never executed. To render trusted HTML, return a native element with
          <code>props: { innerHTML }</code> from <code>component</code>, e.g.
          <code>{ is: 'span', props: { innerHTML: html } }</code>, and sanitize it yourself; <code>content</code> and
          <code>children</code> are ignored when <code>innerHTML</code> is set.
        </p>
        <div
          class="ds-api-table-wrap"
          tabindex="0"
          role="region"
          aria-label="Column fields"
        >
          <table class="ds-api-table">
            <thead>
              <tr>
                <th>Field</th>
                <th>Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>key</code></td>
                <td><code>string</code></td>
                <td>Item field shown in the cell when <code>value</code> is not set; also the filter name fallback.</td>
              </tr>
              <tr>
                <td><code>label</code></td>
                <td><code>string | ((models: T[]) =&gt; string)</code></td>
                <td>Header text. Defaults to <code>sort</code>.</td>
              </tr>
              <tr>
                <td><code>labelComponent</code></td>
                <td><code>ComponentOptions</code></td>
                <td>Renders the header of a non-sortable column as a component instead of <code>label</code>.</td>
              </tr>
              <tr>
                <td><code>value</code></td>
                <td><code>(model: T, index: number) =&gt; string | number | boolean | null | undefined</code></td>
                <td>Cell text; <code>null</code> and <code>undefined</code> render empty. Without it the <code>key</code> field is shown (dates as ISO strings).</td>
              </tr>
              <tr>
                <td><code>show</code></td>
                <td><code>(model: T) =&gt; boolean</code></td>
                <td>Hides the cell content for rows where it returns <code>false</code>.</td>
              </tr>
              <tr>
                <td><code>showColumn</code></td>
                <td><code>boolean | (() =&gt; boolean)</code></td>
                <td>Hides the whole column when <code>false</code>.</td>
              </tr>
              <tr>
                <td><code>component</code></td>
                <td><code>(model: T, index: number, rowContext?: RowContext) =&gt; ComponentOptions</code></td>
                <td>Renders the cell as a component. <code>rowContext</code> gives access to per-row state (expansion, selection).</td>
              </tr>
              <tr>
                <td><code>footer</code></td>
                <td><code>(models: T[]) =&gt; string</code></td>
                <td>Footer cell text for the current items; any column with <code>footer</code> shows the footer row.</td>
              </tr>
              <tr>
                <td><code>footerOptions</code></td>
                <td><code>(models: T[]) =&gt; Record&lt;string, unknown&gt;</code></td>
                <td>Class / style / attributes for the footer cell.</td>
              </tr>
              <tr>
                <td><code>action</code></td>
                <td><code>(model: T) =&gt; void</code></td>
                <td>Cell click handler; the cell becomes focusable and also activates with Enter or Space.</td>
              </tr>
              <tr>
                <td><code>sort</code></td>
                <td><code>string</code></td>
                <td>Sort field. Makes the header a sort button.</td>
              </tr>
              <tr>
                <td><code>options</code></td>
                <td><code>(model: T) =&gt; Record&lt;string, unknown&gt;</code></td>
                <td>Class / style / attributes for the cell.</td>
              </tr>
              <tr>
                <td><code>filter</code></td>
                <td><code>{ name, type?, placeholder?, options? }</code></td>
                <td>Adds an input to the filter row (shown when the provider has a state provider). <code>type: 'text'</code> or <code>'select'</code> with <code>options: { value, label }[]</code>; <code>placeholder</code> defaults to the column label. The filter row has one cell per visible column.</td>
              </tr>
              <tr>
                <td><code>expandToggle</code></td>
                <td><code>boolean</code></td>
                <td>Prepends the expand chevron and depth indent to this column's cells. Set it on one column.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 class="ds-api-heading">
          Imperative refresh
        </h3>
        <p>
          The grid does not expose a <code>refresh()</code> method on the component instance. Hold a reference
          to your <code>DataProvider</code> and call <code>provider.refresh()</code> directly — that's the
          single source of truth for re-fetching data, and the same method the grid uses internally.
          The grid shows the new items; <code>@loaded</code> fires only for loads the grid starts itself.
        </p>
        <pre class="ds-code-inline"><code>// after a mutation
await dataProvider.refresh()</code></pre>
      </section>

      <section
        id="basic"
        class="demo-section"
      >
        <h2>Basic Example</h2>
        <p>
          The most minimal setup: pass an <code>ArrayDataProvider</code> and a column definition.
          No pagination, no sorting setup — just data on screen.
        </p>
        <ExampleFrame
          file="BasicExample.vue"
          :source="basicSource"
        >
          <BasicExample />
        </ExampleFrame>
      </section>

      <section
        id="array-provider"
        class="demo-section"
      >
        <h2>Array Provider</h2>
        <p>
          <code>ArrayDataProvider</code> handles client-side pagination, sorting, and filtering without a backend.
          Perfect for datasets up to thousands of rows. Click column headers to sort; use <code>PagePagination</code>
          in the <code>#pagination</code> slot for numbered pages.
        </p>
        <ExampleFrame
          file="ArrayProviderExample.vue"
          :source="arrayProviderSource"
        >
          <ArrayProviderExample />
        </ExampleFrame>
      </section>

      <section
        id="callback-provider"
        class="demo-section"
      >
        <h2>Callback Provider</h2>
        <p>
          <code>CallbackDataProvider</code> with an async <code>loadFn</code>: a mock server (250 ms latency) does
          search, sort and pagination. The grid sends the sort (column headers), the filters (search box) and the
          page, and renders the pager from the returned <code>totalItems</code>. Replace the mock with a
          <code>fetch()</code> to your API.
        </p>
        <ExampleFrame
          file="HttpProviderExample.vue"
          :source="httpProviderSource"
        >
          <HttpProviderExample />
        </ExampleFrame>
      </section>

      <section
        id="state-inmemory"
        class="demo-section"
      >
        <h2>InMemory State Provider</h2>
        <p>
          State lives in memory for the lifetime of the page. Filters, sort, and page reset on refresh.
          Useful for temporary filtering or when you own state externally.
        </p>
        <ExampleFrame
          file="InMemoryStateExample.vue"
          :source="inMemoryStateSource"
        >
          <InMemoryStateExample />
        </ExampleFrame>
      </section>

      <section
        id="state-localstorage"
        class="demo-section"
      >
        <h2>LocalStorage State Provider</h2>
        <p>
          State is persisted to <code>localStorage</code> and survives page refreshes and browser sessions.
          Sort or filter, then refresh — your preferences are restored automatically.
        </p>
        <div class="ds-callout ds-callout--note">
          <span class="ds-callout__icon">i</span>
          <div class="ds-callout__body">
            <div class="ds-callout__title">
              Persistent preferences
            </div>
            <p class="ds-callout__text">
              Try sorting or filtering, then refresh the page. Your state will be restored from <code>localStorage</code> key <code>grid-demo-state</code>.
            </p>
          </div>
        </div>
        <ExampleFrame
          file="LocalStorageStateExample.vue"
          :source="localStorageStateSource"
        >
          <LocalStorageStateExample />
        </ExampleFrame>
      </section>

      <section
        id="state-queryparams"
        class="demo-section"
      >
        <h2>QueryParams State Provider</h2>
        <p>
          State is stored in URL query parameters with a <code>qp-</code> prefix. Filter or sort and watch
          the address bar update. Share the URL to bookmark a specific filtered view.
        </p>
        <div class="ds-callout ds-callout--tip">
          <span class="ds-callout__icon">✓</span>
          <div class="ds-callout__body">
            <div class="ds-callout__title">
              Shareable URLs
            </div>
            <p class="ds-callout__text">
              Notice the URL updates as you interact. The provider writes with <code>router.replace</code>, so it adds no
              history entries of its own; it follows every route change, so opening a shared link or going back/forward
              between entries your app pushes restores that state. Requires Vue Router.
            </p>
          </div>
        </div>
        <ExampleFrame
          file="QueryParamsStateExample.vue"
          :source="queryParamsStateSource"
        >
          <QueryParamsStateExample />
        </ExampleFrame>
      </section>

      <section
        id="state-hash"
        class="demo-section"
      >
        <h2>Hash State Provider</h2>
        <p>
          State is stored in the URL hash fragment with a <code>hash-</code> prefix. Similar to QueryParams
          but does not interfere with server-side query parameters or other URL-driven components.
        </p>
        <ExampleFrame
          file="HashStateExample.vue"
          :source="hashStateSource"
        >
          <HashStateExample />
        </ExampleFrame>
      </section>

      <section
        id="multi-state"
        class="demo-section"
      >
        <h2>Multi-State</h2>
        <p>
          Multiple grids on one page, each with independent URL-persisted state. The <code>products</code> prefix
          drives the first grid; the <code>users</code> prefix drives the second. No state bleeding between them.
        </p>
        <div class="ds-callout ds-callout--note">
          <span class="ds-callout__icon">i</span>
          <div class="ds-callout__body">
            <div class="ds-callout__title">
              Independent prefixes
            </div>
            <p class="ds-callout__text">
              Sort, filter or page either grid — each writes only its own prefixed URL params, so they never collide.
            </p>
          </div>
        </div>
        <ExampleFrame
          file="MultiStateExample.vue"
          :source="multiStateSource"
        >
          <MultiStateExample />
        </ExampleFrame>
      </section>

      <section
        id="page-pagination"
        class="demo-section"
      >
        <h2>Page Pagination</h2>
        <p>
          Traditional numbered pagination via the <code>PagePagination</code> component in the
          <code>#pagination</code> slot. Shows page numbers, prev/next, and an optional summary line.
          47 rows at 10 per page gives 5 pages.
        </p>
        <ExampleFrame
          file="PagePaginationExample.vue"
          :source="pagePaginationSource"
        >
          <PagePaginationExample />
        </ExampleFrame>
      </section>

      <section
        id="cursor-pagination"
        class="demo-section"
      >
        <h2>Cursor Pagination (Load More)</h2>
        <p>
          Cursor-based pagination with a "Load More" button. Ideal for infinite-scroll interfaces and
          mobile-friendly experiences where numbered pages feel unnatural. 35 products, 8 per load.
        </p>
        <ExampleFrame
          file="CursorPaginationExample.vue"
          :source="cursorPaginationSource"
        >
          <CursorPaginationExample />
        </ExampleFrame>
      </section>

      <section
        id="scroll-pagination"
        class="demo-section"
      >
        <h2>Infinite Scroll Pagination (10,000 rows)</h2>
        <p>
          <code>CallbackDataProvider</code> serves a sliding window over 10,000 rows. Search and sort (the select
          or the column headers) run on the whole dataset and persist in the URL via
          <code>QueryParamsStateProvider</code>. Scroll down to load more — no button needed.
        </p>
        <ExampleFrame
          file="ScrollPaginationExample.vue"
          :source="scrollPaginationSource"
        >
          <ScrollPaginationExample />
        </ExampleFrame>
      </section>

      <section
        id="sorting"
        class="demo-section"
      >
        <h2>Sorting</h2>
        <p>
          Click column headers to toggle ascending/descending sort. Use the dropdown to sort by a field
          not shown in the table (position). Default order is by ID ascending.
        </p>
        <ExampleFrame
          file="SortingExample.vue"
          :source="sortingSource"
        >
          <SortingExample />
        </ExampleFrame>
      </section>

      <section
        id="search-sort"
        class="demo-section"
      >
        <h2>Search &amp; Sort</h2>
        <p>
          Global search filters by a hidden field (email) while column-level filters target individual
          columns. Demonstrates combining external search with per-column filter inputs.
        </p>
        <ExampleFrame
          file="SearchSortExample.vue"
          :source="searchSortSource"
        >
          <SearchSortExample />
        </ExampleFrame>
      </section>

      <section
        id="custom-columns"
        class="demo-section"
      >
        <h2>Custom Columns</h2>
        <p>
          Use the <code>component</code> and <code>value</code> column properties to render badges,
          progress bars, and formatted text. The <code>component</code> function returns a
          <code>ComponentOptions</code> descriptor; the library handles mounting. Values and <code>content</code>
          render as plain text; for trusted, sanitized HTML pass <code>props: { innerHTML }</code> on a native element.
        </p>
        <ExampleFrame
          file="CustomColumnsExample.vue"
          :source="customColumnsSource"
        >
          <CustomColumnsExample />
        </ExampleFrame>
      </section>

      <section
        id="row-actions"
        class="demo-section"
      >
        <h2>Row Actions</h2>
        <p>
          Pass <code>:on-row-click</code> to handle row selection. Use <code>:row-options</code> to apply
          dynamic classes or styles per row — useful for highlighting the selected row or dimming inactive entries.
        </p>
        <ExampleFrame
          file="RowActionsExample.vue"
          :source="rowActionsSource"
        >
          <RowActionsExample />
        </ExampleFrame>
      </section>

      <section
        id="customizing"
        class="demo-section"
      >
        <h2>Customizing</h2>
        <p>
          Slots are the customization layer. Replace the <code>#empty</code>, <code>#loader</code>, or
          <code>#pagination</code> UI without forking — or take over <code>#row</code> / <code>#table</code>
          to swap the entire renderer. Wrappers around other UI kits (an Ant Design table via <code>#table</code>,
          a custom filter row via <code>#searchRow</code>) are built on the same primitives.
        </p>
        <ExampleFrame
          file="CustomizingExample.vue"
          :source="customizingSource"
        >
          <CustomizingExample />
        </ExampleFrame>
      </section>

      <section
        id="expandable-rows"
        class="demo-section"
      >
        <h2>Expandable Rows (lazy tree)</h2>
        <p>
          Mark a column with <code>expandToggle: true</code> to render a chevron + indent.
          The grid emits <code>@expand</code> with the clicked item; the consumer fetches children
          and writes them into the whole dataset with <code>provider.setAllItems(updateNode(provider.getAllItems(), ...))</code>,
          which stays correct even if the page changes while children load. (<code>provider.setRows(rows)</code> replaces
          only the currently displayed rows.) Expansion state lives in an
          <code>InMemoryRowStateProvider</code> keyed by <code>:row-key</code>, so it survives
          pagination, sort, and filter changes within the session.
        </p>
        <ExampleFrame
          file="ExpandableRowsExample.vue"
          :source="expandableRowsSource"
        >
          <ExpandableRowsExample />
        </ExampleFrame>
      </section>

      <section
        id="mass-action"
        class="demo-section"
      >
        <h2>Mass Action / Selection</h2>
        <p>
          The same <code>RowStateProvider</code> primitive that drives expansion handles arbitrary
          per-row flags. Here a checkbox column uses <code>RowContext.rowState.toggle('selected')</code>;
          the toolbar reads <code>rowState.entries('selected')</code> for bulk actions. Selection
          persists across pagination — keyed by row id, not position.
        </p>
        <ExampleFrame
          file="MassActionExample.vue"
          :source="massActionSource"
        >
          <MassActionExample />
        </ExampleFrame>
      </section>

      <section
        id="expanded-row-slot"
        class="demo-section"
      >
        <h2>Custom expanded content (#expandedRow)</h2>
        <p>
          When children don't share the parent's schema — e.g. an order expanding into a line-items
          table — render arbitrary content with the <code>#expandedRow</code> slot. The slot
          receives <code>{ item, depth, rowKey, toggle }</code>. Use the homogeneous tree
          (<code>:children-field</code>) for same-shape children, the slot for everything else.
          The two are independent and can be combined.
        </p>
        <ExampleFrame
          file="ExpandedRowSlotExample.vue"
          :source="expandedRowSlotSource"
        >
          <ExpandedRowSlotExample />
        </ExampleFrame>
      </section>

      <div class="ds-page-end">
        <a
          href="https://github.com/einhasad/vue-datatable"
          target="_blank"
          rel="noopener"
        >Edit on GitHub ↗</a>
      </div>
    </main>
  </div>

  <footer class="ds-footer">
    <div class="ds-footer__inner">
      <div class="ds-footer__brand">
        <a
          class="ds-header__brand"
          :href="docsRoot"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            aria-hidden="true"
          >
            <rect
              width="22"
              height="22"
              rx="5"
              fill="#FFC833"
            />
            <rect
              x="5"
              y="7"
              width="12"
              height="1.5"
              rx="0.75"
              fill="#1A1505"
            />
            <rect
              x="5"
              y="10.25"
              width="12"
              height="1.5"
              rx="0.75"
              fill="#1A1505"
            />
            <rect
              x="5"
              y="13.5"
              width="7"
              height="1.5"
              rx="0.75"
              fill="#1A1505"
            />
          </svg>
          <span class="ds-header__wordmark"><span class="ds-header__wordmark-scope">@einhasad-vue/</span>datatable-vue</span>
        </a>
        <p>A DataTable for Vue 3 that handles the boring parts. MIT licensed.</p>
      </div>
      <div class="ds-footer__col">
        <h4>Docs</h4>
        <ul>
          <li><a href="#basic">Basic Example</a></li>
          <li><a href="#array-provider">Array Provider</a></li>
          <li><a href="#page-pagination">Pagination</a></li>
        </ul>
      </div>
      <div class="ds-footer__col">
        <h4>State</h4>
        <ul>
          <li><a href="#state-inmemory">InMemory</a></li>
          <li><a href="#state-queryparams">QueryParams</a></li>
          <li><a href="#state-hash">Hash</a></li>
        </ul>
      </div>
      <div class="ds-footer__col">
        <h4>Community</h4>
        <ul>
          <li>
            <a
              href="https://github.com/einhasad/vue-datatable"
              target="_blank"
              rel="noopener"
            >GitHub</a>
          </li>
          <li>
            <a
              href="https://github.com/einhasad/vue-datatable/issues"
              target="_blank"
              rel="noopener"
            >Issues</a>
          </li>
        </ul>
      </div>
    </div>
    <div class="ds-footer__legal">
      <span>© {{ year }} einhasad · MIT</span>
      <span>Built with datatable-vue itself.</span>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import ExampleFrame from './components/ExampleFrame.vue'
import BasicExample from './components/BasicExample.vue'
import ArrayProviderExample from './components/ArrayProviderExample.vue'
import HttpProviderExample from './components/HttpProviderExample.vue'
import InMemoryStateExample from './components/InMemoryStateExample.vue'
import LocalStorageStateExample from './components/LocalStorageStateExample.vue'
import QueryParamsStateExample from './components/QueryParamsStateExample.vue'
import HashStateExample from './components/HashStateExample.vue'
import MultiStateExample from './components/MultiStateExample.vue'
import PagePaginationExample from './components/PagePaginationExample.vue'
import CursorPaginationExample from './components/CursorPaginationExample.vue'
import ScrollPaginationExample from './components/ScrollPaginationExample.vue'
import SortingExample from './components/SortingExample.vue'
import SearchSortExample from './components/SearchSortExample.vue'
import CustomColumnsExample from './components/CustomColumnsExample.vue'
import RowActionsExample from './components/RowActionsExample.vue'
import CustomizingExample from './components/CustomizingExample.vue'
import ExpandableRowsExample from './components/ExpandableRowsExample.vue'
import ExpandedRowSlotExample from './components/ExpandedRowSlotExample.vue'
import MassActionExample from './components/MassActionExample.vue'

import basicSource from './components/BasicExample.vue?raw'
import arrayProviderSource from './components/ArrayProviderExample.vue?raw'
import httpProviderSource from './components/HttpProviderExample.vue?raw'
import inMemoryStateSource from './components/InMemoryStateExample.vue?raw'
import localStorageStateSource from './components/LocalStorageStateExample.vue?raw'
import queryParamsStateSource from './components/QueryParamsStateExample.vue?raw'
import hashStateSource from './components/HashStateExample.vue?raw'
import multiStateSource from './components/MultiStateExample.vue?raw'
import pagePaginationSource from './components/PagePaginationExample.vue?raw'
import cursorPaginationSource from './components/CursorPaginationExample.vue?raw'
import scrollPaginationSource from './components/ScrollPaginationExample.vue?raw'
import sortingSource from './components/SortingExample.vue?raw'
import searchSortSource from './components/SearchSortExample.vue?raw'
import customColumnsSource from './components/CustomColumnsExample.vue?raw'
import rowActionsSource from './components/RowActionsExample.vue?raw'
import customizingSource from './components/CustomizingExample.vue?raw'
import expandableRowsSource from './components/ExpandableRowsExample.vue?raw'
import expandedRowSlotSource from './components/ExpandedRowSlotExample.vue?raw'
import massActionSource from './components/MassActionExample.vue?raw'
import { version, peerDependencies } from '../package.json'

interface NavLink {
  id: string
  title: string
}

interface NavGroup {
  label: string
  links: NavLink[]
}

const navGroups: NavGroup[] = [
  {
    label: 'Getting started',
    links: [
      { id: 'introduction', title: 'Introduction' },
      { id: 'api', title: 'API Reference' },
      { id: 'basic', title: 'Basic Example' }
    ]
  },
  {
    label: 'Data providers',
    links: [
      { id: 'array-provider', title: 'Array Provider' },
      { id: 'callback-provider', title: 'Callback Provider' }
    ]
  },
  {
    label: 'State providers',
    links: [
      { id: 'state-inmemory', title: 'InMemory' },
      { id: 'state-localstorage', title: 'LocalStorage' },
      { id: 'state-queryparams', title: 'QueryParams' },
      { id: 'state-hash', title: 'Hash' },
      { id: 'multi-state', title: 'Multi-State' }
    ]
  },
  {
    label: 'Pagination',
    links: [
      { id: 'page-pagination', title: 'Page Pagination' },
      { id: 'cursor-pagination', title: 'Cursor / Load More' },
      { id: 'scroll-pagination', title: 'Infinite Scroll' }
    ]
  },
  {
    label: 'Columns & UX',
    links: [
      { id: 'sorting', title: 'Sorting' },
      { id: 'search-sort', title: 'Search & Sort' },
      { id: 'custom-columns', title: 'Custom Columns' },
      { id: 'row-actions', title: 'Row Actions' },
      { id: 'customizing', title: 'Customizing' }
    ]
  },
  {
    label: 'Row state',
    links: [
      { id: 'expandable-rows', title: 'Expandable Rows' },
      { id: 'mass-action', title: 'Mass Action / Selection' },
      { id: 'expanded-row-slot', title: 'Custom expanded content' }
    ]
  }
]

const sectionIds = navGroups.flatMap(group => group.links.map(link => link.id))

const docsRoot = import.meta.env.BASE_URL
const vueRange = peerDependencies.vue
const year = new Date().getFullYear()

const activeSection = ref('introduction')
const menuOpen = ref(false)
const menuButton = ref<HTMLButtonElement | null>(null)

const installCommand = 'npm install @einhasad-vue/datatable-vue'
const installCopied = ref(false)
let installCopiedTimer: ReturnType<typeof setTimeout> | null = null

async function copyInstallCommand(): Promise<void> {
  try {
    if ('clipboard' in navigator) {
      await navigator.clipboard.writeText(installCommand)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = installCommand
      textarea.setAttribute('readonly', '')
      textarea.style.position = 'absolute'
      textarea.style.left = '-9999px'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    installCopied.value = true
    if (installCopiedTimer) clearTimeout(installCopiedTimer)
    installCopiedTimer = setTimeout(() => {
      installCopied.value = false
    }, 1500)
  } catch {
    installCopied.value = false
  }
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function scrollTo(id: string): void {
  menuOpen.value = false
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
    activeSection.value = id
  }
}

function closeMenuOnEscape(event: KeyboardEvent): void {
  if (event.key === 'Escape' && menuOpen.value) {
    menuOpen.value = false
    menuButton.value?.focus()
  }
}

function updateActiveSection(): void {
  const scrollPosition = window.scrollY + 150
  for (let i = sectionIds.length - 1; i >= 0; i--) {
    const section = document.getElementById(sectionIds[i])
    if (section && section.offsetTop <= scrollPosition) {
      activeSection.value = sectionIds[i]
      break
    }
  }
}

onMounted(() => {
  window.addEventListener('scroll', updateActiveSection)
  document.addEventListener('keydown', closeMenuOnEscape)
  updateActiveSection()
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateActiveSection)
  document.removeEventListener('keydown', closeMenuOnEscape)
  if (installCopiedTimer) clearTimeout(installCopiedTimer)
})
</script>

<style>
.ds-callout__text {
  margin: 0;
}

.ds-page-end {
  margin-top: 56px;
  padding: 20px 0;
  border-top: 1px solid var(--line);
  display: flex;
  justify-content: flex-end;
  font-size: 13px;
}

.ds-app .ds-page-end a {
  color: var(--ink-2);
}
</style>
