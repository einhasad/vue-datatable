import type { InjectionKey } from 'vue'
import type { RowStateProvider } from '../types'

export const rowStateInjectionKey: InjectionKey<RowStateProvider> = Symbol('rowState')
