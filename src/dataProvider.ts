import { inject, provide, type InjectionKey } from 'vue'
import type { DataProvider } from './types'

const GRID_DATA_PROVIDER_KEY: InjectionKey<DataProvider> = Symbol('gridDataProvider')

export function provideGridDataProvider<T>(provider: DataProvider<T>): void {
  provide(GRID_DATA_PROVIDER_KEY, provider)
}

export function useGridDataProvider<T>(): DataProvider<T> | undefined {
  return inject(GRID_DATA_PROVIDER_KEY, undefined) as DataProvider<T> | undefined
}
