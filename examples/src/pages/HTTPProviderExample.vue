<template>
  <div>
    <h2>HTTP Provider Example</h2>

    <div class="example-description">
      <p>
        The <strong>HttpDataProvider</strong> is designed for fetching data from REST APIs.
        It supports both cursor-based and page-based pagination, custom HTTP clients, response adapters,
        and automatic URL parameter management. This example shows how to configure it with a mock HTTP client
        to simulate API responses.
      </p>
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
import { Grid, HttpDataProvider, type Column, type ResponseAdapter } from '@grid-vue/grid'

// Custom response adapter for your API format
const customAdapter: ResponseAdapter = {
  extractItems: (response) =&gt; response.data || [],
  extractPagination: (response) =&gt; ({
    currentPage: response.page || 1,
    pageCount: response.totalPages || 1,
    pageSize: response.pageSize || 10,
    totalCount: response.total || 0
  }),
  isSuccess: (response) =&gt; response.success === true,
  getErrorMessage: (response) =&gt; response.error || 'Unknown error'
}

// Mock HTTP client that simulates API responses
const mockHttpClient = async (url: string) =&gt; {
  await new Promise(resolve =&gt; setTimeout(resolve, 500)) // Simulate network delay

  const mockUsers = [
    { id: 1, username: 'alice_smith', email: 'alice@company.com', status: 'Active' },
    { id: 2, username: 'bob_jones', email: 'bob@company.com', status: 'Active' },
    { id: 3, username: 'charlie_brown', email: 'charlie@company.com', status: 'Inactive' },
    { id: 4, username: 'diana_prince', email: 'diana@company.com', status: 'Active' },
    { id: 5, username: 'edward_norton', email: 'edward@company.com', status: 'Active' }
  ]

  return {
    success: true,
    data: mockUsers,
    page: 1,
    totalPages: 1,
    pageSize: 10,
    total: mockUsers.length
  }
}

// Configure HttpDataProvider
const provider = new HttpDataProvider({
  url: '/api/users',
  pagination: true,
  paginationMode: 'page',
  pageSize: 10,
  httpClient: mockHttpClient,
  responseAdapter: customAdapter,
  headers: {
    'Authorization': 'Bearer token123'
  }
})

const columns: Column[] = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'username', label: 'Username', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'status', label: 'Status', sortable: true }
]
&lt;/script&gt;</code></pre>
    </div>

    <div class="example-section">
      <h3>Key Features</h3>
      <ul>
        <li><strong>REST API integration:</strong> Fetch data from any HTTP endpoint</li>
        <li><strong>Custom HTTP clients:</strong> Use fetch, axios, or any other HTTP library</li>
        <li><strong>Response adapters:</strong> Transform API responses to match your data format</li>
        <li><strong>Flexible pagination:</strong> Supports both cursor and page-based modes</li>
        <li><strong>URL parameter sync:</strong> Automatically manages query parameters for filtering and sorting</li>
        <li><strong>Custom headers:</strong> Add authentication tokens and other headers</li>
      </ul>
    </div>

    <div class="example-section">
      <h3>Real-World Example</h3>
      <pre class="code-block"><code>// Using with a real API endpoint
import axios from 'axios'

const provider = new HttpDataProvider({
  url: 'https://api.example.com/users',
  pagination: true,
  paginationMode: 'page',
  pageSize: 20,
  httpClient: async (url) =&gt; {
    const response = await axios.get(url)
    return response.data
  },
  responseAdapter: customAdapter,
  headers: {
    'Authorization': `Bearer ${authToken}`
  }
})</code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Grid, HttpDataProvider, type Column, type ResponseAdapter } from '@grid-vue/grid'

// Custom response adapter for your API format
const customAdapter: ResponseAdapter = {
  extractItems: (response) => response.data || [],
  extractPagination: (response) => ({
    currentPage: response.page || 1,
    pageCount: response.totalPages || 1,
    pageSize: response.pageSize || 10,
    totalCount: response.total || 0
  }),
  isSuccess: (response) => response.success === true,
  getErrorMessage: (response) => response.error || 'Unknown error'
}

// Mock HTTP client that simulates API responses
const mockHttpClient = async (url: string) => {
  await new Promise(resolve => setTimeout(resolve, 500)) // Simulate network delay

  const mockUsers = [
    { id: 1, username: 'alice_smith', email: 'alice@company.com', status: 'Active' },
    { id: 2, username: 'bob_jones', email: 'bob@company.com', status: 'Active' },
    { id: 3, username: 'charlie_brown', email: 'charlie@company.com', status: 'Inactive' },
    { id: 4, username: 'diana_prince', email: 'diana@company.com', status: 'Active' },
    { id: 5, username: 'edward_norton', email: 'edward@company.com', status: 'Active' }
  ]

  return {
    success: true,
    data: mockUsers,
    page: 1,
    totalPages: 1,
    pageSize: 10,
    total: mockUsers.length
  }
}

// Configure HttpDataProvider
const provider = new HttpDataProvider({
  url: '/api/users',
  pagination: true,
  paginationMode: 'page',
  pageSize: 10,
  httpClient: mockHttpClient,
  responseAdapter: customAdapter,
  headers: {
    'Authorization': 'Bearer token123'
  }
})

const columns: Column[] = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'username', label: 'Username', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'status', label: 'Status', sortable: true }
]
</script>
