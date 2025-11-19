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
      <div class="code-block">npm install @grid-vue/grid</div>
      <p>Then import the CSS in your main entry file:</p>
      <div class="code-block">import '@grid-vue/grid/style.css'</div>
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
  </section>
</template>

<style scoped>
.section {
  margin-bottom: 3rem;
}

.hero {
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  padding: 2rem;
  border-radius: 0.5rem;
  margin-bottom: 2rem;
}

.hero h2 {
  margin: 0 0 1rem;
  font-size: 2rem;
  color: #2d3748;
}

.hero p {
  margin: 0;
  font-size: 1.1rem;
  color: #4a5568;
}

.example-section {
  margin: 2rem 0;
}

.example-section h3 {
  font-size: 1.5rem;
  color: #2d3748;
  margin-bottom: 1rem;
}

.feature-list {
  list-style: none;
  padding: 0;
}

.feature-list li {
  padding: 0.5rem 0;
  color: #4a5568;
  position: relative;
  padding-left: 1.5rem;
}

.feature-list li:before {
  content: "✓";
  position: absolute;
  left: 0;
  color: #667eea;
  font-weight: bold;
}

.code-block {
  background: #2d3748;
  color: #68d391;
  padding: 1rem;
  border-radius: 0.25rem;
  font-family: monospace;
  margin: 0.5rem 0;
  overflow-x: auto;
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
  color: white;
  text-decoration: none;
  border-radius: 0.25rem;
  transition: background 0.2s;
}

.btn:hover {
  background: #5568d3;
}

.btn-secondary {
  background: #48bb78;
}

.btn-secondary:hover {
  background: #38a169;
}
</style>
