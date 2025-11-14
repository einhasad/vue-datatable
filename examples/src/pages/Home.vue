<template>
  <div class="home">
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
      <div class="code-block">npm install @grid-vue/grid</div>
      <p>Then import the CSS in your main entry file:</p>
      <div class="code-block">import '@grid-vue/grid/style.css'</div>
    </div>

    <div class="example-section">
      <h3>Examples</h3>
      <div class="examples-grid">
        <router-link to="/basic" class="example-card">
          <h4>Basic Usage</h4>
          <p>Simple grid with minimal configuration</p>
        </router-link>
        <router-link to="/page-pagination" class="example-card">
          <h4>Page Pagination</h4>
          <p>Traditional page-based pagination (1, 2, 3...)</p>
        </router-link>
        <router-link to="/cursor-pagination" class="example-card">
          <h4>Cursor Pagination</h4>
          <p>Load more / infinite scroll pattern</p>
        </router-link>
        <router-link to="/sorting" class="example-card">
          <h4>Sorting</h4>
          <p>Sortable columns with asc/desc order</p>
        </router-link>
        <router-link to="/custom-columns" class="example-card">
          <h4>Custom Columns</h4>
          <p>Custom cell rendering with components</p>
        </router-link>
        <router-link to="/row-actions" class="example-card">
          <h4>Row Actions</h4>
          <p>Interactive rows with click handlers</p>
        </router-link>
      </div>
    </div>

    <div class="example-section">
      <h3>Quick Links</h3>
      <div class="actions">
        <a href="https://github.com/einhasad/vue-datatable" target="_blank" class="btn">
          View on GitHub
        </a>
        <a href="https://www.npmjs.com/package/@grid-vue/grid" target="_blank" class="btn btn-secondary">
          View on npm
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero {
  text-align: center;
  margin-bottom: 2rem;
  padding: 2rem;
}

.hero h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.examples-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.example-card {
  padding: 1.5rem;
  background: #f7fafc;
  border-radius: 0.5rem;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.example-card:hover {
  background: #edf2f7;
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.example-card h4 {
  margin: 0 0 0.5rem;
  color: #667eea;
}

.example-card p {
  margin: 0;
  font-size: 0.875rem;
}
</style>
