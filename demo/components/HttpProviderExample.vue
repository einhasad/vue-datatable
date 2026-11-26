<template>
  <form
    class="demo-controls"
    role="search"
    aria-label="Repositories"
    @submit.prevent="commitSearch"
  >
    <div class="demo-control-group">
      <label for="repo-search">Search repositories</label>
      <div class="ds-row">
        <input
          id="repo-search"
          v-model="searchTerm"
          type="search"
          placeholder="e.g. vue table"
          class="demo-input"
        >
        <button
          type="submit"
          class="ds-btn ds-btn--outline ds-btn--sm"
        >
          Search
        </button>
      </div>
    </div>
  </form>

  <Grid
    :data-provider="repositoryProvider"
    :columns="repositoryColumns"
  >
    <template #pagination="{ pagination, setPage }">
      <PagePagination
        :current-page="pagination.currentPage"
        :total-pages="pagination.totalPages"
        :total-items="pagination.totalItems"
        :items-per-page="pagination.pageSize"
        :max-visible-pages="5"
        show-summary
        @page-change="setPage"
      />
    </template>
  </Grid>
</template>

<script setup lang="ts">
import {
  CallbackDataProvider,
  Grid,
  InMemoryStateProvider,
  PagePagination,
  useFilterField,
  type Column
} from '@einhasad-vue/datatable-vue'
import { fetchRepositories, type Repository } from '../data/mockRepositories'

const stateProvider = new InMemoryStateProvider()
stateProvider.setSort('stars', 'desc')

const repositoryProvider = new CallbackDataProvider<Repository>({
  stateProvider,
  loadFn: async ({ sortField, sortOrder, searchParams }, _keyset, offset) => {
    const response = await fetchRepositories({
      search: searchParams?.q ?? '',
      sortField,
      sortOrder,
      page: offset?.page ?? 1,
      perPage: offset?.pageSize ?? 20
    })
    return { items: response.items, pagination: { totalItems: response.total } }
  },
  offsetPaginationFn: () => {}
})
repositoryProvider.setOffsetPagination({ page: 1, pageSize: 20 })

const { localValue: searchTerm, commit: commitSearch } = useFilterField({ stateProvider, filterName: 'q' })

const repositoryColumns: Column<Repository>[] = [
  { key: 'fullName', label: 'Repository', sort: 'name' },
  { key: 'description', label: 'Description' },
  { key: 'language', label: 'Language' },
  { key: 'stars', label: 'Stars', sort: 'stars', value: (repo) => repo.stars.toLocaleString('en-US') },
  { key: 'forks', label: 'Forks', sort: 'forks', value: (repo) => repo.forks.toLocaleString('en-US') },
  { key: 'updatedAt', label: 'Updated', sort: 'updated' }
]
</script>
