<template>
  <div>
    <h2>{{ metadata.title }}</h2>

    <div class="example-description">
      <p>{{ metadata.description }}</p>
    </div>

    <div class="example-notice">
      <strong>✅ Living Documentation:</strong> This code is extracted from tests and guaranteed to work!
      <br>
      <small>Source: <code>__tests__/examples/basicExample.ts</code></small>
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
  </div>
</template>

<script setup lang="ts">
import { Grid } from '@grid-vue/grid'
import { basicExample } from '../../../__tests__/examples/basicExample'
import extractedExamples from '../generated/extracted-examples.json'

// Get the working code from tests (single source of truth)
const metadata = basicExample
const { provider, columns } = basicExample.setupCode()

// Get the extracted code for display
const extractedCode = extractedExamples.basicExample
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
