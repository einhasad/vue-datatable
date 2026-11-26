import {
  Grid,
  ArrayDataProvider,
  PagePagination,
  type Column,
  type DataProvider
} from '@einhasad-vue/datatable-vue'

interface Repo {
  id: number
  name: string
}

const provider = new ArrayDataProvider<Repo>({ items: [{ id: 1, name: 'grid' }] })
const columns: Column<Repo>[] = [{ key: 'name', label: 'Name', value: (repo) => repo.name }]

type GridProps = Parameters<typeof Grid<Repo>>[0]

export const validProps: GridProps = { dataProvider: provider, columns, showLoader: true }

// @ts-expect-error wrong prop type must not collapse to any
export const wrongPropType: GridProps = { dataProvider: provider, columns, showLoader: 'yes' }

// @ts-expect-error missing required prop must be reported
export const missingRequiredProp: GridProps = { columns }

export const typedProvider: DataProvider<Repo> = provider

// @ts-expect-error column value receives the item type
export const wrongColumn: Column<Repo> = { key: 'id', value: (repo) => repo.missing }

export { PagePagination }
