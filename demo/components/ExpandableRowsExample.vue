<template>
  <Grid
    :data-provider="provider"
    :columns="columns"
    :row-key="(item) => item.id"
    children-field="children"
    @expand="handleExpand"
    @collapse="handleCollapse"
  />
</template>

<script setup lang="ts">
import { Grid, ArrayDataProvider, type Column } from '@einhasad-vue/datatable-vue'

interface Node { id: string; name: string; children?: Node[] }

const tree: Node[] = [
  { id: '1', name: 'Root A' },
  { id: '2', name: 'Root B' },
  { id: '3', name: 'Root C' },
]

const provider = new ArrayDataProvider<Node>({ items: tree })

const columns: Column<Node>[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name', expandToggle: true },
]

function fetchChildren(parent: Node): Promise<Node[]> {
  return new Promise(resolve => setTimeout(() => {
    resolve([
      { id: `${parent.id}.1`, name: `${parent.name} child 1` },
      { id: `${parent.id}.2`, name: `${parent.name} child 2` },
    ])
  }, 250))
}

async function handleExpand(item: Node) {
  const children = await fetchChildren(item)
  const current = provider.getCurrentItems()
  const updated = updateNode(current, item.id, (n) => ({ ...n, children }))
  provider.updateRows(updated)
}

function handleCollapse(item: Node) {
  const current = provider.getCurrentItems()
  const updated = updateNode(current, item.id, (n) => ({ ...n, children: undefined }))
  provider.updateRows(updated)
}

function updateNode(items: Node[], id: string, mapFn: (n: Node) => Node): Node[] {
  return items.map(it => {
    if (it.id === id) return mapFn(it)
    if (it.children) return { ...it, children: updateNode(it.children, id, mapFn) }
    return it
  })
}
</script>
