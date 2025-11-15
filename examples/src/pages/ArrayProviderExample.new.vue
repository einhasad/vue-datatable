<template>
  <div>
    <h2>{{ metadata.title }}</h2>

    <div class="example-description">
      <p>{{ metadata.description }}</p>
    </div>

    <div class="example-notice">
      <strong>✅ Living Documentation:</strong> This code is extracted from tests and guaranteed to work!
      <br>
      <small>Source: <code>__tests__/examples/arrayProviderExample.ts</code></small>
    </div>

    <div class="example-section">
      <h3>Demo</h3>
      <Grid
        :data-provider="provider"
        :columns="columns"
      />
    </div>

    <div class="example-section">
      <h3>Code</h3>
      <pre class="code-block"><code>&lt;template&gt;
  &lt;Grid
    :data-provider="provider"
    :columns="columns"
  /&gt;
&lt;/template&gt;

&lt;script setup lang="ts"&gt;
{{ extractedCode.imports }}

{{ extractedCode.code }}
&lt;/script&gt;</code></pre>
    </div>

    <div class="example-section" v-if="metadata.features">
      <h3>Key Features</h3>
      <ul>
        <li v-for="feature in metadata.features" :key="feature">
          <strong>{{ feature.split(':')[0] }}:</strong>{{ feature.split(':')[1] }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Grid } from '@grid-vue/grid'
import { arrayProviderExample } from '../../../__tests__/examples/arrayProviderExample'
import extractedExamples from '../generated/extracted-examples.json'

// Get the working code from tests (single source of truth)
const metadata = arrayProviderExample
const { provider, columns } = arrayProviderExample.setupCode()

// Get the extracted code for display
const extractedCode = extractedExamples.arrayProviderExample
</script>

<style scoped>
.example-notice {
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
  padding: 12px;
  margin: 16px 0;
  color: #155724;
}

.example-notice code {
  background: #c3e6cb;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.9em;
}

.example-description {
  margin: 16px 0;
  font-size: 1.05em;
}

.example-section {
  margin: 24px 0;
}

.example-section ul {
  list-style: none;
  padding: 0;
}

.example-section li {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.example-section li:last-child {
  border-bottom: none;
}

.code-block {
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 16px;
  overflow-x: auto;
  font-size: 14px;
  line-height: 1.5;
}
</style>
