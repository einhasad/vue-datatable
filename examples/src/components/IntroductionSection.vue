<template>
  <section id="introduction" class="section">
    <div class="hero">
      <h2>Welcome to Grid Vue Examples</h2>
      <p>
        Explore interactive examples demonstrating the features and capabilities of Grid Vue,
        a flexible and configurable grid component library for Vue 3 applications.
      </p>
    </div>

    <div class="example-section">
      <h3>Features</h3>
      <ul class="feature-list">
        <li>Dual Pagination Modes: Cursor-based (Load More) and page-based (1, 2, 3...)</li>
        <li>Data Provider Pattern: Pluggable data sources (HTTP, Array, custom)</li>
        <li>State Provider Pattern: Pluggable state management (URL, localStorage, hash, in-memory)</li>
        <li>Framework Agnostic: No dependencies on UI frameworks</li>
        <li>TypeScript First: Full TypeScript support</li>
        <li>Customizable: Extensive props, slots, and CSS custom properties</li>
        <li>Sorting: Built-in column sorting support</li>
        <li>Footer Row: Calculations and aggregations</li>
        <li>Row & Cell Options: Custom classes, styles, and attributes</li>
        <li>Dynamic Components: Render custom components in cells</li>
      </ul>
    </div>

    <div class="example-section">
      <h3>Installation</h3>
      <div class="code-block">npm install @einhasad-vue/datatable-vue</div>
      <p>Then import the CSS in your main entry file:</p>
      <div class="code-block">import '@einhasad-vue/datatable-vue/grid-default-styles.css'</div>
    </div>

    <div class="example-section">
      <h3>Quick Links</h3>
      <div class="actions">
        <a href="https://github.com/einhasad/vue-datatable" target="_blank" class="btn">
          View on GitHub
        </a>
        <a href="https://www.npmjs.com/package/@einhasad-vue/datatable-vue" target="_blank" class="btn btn-secondary">
          View on npm
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.section {
  margin-bottom: 4rem;
  scroll-margin-top: 2rem;
}

.hero {
  text-align: center;
  margin-bottom: 2rem;
  padding: 2rem;
}

.hero h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.feature-list {
  line-height: 1.8;
}

.feature-list li {
  margin-bottom: 0.5rem;
}

.example-section {
  margin-bottom: 2rem;
}

.actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: var(--grid-button-active-color, white);
  text-decoration: none;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.btn:hover {
  background: #5a67d8;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn-secondary {
  background: #48bb78;
}

.btn-secondary:hover {
  background: #38a169;
}

.code-block {
  background: #2d3748;
  color: var(--grid-cell-color, #e2e8f0);
  padding: 1rem;
  border-radius: 0.375rem;
  overflow-x: auto;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
}
</style>
