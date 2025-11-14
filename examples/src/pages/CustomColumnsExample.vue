<template>
  <div>
    <h2>Custom Columns Example</h2>

    <div class="example-description">
      <p>
        This example shows how to customize column rendering using the 'value' and 'component' properties.
        You can format data, add badges, buttons, and any custom content.
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
      <pre class="code-block"><code>&lt;script setup lang="ts"&gt;
import { Grid, ArrayDataProvider, type Column } from '@grid-vue/grid'

const tasks = [
  { id: 1, title: 'Update documentation', priority: 'high', status: 'completed', progress: 100 },
  { id: 2, title: 'Fix login bug', priority: 'critical', status: 'in_progress', progress: 75 },
  { id: 3, title: 'Add dark mode', priority: 'medium', status: 'in_progress', progress: 40 },
  { id: 4, title: 'Optimize performance', priority: 'low', status: 'pending', progress: 0 },
  { id: 5, title: 'Write tests', priority: 'high', status: 'in_progress', progress: 60 }
]

const provider = new ArrayDataProvider({
  items: tasks,
  pagination: false,
  paginationMode: 'cursor'
})

const columns: Column[] = [
  { key: 'id', label: 'ID' },
  { key: 'title', label: 'Task' },
  {
    key: 'priority',
    label: 'Priority',
    component: (row) => ({
      is: 'span',
      props: {
        style: {
          padding: '0.25rem 0.5rem',
          borderRadius: '0.25rem',
          fontSize: '0.875rem',
          fontWeight: 'bold',
          background: getPriorityColor(row.priority),
          color: 'white'
        }
      },
      content: row.priority.toUpperCase()
    })
  },
  {
    key: 'status',
    label: 'Status',
    value: (row) => row.status.replace('_', ' ').toUpperCase()
  },
  {
    key: 'progress',
    label: 'Progress',
    component: (row) => ({
      is: 'div',
      props: { style: { width: '100%' } },
      children: [
        {
          is: 'div',
          props: {
            style: {
              width: '100%',
              height: '20px',
              background: '#e2e8f0',
              borderRadius: '10px',
              overflow: 'hidden'
            }
          },
          children: [
            {
              is: 'div',
              props: {
                style: {
                  width: row.progress + '%',
                  height: '100%',
                  background: '#667eea',
                  transition: 'width 0.3s'
                }
              }
            }
          ]
        },
        {
          is: 'span',
          props: {
            style: {
              fontSize: '0.75rem',
              color: '#4a5568',
              marginTop: '0.25rem',
              display: 'block'
            }
          },
          content: row.progress + '%'
        }
      ]
    })
  }
]

function getPriorityColor(priority: string) {
  const colors = {
    critical: '#e53e3e',
    high: '#dd6b20',
    medium: '#d69e2e',
    low: '#38a169'
  }
  return colors[priority] || '#718096'
}
&lt;/script&gt;</code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Grid, ArrayDataProvider, type Column } from '@grid-vue/grid'

const tasks = [
  { id: 1, title: 'Update documentation', priority: 'high', status: 'completed', progress: 100 },
  { id: 2, title: 'Fix login bug', priority: 'critical', status: 'in_progress', progress: 75 },
  { id: 3, title: 'Add dark mode', priority: 'medium', status: 'in_progress', progress: 40 },
  { id: 4, title: 'Optimize performance', priority: 'low', status: 'pending', progress: 0 },
  { id: 5, title: 'Write tests', priority: 'high', status: 'in_progress', progress: 60 }
]

const provider = new ArrayDataProvider({
  items: tasks,
  pagination: false,
  paginationMode: 'cursor'
})

const columns: Column[] = [
  { key: 'id', label: 'ID' },
  { key: 'title', label: 'Task' },
  {
    key: 'priority',
    label: 'Priority',
    component: (row) => ({
      is: 'span',
      props: {
        style: {
          padding: '0.25rem 0.5rem',
          borderRadius: '0.25rem',
          fontSize: '0.875rem',
          fontWeight: 'bold',
          background: getPriorityColor(row.priority),
          color: 'white'
        }
      },
      content: row.priority.toUpperCase()
    })
  },
  {
    key: 'status',
    label: 'Status',
    value: (row) => row.status.replace('_', ' ').toUpperCase()
  },
  {
    key: 'progress',
    label: 'Progress',
    component: (row) => ({
      is: 'div',
      props: { style: { width: '100%' } },
      children: [
        {
          is: 'div',
          props: {
            style: {
              width: '100%',
              height: '20px',
              background: '#e2e8f0',
              borderRadius: '10px',
              overflow: 'hidden'
            }
          },
          children: [
            {
              is: 'div',
              props: {
                style: {
                  width: row.progress + '%',
                  height: '100%',
                  background: '#667eea',
                  transition: 'width 0.3s'
                }
              }
            }
          ]
        },
        {
          is: 'span',
          props: {
            style: {
              fontSize: '0.75rem',
              color: '#4a5568',
              marginTop: '0.25rem',
              display: 'block'
            }
          },
          content: row.progress + '%'
        }
      ]
    })
  }
]

function getPriorityColor(priority: string) {
  const colors: Record<string, string> = {
    critical: '#e53e3e',
    high: '#dd6b20',
    medium: '#d69e2e',
    low: '#38a169'
  }
  return colors[priority] || '#718096'
}
</script>
