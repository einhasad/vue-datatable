import { ref, watch, computed } from 'vue'
import type { StateProvider } from '../state/StateProvider'

export interface UseFilterFieldOptions {
  stateProvider: StateProvider
  filterName: string
  defaultValue?: string
  /** true (default): localValue edits reach stateProvider only on commit() (blur/enter). false: every localValue edit is committed. */
  lazy?: boolean
}

export function useFilterField(options: UseFilterFieldOptions): {
  currentValue: ReturnType<typeof ref<string>>
  localValue: ReturnType<typeof computed<string>>
  setFilter: (value: string) => void
  clearFilter: () => void
  commit: () => void
} {
  const { stateProvider, filterName, defaultValue, lazy = true } = options

  // Read initial value from stateProvider (which reads from URL via QueryParamsStateProvider)
  const currentValue = ref<string>(
    stateProvider.getFilter(filterName) ?? defaultValue ?? ''
  )

  // If default exists but no value in stateProvider, set it
  if (defaultValue && !stateProvider.getFilter(filterName)) {
    stateProvider.setFilter(filterName, defaultValue)
  }

  watch(
    () => stateProvider.getFilter(filterName),
    (newVal) => {
      currentValue.value = newVal ?? ''
    }
  )

  function setFilter(value: string): void {
    currentValue.value = value
    stateProvider.setFilter(filterName, value)
  }

  function clearFilter(): void {
    currentValue.value = ''
    stateProvider.clearFilter(filterName)
  }

  // For lazy mode (text inputs): edit locally, commit on blur/enter
  const localValue = computed({
    get: () => currentValue.value,
    set: (v: string) => {
      currentValue.value = v
      if (!lazy) commit()
    }
  })

  function commit(): void {
    if (currentValue.value.trim()) {
      stateProvider.setFilter(filterName, currentValue.value)
    } else {
      stateProvider.clearFilter(filterName)
    }
  }

  return { currentValue, localValue, setFilter, clearFilter, commit }
}
