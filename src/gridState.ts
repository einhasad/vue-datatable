import { inject, provide, type InjectionKey } from 'vue'
import type { StateProvider } from './state/StateProvider'

const GRID_STATE_KEY: InjectionKey<StateProvider> = Symbol('gridState')

export function provideGridState(stateProvider: StateProvider | undefined): void {
  provide<StateProvider | undefined>(GRID_STATE_KEY as InjectionKey<StateProvider | undefined>, stateProvider)
}

export function useGridState(): StateProvider | undefined {
  return inject(GRID_STATE_KEY, undefined)
}
