<script setup lang="ts">
import { Grid, ArrayDataProvider, type Column } from '@einhasad-vue/datatable-vue'

interface Repo {
  id: number
  name: string
}

const provider = new ArrayDataProvider<Repo>({ items: [{ id: 1, name: 'grid' }] })
const columns: Column<Repo>[] = [{ key: 'name', label: 'Name' }]
</script>

<template>
  <Grid
    :data-provider="provider"
    :columns="columns"
    show-loader
  />
  <!-- @vue-expect-error wrong prop type must be reported in templates -->
  <Grid
    :data-provider="provider"
    :columns="columns"
    :show-loader="'yes'"
  />
</template>
